import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const entrepriseSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  siteWeb: z.string().url("URL invalide").optional().or(z.literal("")),
  secteur: z.string().optional(),
  taille: z.string().optional(),
});

export const candidatureSchema = z.object({
  poste: z.string().min(1, "Le poste est requis"),
  datePostulation: z.string().min(1, "La date est requise"),
  statut: z.enum(["envisage", "postule", "entretien1", "entretien2", "offre", "refus", "archive"]),
  contact: z.string().optional(),
  emailContact: z.string().email("Email invalide").optional().or(z.literal("")),
  telephone: z.string().optional(),
  salairePropose: z.coerce.number().positive().optional().nullable(),
  lienOffre: z.string().url("URL invalide").optional().or(z.literal("")),
  entreprise: entrepriseSchema,
});

export type CandidatureFormData = z.infer<typeof candidatureSchema>;

export const noteSchema = z.object({
  contenu: z.string().min(1, "La note ne peut pas être vide"),
  candidatureId: z.string().min(1),
});

export const rappelSchema = z.object({
  date: z.string().min(1, "La date est requise"),
  type: z.enum(["relance", "entretien", "autre"]),
  message: z.string().min(1, "Le message est requis"),
  candidatureId: z.string().min(1),
});

export type RappelFormData = z.infer<typeof rappelSchema>;
