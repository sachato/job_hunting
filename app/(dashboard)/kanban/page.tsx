import { Header } from "@/components/layout/Header";
import { KanbanBoard } from "@/components/candidatures/KanbanBoard";

export default function KanbanPage() {
  return (
    <div className="flex flex-col h-full">
      <Header pageKey="kanban" />
      <div className="flex-1 p-6 overflow-auto">
        <KanbanBoard />
      </div>
    </div>
  );
}
