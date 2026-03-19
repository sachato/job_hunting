import { Header } from "@/components/layout/Header";
import { CandidatureList } from "@/components/candidatures/CandidatureList";

export default function CandidaturesPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Candidatures"
        description="Gérez et suivez toutes vos candidatures"
      />
      <div className="flex-1 p-6">
        <CandidatureList />
      </div>
    </div>
  );
}
