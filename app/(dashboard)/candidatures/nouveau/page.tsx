import { Header } from "@/components/layout/Header";
import { CandidatureForm } from "@/components/candidatures/CandidatureForm";

export default function NouvelleCandidaturePage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Nouvelle candidature" description="Ajoutez une nouvelle candidature" />
      <div className="flex-1 p-6 max-w-2xl">
        <CandidatureForm />
      </div>
    </div>
  );
}
