import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { candidatureSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const candidature = await prisma.candidature.findFirst({
      where: { id: params.id, userId: session.user.id },
      include: {
        entreprise: true,
        notes: { orderBy: { createdAt: "desc" } },
        documents: { orderBy: { createdAt: "desc" } },
        rappels: { orderBy: { date: "asc" } },
      },
    });

    if (!candidature) {
      return NextResponse.json({ error: "Candidature non trouvée" }, { status: 404 });
    }

    return NextResponse.json(candidature);
  } catch (error) {
    console.error("GET /api/candidatures/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const existing = await prisma.candidature.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Candidature non trouvée" }, { status: 404 });
    }

    const body = await req.json();

    // Patch partiel pour le statut (Kanban)
    if (body.statut && Object.keys(body).length === 1) {
      const statutSchema = z.object({
        statut: z.enum(["envisage", "postule", "entretien1", "entretien2", "offre", "refus", "archive"]),
      });
      const parsed = statutSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
      }
      const updated = await prisma.candidature.update({
        where: { id: params.id },
        data: { statut: parsed.data.statut },
        include: { entreprise: true },
      });
      return NextResponse.json(updated);
    }

    const parsed = candidatureSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { entreprise: entrepriseData, ...candidatureData } = parsed.data;

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

    const updated = await prisma.candidature.update({
      where: { id: params.id },
      data: {
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/candidatures/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const existing = await prisma.candidature.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Candidature non trouvée" }, { status: 404 });
    }

    await prisma.candidature.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/candidatures/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
