import { render, screen, fireEvent, waitFor } from "../../utils/test-utils";
import { Header } from "@/components/layout/Header";

const mockToast = jest.fn();

jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { email: "test@example.com" } } }),
}));

jest.mock("@/components/ui/use-toast", () => ({
  toast: (...args: unknown[]) => mockToast(...args),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: React.PropsWithChildren<{ onClick?: () => void; [k: string]: unknown }>) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  global.fetch = jest.fn();
  global.URL.createObjectURL = jest.fn(() => "blob:test");
  global.URL.revokeObjectURL = jest.fn();
});

describe("Header", () => {
  describe("rendu avec pageKey", () => {
    it("affiche le titre du dashboard en français", () => {
      render(<Header pageKey="dashboard" />);
      expect(screen.getByText("Tableau de bord")).toBeInTheDocument();
    });

    it("affiche la description du dashboard", () => {
      render(<Header pageKey="dashboard" />);
      expect(screen.getByText(/vue d'ensemble/i)).toBeInTheDocument();
    });

    it("affiche le titre des candidatures", () => {
      render(<Header pageKey="candidatures" />);
      expect(screen.getByText("Candidatures")).toBeInTheDocument();
    });

    it("affiche le titre kanban", () => {
      render(<Header pageKey="kanban" />);
      expect(screen.getByText("Pipeline Kanban")).toBeInTheDocument();
    });
  });

  describe("rendu avec props title/description", () => {
    it("affiche le titre passé en prop", () => {
      render(<Header title="Mon titre custom" />);
      expect(screen.getByText("Mon titre custom")).toBeInTheDocument();
    });

    it("affiche la description passée en prop", () => {
      render(<Header title="Titre" description="Ma description" />);
      expect(screen.getByText("Ma description")).toBeInTheDocument();
    });

    it("n'affiche pas de description si non fournie", () => {
      render(<Header title="Titre" />);
      expect(screen.queryByText("Ma description")).not.toBeInTheDocument();
    });
  });

  describe("initiales utilisateur", () => {
    it("affiche la première lettre de l'email en majuscule", () => {
      render(<Header pageKey="dashboard" />);
      expect(screen.getByText("T")).toBeInTheDocument();
    });
  });

  describe("toggle de langue", () => {
    it("affiche le bouton EN par défaut (langue FR)", () => {
      render(<Header pageKey="dashboard" />);
      expect(screen.getByRole("button", { name: "EN" })).toBeInTheDocument();
    });

    it("passe en anglais au clic et affiche FR", () => {
      render(<Header pageKey="dashboard" />);
      fireEvent.click(screen.getByRole("button", { name: "EN" }));
      expect(screen.getByRole("button", { name: "FR" })).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("repasse en français au second clic", () => {
      render(<Header pageKey="dashboard" />);
      fireEvent.click(screen.getByRole("button", { name: "EN" }));
      fireEvent.click(screen.getByRole("button", { name: "FR" }));
      expect(screen.getByText("Tableau de bord")).toBeInTheDocument();
    });

    it("le bouton export CSV change de libellé en anglais", () => {
      render(<Header pageKey="dashboard" />);
      fireEvent.click(screen.getByRole("button", { name: "EN" }));
      expect(screen.getByRole("button", { name: /export csv/i })).toBeInTheDocument();
    });
  });

  describe("export CSV", () => {
    it("appelle /api/export au clic", async () => {
      const mockBlob = new Blob(["a,b,c"], { type: "text/csv" });
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true, blob: async () => mockBlob });

      render(<Header pageKey="candidatures" />);
      fireEvent.click(screen.getByRole("button", { name: /exporter csv/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/export");
      });
    });

    it("affiche un toast de succès après export", async () => {
      const mockBlob = new Blob(["a,b,c"], { type: "text/csv" });
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true, blob: async () => mockBlob });

      render(<Header pageKey="candidatures" />);
      fireEvent.click(screen.getByRole("button", { name: /exporter csv/i }));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({ title: expect.stringMatching(/réussi|successful/i) })
        );
      });
    });

    it("affiche un toast d'erreur si l'export échoue", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

      render(<Header pageKey="candidatures" />);
      fireEvent.click(screen.getByRole("button", { name: /exporter csv/i }));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({ variant: "destructive" })
        );
      });
    });
  });
});
