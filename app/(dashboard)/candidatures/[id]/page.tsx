import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { CandidatureDetail } from "@/components/candidatures/CandidatureDetail";

export default async function CandidaturePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const candidature = await prisma.candidature.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      entreprise: true,
      notes: { orderBy: { createdAt: "desc" } },
      documents: { orderBy: { createdAt: "desc" } },
      rappels: { orderBy: { date: "asc" } },
    },
  });

  if (!candidature) notFound();

  return (
    <div className="flex flex-col h-full">
      <Header
        title={`${candidature.poste} — ${candidature.entreprise.nom}`}
        description="Détail de la candidature"
      />
      <div className="flex-1 p-6">
        <CandidatureDetail candidature={JSON.parse(JSON.stringify(candidature))} />
      </div>
    </div>
  );
}
