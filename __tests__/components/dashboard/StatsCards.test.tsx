import { render, screen, waitFor } from "../../utils/test-utils";
import { StatsCards } from "@/components/dashboard/StatsCards";

jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardHeader: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardTitle: ({ children }: React.PropsWithChildren) => <h3>{children}</h3>,
}));

jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

const mockStats = {
  total: 42,
  byStatut: {
    envisage: 5,
    postule: 10,
    entretien1: 4,
    entretien2: 3,
    offre: 2,
    refus: 8,
    archive: 10,
  },
  tauxReponse: 47,
};

beforeEach(() => {
  global.fetch = jest.fn();
});

describe("StatsCards", () => {
  it("affiche des skeletons pendant le chargement", () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<StatsCards />);
    expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
  });

  it("affiche le total des candidatures après chargement", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ json: async () => mockStats });
    render(<StatsCards />);
    await waitFor(() => {
      expect(screen.getByText("42")).toBeInTheDocument();
    });
  });

  it("affiche le taux de réponse", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ json: async () => mockStats });
    render(<StatsCards />);
    await waitFor(() => {
      expect(screen.getByText("47%")).toBeInTheDocument();
    });
  });

  it("calcule correctement le nombre en cours (postule + entretien1 + entretien2)", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ json: async () => mockStats });
    render(<StatsCards />);
    await waitFor(() => {
      // 10 + 4 + 3 = 17
      expect(screen.getByText("17")).toBeInTheDocument();
    });
  });

  it("affiche le nombre d'offres reçues", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ json: async () => mockStats });
    render(<StatsCards />);
    await waitFor(() => {
      expect(screen.getByText("Offres reçues")).toBeInTheDocument();
      // La valeur "2" est présente dans la carte Offres reçues
      expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("affiche les labels de statistiques en français", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ json: async () => mockStats });
    render(<StatsCards />);
    await waitFor(() => {
      expect(screen.getByText("Total candidatures")).toBeInTheDocument();
      expect(screen.getByText("En cours")).toBeInTheDocument();
      expect(screen.getByText("Offres reçues")).toBeInTheDocument();
      expect(screen.getByText("Taux de réponse")).toBeInTheDocument();
    });
  });

  it("affiche la répartition par statut", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ json: async () => mockStats });
    render(<StatsCards />);
    await waitFor(() => {
      expect(screen.getByText("Répartition par statut")).toBeInTheDocument();
      expect(screen.getByText("Postulé")).toBeInTheDocument();
      expect(screen.getByText("Offre")).toBeInTheDocument();
    });
  });

  it("retourne null si les stats ne sont pas disponibles après fetch", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ json: async () => null });
    const { container } = render(<StatsCards />);
    await waitFor(() => {
      expect(screen.queryAllByTestId("skeleton")).toHaveLength(0);
    });
    expect(container.firstChild).toBeNull();
  });
});
