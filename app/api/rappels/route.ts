import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rappelSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = rappelSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
    }

    const candidature = await prisma.candidature.findFirst({
      where: { id: parsed.data.candidatureId, userId: session.user.id },
    });

    if (!candidature) {
      return NextResponse.json({ error: "Candidature non trouvée" }, { status: 404 });
    }

    const rappel = await prisma.rappel.create({
      data: {
        candidatureId: parsed.data.candidatureId,
        date: new Date(parsed.data.date),
        type: parsed.data.type,
        message: parsed.data.message,
        status: "a_faire",
      },
    });

    return NextResponse.json(rappel, { status: 201 });
  } catch (error) {
    console.error("POST /api/rappels:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
