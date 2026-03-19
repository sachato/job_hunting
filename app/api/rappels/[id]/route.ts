import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const rappel = await prisma.rappel.findFirst({
      where: { id: params.id },
      include: { candidature: { select: { userId: true } } },
    });

    if (!rappel || rappel.candidature.userId !== session.user.id) {
      return NextResponse.json({ error: "Rappel non trouvé" }, { status: 404 });
    }

    const body = await req.json();
    const updated = await prisma.rappel.update({
      where: { id: params.id },
      data: { status: body.status ?? rappel.status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/rappels/[id]:", error);
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

    const rappel = await prisma.rappel.findFirst({
      where: { id: params.id },
      include: { candidature: { select: { userId: true } } },
    });

    if (!rappel || rappel.candidature.userId !== session.user.id) {
      return NextResponse.json({ error: "Rappel non trouvé" }, { status: 404 });
    }

    await prisma.rappel.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/rappels/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
