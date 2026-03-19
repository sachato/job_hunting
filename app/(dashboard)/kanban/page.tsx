import { Header } from "@/components/layout/Header";
import { KanbanBoard } from "@/components/candidatures/KanbanBoard";

export default function KanbanPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Pipeline Kanban"
        description="Glissez-déposez les candidatures pour changer leur statut"
      />
      <div className="flex-1 p-6 overflow-auto">
        <KanbanBoard />
      </div>
    </div>
  );
}
