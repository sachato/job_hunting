"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { toast } from "@/components/ui/use-toast";
import { STATUTS, getStatutColor, formatDate } from "@/lib/utils";
import { Building2, Calendar, Euro, GripVertical } from "lucide-react";

interface Candidature {
  id: string;
  poste: string;
  statut: string;
  datePostulation: string;
  salairePropose: number | null;
  entreprise: { nom: string };
}

function KanbanCard({ candidature, isDragging = false }: { candidature: Candidature; isDragging?: boolean }) {
  return (
    <div
      className={`bg-white border rounded-lg p-3 space-y-2 shadow-sm ${isDragging ? "shadow-lg ring-2 ring-primary/20 opacity-90" : "hover:shadow-md"} transition-shadow`}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0 cursor-grab" />
        <div className="flex-1 min-w-0">
          <Link href={`/candidatures/${candidature.id}`}>
            <p className="font-medium text-sm hover:text-primary transition-colors truncate">{candidature.poste}</p>
          </Link>
          <p className="text-xs text-muted-foreground truncate">{candidature.entreprise.nom}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground pl-6">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(candidature.datePostulation)}
        </span>
        {candidature.salairePropose && (
          <span className="flex items-center gap-1">
            <Euro className="w-3 h-3" />
            {Math.round(candidature.salairePropose / 1000)}k
          </span>
        )}
      </div>
    </div>
  );
}

function DraggableCard({ candidature }: { candidature: Candidature }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: candidature.id,
    data: { candidature },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={isDragging ? "opacity-30" : ""}>
      <KanbanCard candidature={candidature} />
    </div>
  );
}

function KanbanColumn({
  statut,
  candidatures,
}: {
  statut: (typeof STATUTS)[number];
  candidatures: Candidature[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: statut.value });

  return (
    <div className="flex flex-col w-72 shrink-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statut.color}`}>
            {statut.label}
          </span>
          <span className="text-xs text-muted-foreground font-medium">{candidatures.length}</span>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={`kanban-column flex-1 min-h-[200px] max-h-[calc(100vh-280px)] overflow-y-auto space-y-2 p-2 rounded-lg border-2 transition-colors ${
          isOver ? "border-primary/30 bg-primary/5" : "border-transparent bg-slate-50"
        }`}
      >
        {candidatures.map((c) => (
          <DraggableCard key={c.id} candidature={c} />
        ))}
        {candidatures.length === 0 && (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-xs">
            <Building2 className="w-4 h-4 mr-1 opacity-30" />
            Vide
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    fetch("/api/candidatures?limit=200")
      .then((r) => r.json())
      .then((d) => setCandidatures(d.candidatures ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const candidature = candidatures.find((c) => c.id === active.id);
    const newStatut = over.id as string;

    if (!candidature || candidature.statut === newStatut) return;

    // Optimistic update
    setCandidatures((prev) =>
      prev.map((c) => (c.id === candidature.id ? { ...c, statut: newStatut } : c))
    );

    const res = await fetch(`/api/candidatures/${candidature.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: newStatut }),
    });

    if (!res.ok) {
      // Rollback
      setCandidatures((prev) =>
        prev.map((c) => (c.id === candidature.id ? { ...c, statut: candidature.statut } : c))
      );
      toast({ title: "Erreur", description: "Impossible de changer le statut", variant: "destructive" });
    } else {
      toast({ title: `Déplacé vers "${STATUTS.find((s) => s.value === newStatut)?.label}"` });
    }
  };

  const activeCandidature = activeId ? candidatures.find((c) => c.id === activeId) : null;

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUTS.map((s) => (
          <div key={s.value} className="w-72 shrink-0 h-96 bg-slate-50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-6">
        {STATUTS.map((statut) => (
          <KanbanColumn
            key={statut.value}
            statut={statut}
            candidatures={candidatures.filter((c) => c.statut === statut.value)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeCandidature && <KanbanCard candidature={activeCandidature} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
