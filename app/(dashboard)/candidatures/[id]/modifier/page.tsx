import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { CandidatureForm } from "@/components/candidatures/CandidatureForm";

export default async function ModifierCandidaturePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const candidature = await prisma.candidature.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { entreprise: true },
  });

  if (!candidature) notFound();

  const initialData = {
    id: candidature.id,
    poste: candidature.poste,
    datePostulation: candidature.datePostulation.toISOString(),
    statut: candidature.statut as "envisage" | "postule" | "entretien1" | "entretien2" | "offre" | "refus" | "archive",
    contact: candidature.contact ?? undefined,
    emailContact: candidature.emailContact ?? undefined,
    telephone: candidature.telephone ?? undefined,
    salairePropose: candidature.salairePropose ?? undefined,
    lienOffre: candidature.lienOffre ?? undefined,
    entreprise: {
      nom: candidature.entreprise.nom,
      siteWeb: candidature.entreprise.siteWeb ?? undefined,
      secteur: candidature.entreprise.secteur ?? undefined,
      taille: candidature.entreprise.taille ?? undefined,
    },
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Modifier la candidature" />
      <div className="flex-1 p-6 max-w-2xl">
        <CandidatureForm initialData={initialData} mode="edit" />
      </div>
    </div>
  );
}
