export type Lang = "fr" | "en";

export const translations = {
  fr: {
    sidebar: {
      subtitle: "Suivi de candidatures",
      dashboard: "Tableau de bord",
      candidatures: "Candidatures",
      kanban: "Pipeline Kanban",
      logout: "Se déconnecter",
    },
    header: {
      exportCsv: "Exporter CSV",
      exportSuccess: "Export réussi",
      exportSuccessDesc: "Fichier CSV téléchargé.",
      exportError: "Erreur",
      exportErrorDesc: "Impossible d'exporter.",
    },
    pages: {
      dashboard: {
        title: "Tableau de bord",
        description: "Vue d'ensemble de vos candidatures",
      },
      candidatures: {
        title: "Candidatures",
        description: "Gérez et suivez toutes vos candidatures",
      },
      kanban: {
        title: "Pipeline Kanban",
        description: "Glissez-déposez les candidatures pour changer leur statut",
      },
    },
    stats: {
      total: "Total candidatures",
      enCours: "En cours",
      offresRecues: "Offres reçues",
      tauxReponse: "Taux de réponse",
      repartitionStatut: "Répartition par statut",
    },
    recent: {
      title: "Dernières candidatures",
      seeAll: "Voir tout",
      empty: "Aucune candidature pour l'instant",
      addFirst: "Ajouter votre première candidature",
    },
    rappels: {
      title: "Rappels du jour",
      empty: "Aucun rappel pour aujourd'hui",
      done: "Fait",
      markedDone: "Rappel marqué comme fait",
    },
    list: {
      search: "Rechercher entreprise, poste...",
      allStatuts: "Tous les statuts",
      newCandidature: "Nouvelle candidature",
      columns: {
        entreprise: "Entreprise",
        poste: "Poste",
        statut: "Statut",
        datePostulation: "Date postulation",
        addedAt: "Ajouté le",
        salaire: "Salaire",
      },
      empty: "Aucune candidature trouvée",
      addCandidature: "Ajouter une candidature",
      page: "Page",
      results: "résultat",
      results_plural: "résultats",
      deleteConfirm: "Supprimer la candidature chez",
      deleted: "Candidature supprimée",
    },
    statuts: {
      envisage: "Envisagé",
      postule: "Postulé",
      entretien1: "Entretien 1",
      entretien2: "Entretien 2",
      offre: "Offre",
      refus: "Refus",
      archive: "Archivé",
    },
    typesRappel: {
      relance: "Relance",
      entretien: "Entretien",
      autre: "Autre",
    },
    dateLocale: "fr-FR",
  },
  en: {
    sidebar: {
      subtitle: "Job application tracker",
      dashboard: "Dashboard",
      candidatures: "Applications",
      kanban: "Kanban Pipeline",
      logout: "Sign out",
    },
    header: {
      exportCsv: "Export CSV",
      exportSuccess: "Export successful",
      exportSuccessDesc: "CSV file downloaded.",
      exportError: "Error",
      exportErrorDesc: "Unable to export.",
    },
    pages: {
      dashboard: {
        title: "Dashboard",
        description: "Overview of your job applications",
      },
      candidatures: {
        title: "Applications",
        description: "Manage and track all your applications",
      },
      kanban: {
        title: "Kanban Pipeline",
        description: "Drag and drop applications to change their status",
      },
    },
    stats: {
      total: "Total applications",
      enCours: "In progress",
      offresRecues: "Offers received",
      tauxReponse: "Response rate",
      repartitionStatut: "Breakdown by status",
    },
    recent: {
      title: "Recent applications",
      seeAll: "See all",
      empty: "No applications yet",
      addFirst: "Add your first application",
    },
    rappels: {
      title: "Today's reminders",
      empty: "No reminders for today",
      done: "Done",
      markedDone: "Reminder marked as done",
    },
    list: {
      search: "Search company, position...",
      allStatuts: "All statuses",
      newCandidature: "New application",
      columns: {
        entreprise: "Company",
        poste: "Position",
        statut: "Status",
        datePostulation: "Application date",
        addedAt: "Added on",
        salaire: "Salary",
      },
      empty: "No applications found",
      addCandidature: "Add an application",
      page: "Page",
      results: "result",
      results_plural: "results",
      deleteConfirm: "Delete application at",
      deleted: "Application deleted",
    },
    statuts: {
      envisage: "Considering",
      postule: "Applied",
      entretien1: "Interview 1",
      entretien2: "Interview 2",
      offre: "Offer",
      refus: "Rejected",
      archive: "Archived",
    },
    typesRappel: {
      relance: "Follow-up",
      entretien: "Interview",
      autre: "Other",
    },
    dateLocale: "en-US",
  },
} as const;

export type Translations = (typeof translations)["fr"];
