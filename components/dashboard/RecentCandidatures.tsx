"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getStatutColor, getStatutLabel, formatDate } from "@/lib/utils";
import { ArrowRight, Building2 } from "lucide-react";

interface Candidature {
  id: string;
  poste: string;
  datePostulation: string;
  statut: string;
  entreprise: { nom: string; secteur: string | null };
}

export function RecentCandidatures() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setCandidatures(d.recentCandidatures ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Dernières candidatures</CardTitle>
        <Link href="/candidatures" className="text-sm text-primary hover:underline flex items-center gap-1">
          Voir tout <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : candidatures.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucune candidature pour l&apos;instant</p>
            <Link href="/candidatures/nouveau" className="text-primary text-sm hover:underline mt-1 inline-block">
              Ajouter votre première candidature
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {candidatures.map((c) => (
              <Link key={c.id} href={`/candidatures/${c.id}`}>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-semibold text-sm">
                      {c.entreprise.nom[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{c.poste}</p>
                    <p className="text-xs text-muted-foreground">{c.entreprise.nom} • {formatDate(c.datePostulation)}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${getStatutColor(c.statut)}`}>
                    {getStatutLabel(c.statut)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
