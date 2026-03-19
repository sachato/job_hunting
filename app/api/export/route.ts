import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStatutLabel, formatDate } from "@/lib/utils";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const candidatures = await prisma.candidature.findMany({
      where: { userId: session.user.id },
      include: { entreprise: true },
      orderBy: { datePostulation: "desc" },
    });

    const headers = [
      "Entreprise",
      "Poste",
      "Statut",
      "Date de postulation",
      "Contact",
      "Email contact",
      "Téléphone",
      "Salaire proposé",
      "Lien offre",
      "Secteur",
      "Date création",
    ];

    const rows = candidatures.map((c) => [
      c.entreprise.nom,
      c.poste,
      getStatutLabel(c.statut),
      formatDate(c.datePostulation),
      c.contact ?? "",
      c.emailContact ?? "",
      c.telephone ?? "",
      c.salairePropose?.toString() ?? "",
      c.lienOffre ?? "",
      c.entreprise.secteur ?? "",
      formatDate(c.createdAt),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const bom = "\uFEFF"; // BOM pour Excel
    return new NextResponse(bom + csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="candidatures-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("GET /api/export:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
