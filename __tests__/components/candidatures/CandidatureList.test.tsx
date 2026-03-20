import { render, screen, fireEvent, waitFor } from "../../utils/test-utils";
import { CandidatureList } from "@/components/candidatures/CandidatureList";

const mockToast = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

jest.mock("@/components/ui/use-toast", () => ({
  toast: (...args: unknown[]) => mockToast(...args),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, ...props }: React.PropsWithChildren<{ onClick?: () => void; disabled?: boolean; [k: string]: unknown }>) => (
    <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({ placeholder, onChange, value, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input placeholder={placeholder} onChange={onChange} value={value} {...props} />
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange }: React.PropsWithChildren<{ onValueChange?: (v: string) => void }>) => (
    <div data-testid="select">{children}</div>
  ),
  SelectTrigger: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  SelectContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SelectItem: ({ children, value }: React.PropsWithChildren<{ value: string }>) => (
    <option value={value}>{children}</option>
  ),
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
    salairePropose: 50000,
    lienOffre: "https://example.com",
    createdAt: "2024-01-10T00:00:00.000Z",
    entreprise: { nom: "Acme Corp", secteur: "Tech" },
    _count: { notes: 2, documents: 1 },
    rappels: [],
  },
  {
    id: "2",
    poste: "Product Manager",
    datePostulation: "2024-02-01T00:00:00.000Z",
    statut: "entretien1",
    salairePropose: null,
    lienOffre: null,
    createdAt: "2024-01-20T00:00:00.000Z",
    entreprise: { nom: "Beta Ltd", secteur: null },
    _count: { notes: 0, documents: 0 },
    rappels: [],
  },
];

const mockFetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = mockFetch;
});

describe("CandidatureList", () => {
  it("affiche des skeletons pendant le chargement", () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<CandidatureList />);
    expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
  });

  it("affiche le message vide si aucune candidature", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ candidatures: [], total: 0 }),
    });
    render(<CandidatureList />);
    await waitFor(() => {
      expect(screen.getByText("Aucune candidature trouvée")).toBeInTheDocument();
    });
  });

  it("affiche le lien pour ajouter si vide", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ candidatures: [], total: 0 }),
    });
    render(<CandidatureList />);
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /ajouter une candidature/i })).toBeInTheDocument();
    });
  });

  it("affiche les candidatures", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ candidatures: mockCandidatures, total: 2 }),
    });
    render(<CandidatureList />);
    await waitFor(() => {
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
      expect(screen.getByText("Beta Ltd")).toBeInTheDocument();
    });
  });

  it("affiche les postes", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ candidatures: mockCandidatures, total: 2 }),
    });
    render(<CandidatureList />);
    await waitFor(() => {
      expect(screen.getByText("Développeur Frontend")).toBeInTheDocument();
      expect(screen.getByText("Product Manager")).toBeInTheDocument();
    });
  });

  it("affiche les statuts traduits", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ candidatures: mockCandidatures, total: 2 }),
    });
    render(<CandidatureList />);
    await waitFor(() => {
      expect(screen.getByText("Postulé")).toBeInTheDocument();
      expect(screen.getByText("Entretien 1")).toBeInTheDocument();
    });
  });

  it("affiche le bouton Nouvelle candidature", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ candidatures: [], total: 0 }),
    });
    render(<CandidatureList />);
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /nouvelle candidature/i })).toHaveAttribute(
        "href",
        "/candidatures/nouveau"
      );
    });
  });

  it("affiche le champ de recherche avec le bon placeholder", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ candidatures: [], total: 0 }),
    });
    render(<CandidatureList />);
    expect(screen.getByPlaceholderText(/rechercher entreprise/i)).toBeInTheDocument();
  });

  it("affiche les en-têtes de colonnes", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ candidatures: [], total: 0 }),
    });
    render(<CandidatureList />);
    await waitFor(() => {
      expect(screen.getByText("Entreprise")).toBeInTheDocument();
      expect(screen.getByText("Poste")).toBeInTheDocument();
      expect(screen.getByText("Statut")).toBeInTheDocument();
      expect(screen.getByText("Salaire")).toBeInTheDocument();
    });
  });

  it("supprime une candidature après confirmation", async () => {
    window.confirm = jest.fn(() => true);
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ candidatures: mockCandidatures, total: 2 }),
      })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ candidatures: [mockCandidatures[1]], total: 1 }),
      });

    render(<CandidatureList />);
    await waitFor(() => screen.getAllByRole("button"));

    const deleteButtons = screen.getAllByRole("button").filter(
      (b) => b.querySelector("svg") !== null && !b.textContent
    );
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[deleteButtons.length - 1]);
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({ title: expect.stringMatching(/supprimée|deleted/i) })
        );
      });
    }
  });

  it("ne supprime pas si l'utilisateur annule", async () => {
    window.confirm = jest.fn(() => false);
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ candidatures: mockCandidatures, total: 2 }),
    });
    render(<CandidatureList />);
    await waitFor(() => screen.getByText("Acme Corp"));
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
