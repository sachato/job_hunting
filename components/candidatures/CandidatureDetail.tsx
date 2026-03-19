"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { getStatutColor, getStatutLabel, formatDate, formatSalaire, STATUTS, TYPES_RAPPEL } from "@/lib/utils";
import {
  Building2, Calendar, Euro, ExternalLink, Mail, Phone, User, Edit,
  Trash2, Plus, FileText, Bell, Check, Download, Upload, X, Loader2
} from "lucide-react";

type Candidature = {
  id: string;
  poste: string;
  statut: string;
  datePostulation: string;
  contact: string | null;
  emailContact: string | null;
  telephone: string | null;
  salairePropose: number | null;
  lienOffre: string | null;
  createdAt: string;
  entreprise: { nom: string; secteur: string | null; taille: string | null; siteWeb: string | null };
  notes: { id: string; contenu: string; createdAt: string }[];
  documents: { id: string; nom: string; url: string; type: string; createdAt: string }[];
  rappels: { id: string; date: string; type: string; message: string; status: string }[];
};

export function CandidatureDetail({ candidature: initial }: { candidature: Candidature }) {
  const router = useRouter();
  const [candidature, setCandidature] = useState(initial);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docType, setDocType] = useState("cv");
  const [showRappelForm, setShowRappelForm] = useState(false);
  const [rappelData, setRappelData] = useState({ date: "", type: "relance" as const, message: "" });
  const [addingRappel, setAddingRappel] = useState(false);

  const refresh = async () => {
    const res = await fetch(`/api/candidatures/${candidature.id}`);
    if (res.ok) {
      const data = await res.json();
      setCandidature(data);
    }
  };

  const handleStatutChange = async (statut: string) => {
    const res = await fetch(`/api/candidatures/${candidature.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    });
    if (res.ok) {
      setCandidature((prev) => ({ ...prev, statut }));
      toast({ title: "Statut mis à jour" });
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contenu: newNote, candidatureId: candidature.id }),
    });
    if (res.ok) {
      setNewNote("");
      await refresh();
      toast({ title: "Note ajoutée" });
    }
    setAddingNote(false);
  };

  const handleDeleteNote = async (id: string) => {
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCandidature((prev) => ({ ...prev, notes: prev.notes.filter((n) => n.id !== id) }));
      toast({ title: "Note supprimée" });
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true);
    const form = new FormData();
    form.append("file", file);
    form.append("candidatureId", candidature.id);
    form.append("type", docType);
    const res = await fetch("/api/documents", { method: "POST", body: form });
    if (res.ok) {
      await refresh();
      toast({ title: "Document uploadé" });
    } else {
      toast({ title: "Erreur upload", variant: "destructive" });
    }
    setUploadingDoc(false);
    e.target.value = "";
  };

  const handleDeleteDoc = async (id: string) => {
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCandidature((prev) => ({ ...prev, documents: prev.documents.filter((d) => d.id !== id) }));
      toast({ title: "Document supprimé" });
    }
  };

  const handleAddRappel = async () => {
    if (!rappelData.date || !rappelData.message) return;
    setAddingRappel(true);
    const res = await fetch("/api/rappels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...rappelData, candidatureId: candidature.id }),
    });
    if (res.ok) {
      await refresh();
      setRappelData({ date: "", type: "relance", message: "" });
      setShowRappelForm(false);
      toast({ title: "Rappel créé" });
    }
    setAddingRappel(false);
  };

  const handleRappelDone = async (id: string) => {
    const res = await fetch(`/api/rappels/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "fait" }),
    });
    if (res.ok) {
      setCandidature((prev) => ({
        ...prev,
        rappels: prev.rappels.map((r) => r.id === id ? { ...r, status: "fait" } : r),
      }));
      toast({ title: "Rappel marqué comme fait" });
    }
  };

  const handleDeleteRappel = async (id: string) => {
    const res = await fetch(`/api/rappels/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCandidature((prev) => ({ ...prev, rappels: prev.rappels.filter((r) => r.id !== id) }));
    }
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer définitivement cette candidature ?")) return;
    const res = await fetch(`/api/candidatures/${candidature.id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Candidature supprimée" });
      router.push("/candidatures");
      router.refresh();
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Colonne principale */}
      <div className="col-span-2 space-y-6">
        {/* Infos générales */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between pb-3">
            <div>
              <CardTitle className="text-lg">{candidature.poste}</CardTitle>
              <p className="text-muted-foreground mt-0.5">{candidature.entreprise.nom}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/candidatures/${candidature.id}/modifier`}>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-1" />
                  Modifier
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Statut :</span>
              <Select value={candidature.statut} onValueChange={handleStatutChange}>
                <SelectTrigger className="w-44 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Postulé le</span>
                <span className="font-medium">{formatDate(candidature.datePostulation)}</span>
              </div>
              {candidature.salairePropose && (
                <div className="flex items-center gap-2">
                  <Euro className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Salaire</span>
                  <span className="font-medium">{formatSalaire(candidature.salairePropose)}</span>
                </div>
              )}
              {candidature.entreprise.secteur && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Secteur</span>
                  <span className="font-medium">{candidature.entreprise.secteur}</span>
                </div>
              )}
              {candidature.entreprise.taille && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Taille</span>
                  <span className="font-medium">{candidature.entreprise.taille}</span>
                </div>
              )}
              {candidature.lienOffre && (
                <div className="flex items-center gap-2 col-span-2">
                  <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                  <a href={candidature.lienOffre} target="_blank" rel="noopener noreferrer"
                    className="text-primary hover:underline truncate">
                    Voir l&apos;offre
                  </a>
                </div>
              )}
            </div>

            {(candidature.contact || candidature.emailContact || candidature.telephone) && (
              <>
                <Separator />
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Contact recruteur</p>
                  {candidature.contact && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{candidature.contact}</span>
                    </div>
                  )}
                  {candidature.emailContact && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${candidature.emailContact}`} className="text-primary hover:underline">
                        {candidature.emailContact}
                      </a>
                    </div>
                  )}
                  {candidature.telephone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{candidature.telephone}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Notes ({candidature.notes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Ajouter une note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
              />
              <Button size="sm" onClick={handleAddNote} disabled={addingNote || !newNote.trim()}>
                {addingNote && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                <Plus className="w-3 h-3 mr-1" />
                Ajouter
              </Button>
            </div>
            {candidature.notes.length > 0 && <Separator />}
            <div className="space-y-3">
              {candidature.notes.map((note) => (
                <div key={note.id} className="border rounded-lg p-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm whitespace-pre-wrap flex-1">{note.contenu}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Documents ({candidature.documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cv">CV</SelectItem>
                  <SelectItem value="lettre">Lettre de motivation</SelectItem>
                  <SelectItem value="preparation">Préparation</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
              <Label
                htmlFor="file-upload"
                className={`flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background text-sm cursor-pointer hover:bg-accent transition-colors ${uploadingDoc ? "opacity-50 pointer-events-none" : ""}`}
              >
                {uploadingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Uploader un fichier
              </Label>
              <input id="file-upload" type="file" className="hidden" onChange={handleUpload} />
            </div>
            {candidature.documents.length > 0 && (
              <div className="space-y-2">
                {candidature.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{doc.nom}</p>
                        <p className="text-xs text-muted-foreground capitalize">{doc.type} • {formatDate(doc.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" download>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDeleteDoc(doc.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Colonne rappels */}
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Rappels
              </div>
              <Button size="sm" variant="outline" onClick={() => setShowRappelForm(!showRappelForm)}>
                <Plus className="w-3 h-3 mr-1" />
                Ajouter
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showRappelForm && (
              <div className="border rounded-lg p-3 space-y-3 bg-slate-50">
                <div className="space-y-1">
                  <Label className="text-xs">Date</Label>
                  <Input
                    type="datetime-local"
                    value={rappelData.date}
                    onChange={(e) => setRappelData((p) => ({ ...p, date: e.target.value }))}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={rappelData.type}
                    onValueChange={(v) => setRappelData((p) => ({ ...p, type: v as typeof rappelData.type }))}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPES_RAPPEL.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Message</Label>
                  <Textarea
                    value={rappelData.message}
                    onChange={(e) => setRappelData((p) => ({ ...p, message: e.target.value }))}
                    rows={2}
                    className="text-sm"
                    placeholder="Relancer pour..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddRappel} disabled={addingRappel}>
                    {addingRappel && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                    Créer
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowRappelForm(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            {candidature.rappels.length === 0 && !showRappelForm ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun rappel</p>
            ) : (
              <div className="space-y-2">
                {candidature.rappels.map((r) => (
                  <div
                    key={r.id}
                    className={`border rounded-lg p-3 space-y-1 ${r.status === "fait" ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium capitalize">{r.type}</p>
                      <div className="flex gap-1">
                        {r.status === "a_faire" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-green-600"
                            onClick={() => handleRappelDone(r.id)}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteRappel(r.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm">{r.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.date).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {r.status === "fait" && (
                      <span className="text-xs text-green-600 font-medium">✓ Fait</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
