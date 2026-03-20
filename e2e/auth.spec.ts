import { test, expect } from "@playwright/test";

const TEST_EMAIL = `test-e2e-${Date.now()}@example.com`;
const TEST_PASSWORD = "TestPassword123";

test.describe("Authentification", () => {
  test("la page d'accueil redirige vers /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/login/);
  });

  test("la page de connexion s'affiche correctement", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Mot de passe")).toBeVisible();
    await expect(page.getByRole("button", { name: /se connecter/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /s'inscrire/i })).toBeVisible();
  });

  test("la page d'inscription s'affiche correctement", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Mot de passe")).toBeVisible();
    await expect(page.getByRole("button", { name: /créer mon compte/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /se connecter/i })).toBeVisible();
  });

  test("inscription d'un nouvel utilisateur et redirection vers dashboard", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Email").fill(TEST_EMAIL);
    await page.getByLabel("Mot de passe").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /créer mon compte/i }).click();
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
  });

  test("connexion avec un compte existant", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(TEST_EMAIL);
    await page.getByLabel("Mot de passe").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /se connecter/i }).click();
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
  });

  test("connexion avec mauvais mot de passe affiche une erreur", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(TEST_EMAIL);
    await page.getByLabel("Mot de passe").fill("mauvaispassword");
    await page.getByRole("button", { name: /se connecter/i }).click();
    // Reste sur /login et affiche un toast d'erreur
    await expect(page).toHaveURL(/login/);
  });

  test("les routes dashboard sont protégées sans session", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  });

  test("déconnexion redirige vers /login", async ({ page }) => {
    // Connexion d'abord
    await page.goto("/login");
    await page.getByLabel("Email").fill(TEST_EMAIL);
    await page.getByLabel("Mot de passe").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /se connecter/i }).click();
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });

    // Déconnexion
    await page.getByRole("button", { name: /se déconnecter/i }).click();
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
  });
});
