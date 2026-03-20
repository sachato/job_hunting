import { test, expect } from "@playwright/test";

const TEST_EMAIL = "e2e-candidatures@example.com";
const TEST_PASSWORD = "TestPassword123";

test.describe("Gestion des candidatures", () => {
  test.beforeEach(async ({ page }) => {
    // Crée un compte ou connecte-toi (idempotent via l'API register)
    await page.request.post("/api/auth/register", {
      data: { email: TEST_EMAIL, password: TEST_PASSWORD },
    }).catch(() => {}); // Ignore si déjà existant

    await page.goto("/login");
    await page.getByLabel("Email").fill(TEST_EMAIL);
    await page.getByLabel("Mot de passe").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /se connecter/i }).click();
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
  });

  test("le dashboard affiche les statistiques", async ({ page }) => {
    await expect(page.getByText(/tableau de bord/i)).toBeVisible();
    await expect(page.getByText(/total candidatures/i)).toBeVisible();
    await expect(page.getByText(/taux de réponse/i)).toBeVisible();
  });

  test("navigation vers la page des candidatures", async ({ page }) => {
    await page.getByRole("link", { name: /candidatures/i }).first().click();
    await expect(page).toHaveURL("/candidatures");
    await expect(page.getByRole("button", { name: /nouvelle candidature/i })).toBeVisible();
  });

  test("création d'une nouvelle candidature", async ({ page }) => {
    await page.goto("/candidatures/nouveau");

    await page.getByLabel(/entreprise/i).fill("Acme Corp");
    await page.getByLabel(/poste/i).fill("Développeur Frontend");
    await page.getByLabel(/date/i).fill("2024-03-15");

    // Sélectionner le statut "Postulé"
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: /postulé/i }).click();

    await page.getByRole("button", { name: /enregistrer|sauvegarder|créer/i }).click();

    // Redirige vers la fiche ou la liste
    await expect(page).not.toHaveURL("/candidatures/nouveau", { timeout: 10000 });
  });

  test("navigation vers le kanban", async ({ page }) => {
    await page.getByRole("link", { name: /kanban/i }).click();
    await expect(page).toHaveURL("/kanban");
    await expect(page.getByText(/pipeline kanban/i)).toBeVisible();
  });

  test("le toggle FR/EN change la langue de l'interface", async ({ page }) => {
    // En français par défaut
    await expect(page.getByText(/tableau de bord/i)).toBeVisible();

    // Cliquer sur le bouton de langue
    await page.getByRole("button", { name: "EN" }).click();

    // L'interface passe en anglais
    await expect(page.getByText(/dashboard/i)).toBeVisible();

    // Repasser en français
    await page.getByRole("button", { name: "FR" }).click();
    await expect(page.getByText(/tableau de bord/i)).toBeVisible();
  });
});
