import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { noteSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = noteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    // Vérifier que la candidature appartient à l'utilisateur
    const candidature = await prisma.candidature.findFirst({
      where: { id: parsed.data.candidatureId, userId: session.user.id },
    });

    if (!candidature) {
      return NextResponse.json({ error: "Candidature non trouvée" }, { status: 404 });
    }

    const note = await prisma.note.create({
      data: {
        candidatureId: parsed.data.candidatureId,
        contenu: parsed.data.contenu,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("POST /api/notes:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
