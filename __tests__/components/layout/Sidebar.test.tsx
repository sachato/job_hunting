import { render, screen, fireEvent } from "../../utils/test-utils";
import { Sidebar } from "@/components/layout/Sidebar";

const mockSignOut = jest.fn();
const mockPathname = jest.fn(() => "/dashboard");

jest.mock("next-auth/react", () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: React.PropsWithChildren<{ onClick?: () => void; [k: string]: unknown }>) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockPathname.mockReturnValue("/dashboard");
});

describe("Sidebar", () => {
  describe("rendu", () => {
    it("affiche le nom de l'application", () => {
      render(<Sidebar />);
      expect(screen.getByText("Job Tracker")).toBeInTheDocument();
    });

    it("affiche le sous-titre en français par défaut", () => {
      render(<Sidebar />);
      expect(screen.getByText("Suivi de candidatures")).toBeInTheDocument();
    });

    it("affiche les 3 entrées de navigation", () => {
      render(<Sidebar />);
      expect(screen.getByText("Tableau de bord")).toBeInTheDocument();
      expect(screen.getByText("Candidatures")).toBeInTheDocument();
      expect(screen.getByText("Pipeline Kanban")).toBeInTheDocument();
    });

    it("affiche le bouton de déconnexion", () => {
      render(<Sidebar />);
      expect(screen.getByRole("button", { name: /se déconnecter/i })).toBeInTheDocument();
    });
  });

  describe("liens de navigation", () => {
    it("le lien Tableau de bord pointe vers /dashboard", () => {
      render(<Sidebar />);
      expect(screen.getByRole("link", { name: /tableau de bord/i })).toHaveAttribute("href", "/dashboard");
    });

    it("le lien Candidatures pointe vers /candidatures", () => {
      render(<Sidebar />);
      expect(screen.getByRole("link", { name: /^candidatures$/i })).toHaveAttribute("href", "/candidatures");
    });

    it("le lien Kanban pointe vers /kanban", () => {
      render(<Sidebar />);
      expect(screen.getByRole("link", { name: /pipeline kanban/i })).toHaveAttribute("href", "/kanban");
    });
  });

  describe("déconnexion", () => {
    it("appelle signOut avec callbackUrl /login", () => {
      render(<Sidebar />);
      fireEvent.click(screen.getByRole("button", { name: /se déconnecter/i }));
      expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
    });
  });
});
