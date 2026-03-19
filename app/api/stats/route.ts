import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;

    const [total, byStatut, rappelsAujourdhui, recentCandidatures] = await Promise.all([
      prisma.candidature.count({ where: { userId } }),

      prisma.candidature.groupBy({
        by: ["statut"],
        where: { userId },
        _count: { statut: true },
      }),

      prisma.rappel.findMany({
        where: {
          candidature: { userId },
          status: "a_faire",
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
        include: {
          candidature: { include: { entreprise: true } },
        },
        orderBy: { date: "asc" },
      }),

      prisma.candidature.findMany({
        where: { userId },
        include: { entreprise: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const statutMap = byStatut.reduce(
      (acc, item) => {
        acc[item.statut] = item._count.statut;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalPostule = total - (statutMap["envisage"] ?? 0);
    const totalReponses = (statutMap["entretien1"] ?? 0) +
      (statutMap["entretien2"] ?? 0) +
      (statutMap["offre"] ?? 0) +
      (statutMap["refus"] ?? 0);

    const tauxReponse = totalPostule > 0
      ? Math.round((totalReponses / totalPostule) * 100)
      : 0;

    return NextResponse.json({
      total,
      byStatut: statutMap,
      tauxReponse,
      rappelsAujourdhui,
      recentCandidatures,
    });
  } catch (error) {
    console.error("GET /api/stats:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
