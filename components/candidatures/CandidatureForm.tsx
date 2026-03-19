"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { STATUTS } from "@/lib/utils";
import { candidatureSchema, type CandidatureFormData } from "@/lib/validations";
import { Loader2 } from "lucide-react";

interface CandidatureFormProps {
  initialData?: Partial<CandidatureFormData> & { id?: string };
  mode?: "create" | "edit";
}

export function CandidatureForm({ initialData, mode = "create" }: CandidatureFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statut, setStatut] = useState(initialData?.statut ?? "postule");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const data = {
      poste: form.get("poste") as string,
      datePostulation: form.get("datePostulation") as string,
      statut,
      contact: form.get("contact") as string || undefined,
      emailContact: form.get("emailContact") as string || undefined,
      telephone: form.get("telephone") as string || undefined,
      salairePropose: form.get("salairePropose") ? Number(form.get("salairePropose")) : null,
      lienOffre: form.get("lienOffre") as string || undefined,
      entreprise: {
        nom: form.get("entrepriseNom") as string,
        siteWeb: form.get("entrepriseSiteWeb") as string || undefined,
        secteur: form.get("entrepriseSecteur") as string || undefined,
        taille: form.get("entrepriseTaille") as string || undefined,
      },
    };

    const parsed = candidatureSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path.length > 0) fieldErrors[err.path.join(".")] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    const url = mode === "edit" && initialData?.id
      ? `/api/candidatures/${initialData.id}`
      : "/api/candidatures";
    const method = mode === "edit" ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    setLoading(false);

    if (!res.ok) {
      const json = await res.json();
      toast({ title: "Erreur", description: json.error ?? "Une erreur est survenue", variant: "destructive" });
      return;
    }

    const result = await res.json();
    toast({ title: mode === "edit" ? "Candidature mise à jour" : "Candidature créée avec succès" });
    router.push(`/candidatures/${result.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations sur l&apos;entreprise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="entrepriseNom">Nom de l&apos;entreprise *</Label>
            <Input
              id="entrepriseNom"
              name="entrepriseNom"
              defaultValue={initialData?.entreprise?.nom}
              placeholder="ex: Google France"
              required
            />
            {errors["entreprise.nom"] && <p className="text-sm text-destructive">{errors["entreprise.nom"]}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entrepriseSecteur">Secteur</Label>
              <Input
                id="entrepriseSecteur"
                name="entrepriseSecteur"
                defaultValue={initialData?.entreprise?.secteur}
                placeholder="ex: Tech, Finance..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entrepriseTaille">Taille</Label>
              <Input
                id="entrepriseTaille"
                name="entrepriseTaille"
                defaultValue={initialData?.entreprise?.taille}
                placeholder="ex: 50-200, 1000+"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="entrepriseSiteWeb">Site web</Label>
            <Input
              id="entrepriseSiteWeb"
              name="entrepriseSiteWeb"
              type="url"
              defaultValue={initialData?.entreprise?.siteWeb}
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Détails de la candidature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="poste">Poste *</Label>
            <Input
              id="poste"
              name="poste"
              defaultValue={initialData?.poste}
              placeholder="ex: Développeur Full Stack Senior"
              required
            />
            {errors.poste && <p className="text-sm text-destructive">{errors.poste}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="datePostulation">Date de postulation *</Label>
              <Input
                id="datePostulation"
                name="datePostulation"
                type="date"
                defaultValue={
                  initialData?.datePostulation
                    ? new Date(initialData.datePostulation).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0]
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Statut *</Label>
              <Select value={statut} onValueChange={setStatut}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salairePropose">Salaire proposé (€/an)</Label>
              <Input
                id="salairePropose"
                name="salairePropose"
                type="number"
                defaultValue={initialData?.salairePropose ?? undefined}
                placeholder="ex: 55000"
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lienOffre">Lien de l&apos;offre</Label>
              <Input
                id="lienOffre"
                name="lienOffre"
                type="url"
                defaultValue={initialData?.lienOffre ?? undefined}
                placeholder="https://..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact recruteur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact">Nom du contact</Label>
            <Input
              id="contact"
              name="contact"
              defaultValue={initialData?.contact ?? undefined}
              placeholder="ex: Marie Dupont"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emailContact">Email</Label>
              <Input
                id="emailContact"
                name="emailContact"
                type="email"
                defaultValue={initialData?.emailContact ?? undefined}
                placeholder="recruteur@entreprise.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                name="telephone"
                defaultValue={initialData?.telephone ?? undefined}
                placeholder="06 12 34 56 78"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {mode === "edit" ? "Mettre à jour" : "Créer la candidature"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
