import { render, screen, waitFor } from "../../utils/test-utils";
import { RecentCandidatures } from "@/components/dashboard/RecentCandidatures";

jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardHeader: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardTitle: ({ children }: React.PropsWithChildren) => <h3>{children}</h3>,
}));

jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

const mockCandidatures = [
  {
    id: "1",
    poste: "Développeur Frontend",
    datePostulation: "2024-01-15T00:00:00.000Z",
    statut: "postule",
    entreprise: { nom: "Acme Corp", secteur: "Tech" },
  },
  {
    id: "2",
    poste: "Product Manager",
    datePostulation: "2024-02-01T00:00:00.000Z",
    statut: "entretien1",
    entreprise: { nom: "Beta Ltd", secteur: null },
  },
];

beforeEach(() => {
  global.fetch = jest.fn();
});

describe("RecentCandidatures", () => {
  it("affiche des skeletons pendant le chargement", () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<RecentCandidatures />);
    expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
  });

  it("affiche le message vide si aucune candidature", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ recentCandidatures: [] }),
    });
    render(<RecentCandidatures />);
    await waitFor(() => {
      expect(screen.getByText(/aucune candidature pour l'instant/i)).toBeInTheDocument();
    });
  });

  it("affiche le lien pour ajouter la première candidature si vide", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ recentCandidatures: [] }),
    });
    render(<RecentCandidatures />);
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /ajouter votre première candidature/i })).toBeInTheDocument();
    });
  });

  it("affiche les candidatures récentes", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ recentCandidatures: mockCandidatures }),
    });
    render(<RecentCandidatures />);
    await waitFor(() => {
      expect(screen.getByText("Développeur Frontend")).toBeInTheDocument();
      expect(screen.getByText("Product Manager")).toBeInTheDocument();
    });
  });

  it("affiche le nom de l'entreprise", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ recentCandidatures: mockCandidatures }),
    });
    render(<RecentCandidatures />);
    await waitFor(() => {
      expect(screen.getByText(/acme corp/i)).toBeInTheDocument();
    });
  });

  it("affiche les statuts traduits", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ recentCandidatures: mockCandidatures }),
    });
    render(<RecentCandidatures />);
    await waitFor(() => {
      expect(screen.getByText("Postulé")).toBeInTheDocument();
      expect(screen.getByText("Entretien 1")).toBeInTheDocument();
    });
  });

  it("affiche le titre de la section", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ recentCandidatures: [] }),
    });
    render(<RecentCandidatures />);
    await waitFor(() => {
      expect(screen.getByText("Dernières candidatures")).toBeInTheDocument();
    });
  });

  it("affiche le lien 'Voir tout'", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ recentCandidatures: [] }),
    });
    render(<RecentCandidatures />);
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /voir tout/i })).toHaveAttribute("href", "/candidatures");
    });
  });
});
