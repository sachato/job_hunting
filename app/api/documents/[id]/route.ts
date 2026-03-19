import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const document = await prisma.document.findFirst({
      where: { id: params.id },
      include: { candidature: { select: { userId: true } } },
    });

    if (!document || document.candidature.userId !== session.user.id) {
      return NextResponse.json({ error: "Document non trouvé" }, { status: 404 });
    }

    // Supprimer le fichier physique
    try {
      const filePath = path.join(process.cwd(), "public", document.url);
      await unlink(filePath);
    } catch {
      // Le fichier peut ne plus exister
    }

    await prisma.document.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/documents/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
