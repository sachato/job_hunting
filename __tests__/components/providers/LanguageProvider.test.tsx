import { render, screen, fireEvent, act } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "@/components/providers/LanguageProvider";

function LangDisplay() {
  const { lang, setLang, t } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="dashboard-label">{t.sidebar.dashboard}</span>
      <span data-testid="logout-label">{t.sidebar.logout}</span>
      <button onClick={() => setLang(lang === "fr" ? "en" : "fr")}>toggle</button>
      <button onClick={() => setLang("fr")}>set-fr</button>
      <button onClick={() => setLang("en")}>set-en</button>
    </div>
  );
}

describe("LanguageProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("fournit le français par défaut", () => {
    render(
      <LanguageProvider>
        <LangDisplay />
      </LanguageProvider>
    );
    expect(screen.getByTestId("lang")).toHaveTextContent("fr");
  });

  it("fournit les traductions françaises par défaut", () => {
    render(
      <LanguageProvider>
        <LangDisplay />
      </LanguageProvider>
    );
    expect(screen.getByTestId("dashboard-label")).toHaveTextContent("Tableau de bord");
    expect(screen.getByTestId("logout-label")).toHaveTextContent("Se déconnecter");
  });

  it("bascule en anglais sur toggle", () => {
    render(
      <LanguageProvider>
        <LangDisplay />
      </LanguageProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("lang")).toHaveTextContent("en");
    expect(screen.getByTestId("dashboard-label")).toHaveTextContent("Dashboard");
    expect(screen.getByTestId("logout-label")).toHaveTextContent("Sign out");
  });

  it("repasse en français sur double toggle", () => {
    render(
      <LanguageProvider>
        <LangDisplay />
      </LanguageProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("lang")).toHaveTextContent("fr");
  });

  it("persiste la langue dans localStorage", () => {
    render(
      <LanguageProvider>
        <LangDisplay />
      </LanguageProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "set-en" }));
    expect(localStorage.getItem("lang")).toBe("en");
  });

  it("relit la langue depuis localStorage au montage", async () => {
    localStorage.setItem("lang", "en");
    render(
      <LanguageProvider>
        <LangDisplay />
      </LanguageProvider>
    );
    await act(async () => {});
    expect(screen.getByTestId("lang")).toHaveTextContent("en");
  });

  it("ignore une valeur localStorage invalide", async () => {
    localStorage.setItem("lang", "de");
    render(
      <LanguageProvider>
        <LangDisplay />
      </LanguageProvider>
    );
    await act(async () => {});
    expect(screen.getByTestId("lang")).toHaveTextContent("fr");
  });
});
