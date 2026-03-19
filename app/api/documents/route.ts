import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const candidatureId = formData.get("candidatureId") as string | null;
    const type = formData.get("type") as string | null;

    if (!file || !candidatureId || !type) {
      return NextResponse.json({ error: "Fichier, candidature et type requis" }, { status: 400 });
    }

    // Vérifier que la candidature appartient à l'utilisateur
    const candidature = await prisma.candidature.findFirst({
      where: { id: candidatureId, userId: session.user.id },
    });

    if (!candidature) {
      return NextResponse.json({ error: "Candidature non trouvée" }, { status: 404 });
    }

    // Sauvegarder le fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", candidatureId);
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const url = `/uploads/${candidatureId}/${fileName}`;

    const document = await prisma.document.create({
      data: {
        candidatureId,
        nom: file.name,
        url,
        type,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("POST /api/documents:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
