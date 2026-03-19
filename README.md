# 🚀 JobTracker - Gestionnaire de Candidatures Intelligent

Une application web complète pour centraliser, suivre et optimiser votre recherche d'emploi. Conçue pour les candidats actifs gérant plus de 100 candidatures simultanément, cette application permet de piloter tout votre pipeline de recrutement depuis un tableau de bord unique.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ Fonctionnalités Principales

### 📊 Tableau de Bord Analytique

- **Statistiques en temps réel** : Suivi du nombre de candidatures par statut et taux de réponse.
- **Rappels du jour** : Visualisation immédiate des entretiens et relances à effectuer.
- **Graphiques simples** : Visualisation de la progression de vos recherches.

### 🗂️ Gestion des Candidatures

- **Liste avancée** : Filtrage par statut, date ou entreprise, tri par colonnes et recherche plein texte.
- **Pagination** : Gestion fluide de grands volumes de données.
- **Fiches détaillées** : Informations complètes (entreprise, poste, contact, salaire, lien offre).
- **Historique** : Notes chronologiques et pièces jointes associées à chaque candidature.

### 🏗️ Pipeline Kanban Interactif

- **Visualisation visuelle** : Colonnes personnalisables (Envisagé, Postulé, Entretien 1/2, Offre, Refus, Archivé).
- **Drag & Drop** : Changement de statut intuitif grâce à `@dnd-kit`.
- **Cartes informatives** : Résumé essentiel de chaque opportunité au premier coup d'œil.

### 🔔 Système de Rappels Intelligent

- **Alertes configurables** : Relances, rappels d'entretien ou notes personnelles.
- **Gestion des statuts** : Marquer les rappels comme "faits" ou les reporter.
- **Intégration Dashboard** : Les rappels prioritaires apparaissent sur la page d'accueil.

### 📤 Export & Documents

- **Upload de documents** : Stockage local sécurisé des CV, lettres de motivation et préparations d'entretien.
- **Export CSV** : Génération d'un rapport complet de toutes vos candidatures pour analyse externe.

## 🛠️ Stack Technique

Cette application est construite avec une architecture moderne et robuste :

- **Framework** : [Next.js 14+](https://nextjs.org/) (App Router, Server Components)
- **Langage** : [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Base de données** : [PostgreSQL](https://www.postgresql.org/)
- **ORM** : [Prisma 6](https://www.prisma.io/)
- **Authentification** : [NextAuth.js](https://next-auth.js.org/) (Credentials Provider)
- **Styling** : [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Validation** : [Zod](https://zod.dev/)
- **Drag & Drop** : [@dnd-kit](https://dndkit.com/)
- **Gestion d'état** : React Hooks & Server Actions

## 📁 Structure du Projet

```text
app/
├── api/                  # Routes API RESTful (Auth, Candidatures, Stats, Export)
├── (auth)/               # Pages d'authentification (Login, Register)
├── (dashboard)/          # Layout protégé pour l'application principale
│   ├── dashboard/        # Vue d'ensemble
│   ├── candidatures/     # Liste et détails
│   └── kanban/           # Vue Kanban interactive
├── layout.tsx            # Layout racine
└── page.tsx              # Landing page

components/
├── ui/                   # Composants shadcn réutilisables
├── auth/                 # Formulaires de connexion/inscription
├── candidatures/         # Cartes, listes, formulaires
├── dashboard/            # Widgets statistiques
└── layout/               # Sidebar, Header

lib/
├── prisma.ts             # Instance Prisma Client
├── auth.ts               # Configuration NextAuth
├── utils.ts              # Fonctions utilitaires
└── validations.ts        # Schémas Zod
```
