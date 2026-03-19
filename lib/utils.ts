import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STATUTS = [
  { value: "envisage", label: "Envisagé", color: "bg-slate-100 text-slate-700" },
  { value: "postule", label: "Postulé", color: "bg-blue-100 text-blue-700" },
  { value: "entretien1", label: "Entretien 1", color: "bg-yellow-100 text-yellow-700" },
  { value: "entretien2", label: "Entretien 2", color: "bg-orange-100 text-orange-700" },
  { value: "offre", label: "Offre", color: "bg-green-100 text-green-700" },
  { value: "refus", label: "Refus", color: "bg-red-100 text-red-700" },
  { value: "archive", label: "Archivé", color: "bg-gray-100 text-gray-500" },
] as const;

export type Statut = (typeof STATUTS)[number]["value"];

export function getStatutLabel(statut: string): string {
  return STATUTS.find((s) => s.value === statut)?.label ?? statut;
}

export function getStatutColor(statut: string): string {
  return STATUTS.find((s) => s.value === statut)?.color ?? "bg-gray-100 text-gray-700";
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatSalaire(salaire: number | null | undefined): string {
  if (!salaire) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(salaire);
}

export const TYPES_RAPPEL = [
  { value: "relance", label: "Relance" },
  { value: "entretien", label: "Entretien" },
  { value: "autre", label: "Autre" },
] as const;
