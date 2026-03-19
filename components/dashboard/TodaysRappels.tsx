"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { Bell, Check, Clock } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface Rappel {
  id: string;
  type: string;
  message: string;
  date: string;
  status: string;
  candidature: {
    id: string;
    poste: string;
    entreprise: { nom: string };
  };
}

export function TodaysRappels() {
  const [rappels, setRappels] = useState<Rappel[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setRappels(d.rappelsAujourdhui ?? []))
      .finally(() => setLoading(false));
  }, []);

  const markDone = async (id: string) => {
    const res = await fetch(`/api/rappels/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "fait" }),
    });
    if (res.ok) {
      setRappels((prev) => prev.filter((r) => r.id !== id));
      toast({ title: t.rappels.markedDone });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="w-4 h-4" />
          {t.rappels.title}
          {rappels.length > 0 && (
            <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {rappels.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : rappels.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">{t.rappels.empty}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rappels.map((r) => {
              const typeLabel = t.typesRappel[r.type as keyof typeof t.typesRappel] ?? r.type;
              return (
                <div key={r.id} className="border rounded-lg p-3 space-y-2">
                  <div>
                    <Link href={`/candidatures/${r.candidature.id}`} className="text-sm font-medium hover:underline">
                      {r.candidature.entreprise.nom}
                    </Link>
                    <p className="text-xs text-muted-foreground">{r.candidature.poste}</p>
                  </div>
                  <p className="text-sm">{r.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground capitalize">{typeLabel}</span>
                    <Button size="sm" variant="outline" onClick={() => markDone(r.id)} className="h-7 text-xs">
                      <Check className="w-3 h-3 mr-1" />
                      {t.rappels.done}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
