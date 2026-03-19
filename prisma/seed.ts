import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Créer un utilisateur de test
  const passwordHash = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      passwordHash,
    },
  });

  // Créer des entreprises
  const entreprises = await Promise.all([
    prisma.entreprise.create({
      data: { nom: "Google France", secteur: "Tech", taille: "10000+", siteWeb: "https://google.com" },
    }),
    prisma.entreprise.create({
      data: { nom: "Décathlon", secteur: "Retail", taille: "1000-5000", siteWeb: "https://decathlon.fr" },
    }),
    prisma.entreprise.create({
      data: { nom: "Doctolib", secteur: "HealthTech", taille: "500-1000", siteWeb: "https://doctolib.fr" },
    }),
    prisma.entreprise.create({
      data: { nom: "BlaBlaCar", secteur: "Mobility", taille: "500-1000", siteWeb: "https://blablacar.com" },
    }),
    prisma.entreprise.create({
      data: { nom: "Datadog", secteur: "Tech", taille: "1000-5000", siteWeb: "https://datadoghq.com" },
    }),
  ]);

  const statuts = ["envisage", "postule", "entretien1", "entretien2", "offre", "refus", "archive"];

  // Créer des candidatures de test
  for (let i = 0; i < 15; i++) {
    const entreprise = entreprises[i % entreprises.length];
    const statut = statuts[i % statuts.length];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 60));

    const candidature = await prisma.candidature.create({
      data: {
        userId: user.id,
        entrepriseId: entreprise.id,
        poste: ["Développeur Full Stack", "Lead Developer", "CTO", "Product Manager", "DevOps Engineer"][i % 5],
        datePostulation: date,
        statut,
        salairePropose: 45000 + Math.floor(Math.random() * 30000),
        lienOffre: `https://linkedin.com/jobs/${i + 1000}`,
      },
    });

    // Ajouter des notes
    await prisma.note.create({
      data: {
        candidatureId: candidature.id,
        contenu: `Note initiale pour ${entreprise.nom}. Poste très intéressant.`,
      },
    });

    // Ajouter des rappels pour certaines candidatures
    if (i % 3 === 0) {
      const rappelDate = new Date();
      rappelDate.setDate(rappelDate.getDate() + 1);
      await prisma.rappel.create({
        data: {
          candidatureId: candidature.id,
          date: rappelDate,
          type: "relance",
          message: `Relancer ${entreprise.nom} pour le poste`,
          status: "a_faire",
        },
      });
    }
  }

  console.log("Seed terminé avec succès !");
  console.log("Utilisateur de test : demo@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
