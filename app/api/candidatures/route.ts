import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { candidatureSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statut = searchParams.get("statut");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const sortBy = searchParams.get("sortBy") ?? "createdAt";
    const sortOrder = (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc";

    const where = {
      userId: session.user.id,
      ...(statut && statut !== "all" ? { statut } : {}),
      ...(search
        ? {
            OR: [
              { poste: { contains: search, mode: "insensitive" as const } },
              { entreprise: { nom: { contains: search, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    };

    const [candidatures, total] = await Promise.all([
      prisma.candidature.findMany({
        where,
        include: {
          entreprise: true,
          rappels: {
            where: { status: "a_faire" },
            orderBy: { date: "asc" },
            take: 1,
          },
          _count: { select: { notes: true, documents: true } },
        },
        orderBy: sortBy === "entreprise" ? { entreprise: { nom: sortOrder } } : { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.candidature.count({ where }),
    ]);

    return NextResponse.json({ candidatures, total, page, limit });
  } catch (error) {
    console.error("GET /api/candidatures:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = candidatureSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { entreprise: entrepriseData, ...candidatureData } = parsed.data;

    // Trouver ou créer l'entreprise
    let entreprise = await prisma.entreprise.findFirst({
      where: { nom: { equals: entrepriseData.nom, mode: "insensitive" } },
    });

    if (!entreprise) {
      entreprise = await prisma.entreprise.create({
        data: {
          nom: entrepriseData.nom,
          siteWeb: entrepriseData.siteWeb || null,
          secteur: entrepriseData.secteur || null,
          taille: entrepriseData.taille || null,
        },
      });
    }

    const candidature = await prisma.candidature.create({
      data: {
        userId: session.user.id,
        entrepriseId: entreprise.id,
        poste: candidatureData.poste,
        datePostulation: new Date(candidatureData.datePostulation),
        statut: candidatureData.statut,
        contact: candidatureData.contact || null,
        emailContact: candidatureData.emailContact || null,
        telephone: candidatureData.telephone || null,
        salairePropose: candidatureData.salairePropose ?? null,
        lienOffre: candidatureData.lienOffre || null,
      },
      include: { entreprise: true },
    });

    return NextResponse.json(candidature, { status: 201 });
  } catch (error) {
    console.error("POST /api/candidatures:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
