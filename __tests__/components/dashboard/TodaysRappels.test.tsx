import { render, screen, fireEvent, waitFor } from "../../utils/test-utils";
import { TodaysRappels } from "@/components/dashboard/TodaysRappels";

const mockToast = jest.fn();

jest.mock("@/components/ui/use-toast", () => ({
  toast: (...args: unknown[]) => mockToast(...args),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardHeader: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardTitle: ({ children }: React.PropsWithChildren) => <h3>{children}</h3>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: React.PropsWithChildren<{ onClick?: () => void; [k: string]: unknown }>) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

const mockRappels = [
  {
    id: "r1",
    type: "relance",
    message: "Relancer recruteur",
    date: "2024-03-20T09:00:00.000Z",
    status: "a_faire",
    candidature: {
      id: "c1",
      poste: "Dev Senior",
      entreprise: { nom: "TechCorp" },
    },
  },
  {
    id: "r2",
    type: "entretien",
    message: "Préparer questions",
    date: "2024-03-20T14:00:00.000Z",
    status: "a_faire",
    candidature: {
      id: "c2",
      poste: "Product Owner",
      entreprise: { nom: "StartupXYZ" },
    },
  },
];

const mockFetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = mockFetch;
});

describe("TodaysRappels", () => {
  it("affiche des skeletons pendant le chargement", () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<TodaysRappels />);
    expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
  });

  it("affiche le message vide si aucun rappel", async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ rappelsAujourdhui: [] }),
    });
    render(<TodaysRappels />);
    await waitFor(() => {
      expect(screen.getByText(/aucun rappel pour aujourd'hui/i)).toBeInTheDocument();
    });
  });

  it("affiche le titre de la section", async () => {
    mockFetch.mockResolvedValue({ json: async () => ({ rappelsAujourdhui: [] }) });
    render(<TodaysRappels />);
    await waitFor(() => {
      expect(screen.getByText("Rappels du jour")).toBeInTheDocument();
    });
  });

  it("affiche les rappels avec le message", async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ rappelsAujourdhui: mockRappels }),
    });
    render(<TodaysRappels />);
    await waitFor(() => {
      expect(screen.getByText("Relancer recruteur")).toBeInTheDocument();
      expect(screen.getByText("Préparer questions")).toBeInTheDocument();
    });
  });

  it("affiche le nom de l'entreprise associée", async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ rappelsAujourdhui: mockRappels }),
    });
    render(<TodaysRappels />);
    await waitFor(() => {
      expect(screen.getByText("TechCorp")).toBeInTheDocument();
      expect(screen.getByText("StartupXYZ")).toBeInTheDocument();
    });
  });

  it("affiche le compteur de rappels", async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ rappelsAujourdhui: mockRappels }),
    });
    render(<TodaysRappels />);
    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("affiche les boutons 'Fait'", async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ rappelsAujourdhui: mockRappels }),
    });
    render(<TodaysRappels />);
    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /fait/i })).toHaveLength(2);
    });
  });

  it("marque un rappel comme fait et le retire de la liste", async () => {
    mockFetch
      .mockResolvedValueOnce({ json: async () => ({ rappelsAujourdhui: mockRappels }) })
      .mockResolvedValueOnce({ ok: true });

    render(<TodaysRappels />);
    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /fait/i })).toHaveLength(2);
    });

    fireEvent.click(screen.getAllByRole("button", { name: /fait/i })[0]);

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /fait/i })).toHaveLength(1);
    });
  });

  it("affiche un toast après avoir marqué un rappel comme fait", async () => {
    mockFetch
      .mockResolvedValueOnce({ json: async () => ({ rappelsAujourdhui: mockRappels }) })
      .mockResolvedValueOnce({ ok: true });

    render(<TodaysRappels />);
    await waitFor(() => screen.getAllByRole("button", { name: /fait/i }));

    fireEvent.click(screen.getAllByRole("button", { name: /fait/i })[0]);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: expect.stringMatching(/marqué|marked/i) })
      );
    });
  });

  it("affiche le type de rappel traduit", async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ rappelsAujourdhui: mockRappels }),
    });
    render(<TodaysRappels />);
    await waitFor(() => {
      expect(screen.getByText("Relance")).toBeInTheDocument();
      expect(screen.getByText("Entretien")).toBeInTheDocument();
    });
  });
});
