"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { STATUTS, getStatutColor, getStatutLabel, formatDate, formatSalaire } from "@/lib/utils";
import {
  Plus, Search, ChevronUp, ChevronDown, ExternalLink,
  Trash2, Eye, ChevronLeft, ChevronRight, Building2
} from "lucide-react";

interface Candidature {
  id: string;
  poste: string;
  datePostulation: string;
  statut: string;
  salairePropose: number | null;
  lienOffre: string | null;
  createdAt: string;
  entreprise: { nom: string; secteur: string | null };
  _count: { notes: number; documents: number };
  rappels: { date: string; type: string }[];
}

type SortField = "createdAt" | "datePostulation" | "entreprise" | "poste" | "statut";

export function CandidatureList() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("all");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const limit = 15;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
      ...(search ? { search } : {}),
      ...(statut !== "all" ? { statut } : {}),
    });
    const res = await fetch(`/api/candidatures?${params}`);
    if (res.ok) {
      const data = await res.json();
      setCandidatures(data.candidatures);
      setTotal(data.total);
    }
    setLoading(false);
  }, [page, search, statut, sortBy, sortOrder]);

  useEffect(() => {
    const debounce = setTimeout(fetchData, 300);
    return () => clearTimeout(debounce);
  }, [fetchData]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleDelete = async (id: string, nom: string) => {
    if (!confirm(`Supprimer la candidature chez ${nom} ?`)) return;
    const res = await fetch(`/api/candidatures/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Candidature supprimée" });
      fetchData();
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher entreprise, poste..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={statut} onValueChange={(v) => { setStatut(v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {STATUTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Link href="/candidatures/nouveau">
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              Nouvelle candidature
            </Button>
          </Link>
        </div>
      </div>

      {/* Tableau */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              {[
                { field: "entreprise" as SortField, label: "Entreprise" },
                { field: "poste" as SortField, label: "Poste" },
                { field: "statut" as SortField, label: "Statut" },
                { field: "datePostulation" as SortField, label: "Date postulation" },
                { field: "createdAt" as SortField, label: "Ajouté le" },
              ].map(({ field, label }) => (
                <th
                  key={field}
                  className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none"
                  onClick={() => handleSort(field)}
                >
                  <span className="flex items-center gap-1">
                    {label}
                    <SortIcon field={field} />
                  </span>
                </th>
              ))}
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Salaire</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : candidatures.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>Aucune candidature trouvée</p>
                  <Link href="/candidatures/nouveau" className="text-primary hover:underline text-sm mt-1 inline-block">
                    Ajouter une candidature
                  </Link>
                </td>
              </tr>
            ) : (
              candidatures.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{c.entreprise.nom}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.poste}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatutColor(c.statut)}`}>
                      {getStatutLabel(c.statut)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(c.datePostulation)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatSalaire(c.salairePropose)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {c.lienOffre && (
                        <a href={c.lienOffre} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                      )}
                      <Link href={`/candidatures/${c.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(c.id, c.entreprise.nom)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{total} résultat{total > 1 ? "s" : ""}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span>
              Page {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
