import { render, screen, fireEvent, waitFor } from "../../utils/test-utils";
import { CandidatureForm } from "@/components/candidatures/CandidatureForm";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockRefresh = jest.fn();
const mockToast = jest.fn();
const mockFetch = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, refresh: mockRefresh }),
}));

jest.mock("@/components/ui/use-toast", () => ({
  toast: (...args: unknown[]) => mockToast(...args),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, type, disabled, ...props }: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => (
    <button onClick={onClick} type={type} disabled={disabled} {...props}>{children}</button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: React.PropsWithChildren<React.LabelHTMLAttributes<HTMLLabelElement>>) => (
    <label {...props}>{children}</label>
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardHeader: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardTitle: ({ children }: React.PropsWithChildren) => <h3>{children}</h3>,
}));

jest.mock("@/components/ui/separator", () => ({
  Separator: () => <hr />,
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange }: React.PropsWithChildren<{ value?: string; onValueChange?: (v: string) => void }>) => (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      data-testid="statut-select"
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: React.PropsWithChildren) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: React.PropsWithChildren) => <>{children}</>,
  SelectItem: ({ children, value }: React.PropsWithChildren<{ value: string }>) => (
    <option value={value}>{children}</option>
  ),
}));

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = mockFetch;
});

describe("CandidatureForm — mode création", () => {
  it("affiche le champ entreprise", () => {
    render(<CandidatureForm />);
    expect(screen.getByLabelText(/nom de l'entreprise/i)).toBeInTheDocument();
  });

  it("affiche le champ poste", () => {
    render(<CandidatureForm />);
    expect(screen.getByLabelText(/^poste/i)).toBeInTheDocument();
  });

  it("affiche le champ date de postulation", () => {
    render(<CandidatureForm />);
    expect(screen.getByLabelText(/date de postulation/i)).toBeInTheDocument();
  });

  it("affiche le bouton Créer la candidature", () => {
    render(<CandidatureForm />);
    expect(screen.getByRole("button", { name: /créer la candidature/i })).toBeInTheDocument();
  });

  it("affiche le bouton Annuler", () => {
    render(<CandidatureForm />);
    expect(screen.getByRole("button", { name: /annuler/i })).toBeInTheDocument();
  });

  it("appelle router.back() au clic sur Annuler", () => {
    render(<CandidatureForm />);
    fireEvent.click(screen.getByRole("button", { name: /annuler/i }));
    expect(mockBack).toHaveBeenCalled();
  });

  it("soumet et redirige après création réussie", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: "new-id-123" }),
    });

    render(<CandidatureForm />);

    await fireEvent.change(screen.getByLabelText(/nom de l'entreprise/i), {
      target: { value: "Acme Corp" },
    });
    await fireEvent.change(screen.getByLabelText(/^poste/i), {
      target: { value: "Développeur" },
    });
    await fireEvent.change(screen.getByLabelText(/date de postulation/i), {
      target: { value: "2024-01-15" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /créer la candidature/i }).closest("form")!);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/candidatures",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("affiche un toast d'erreur si l'API échoue", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Erreur serveur" }),
    });

    render(<CandidatureForm />);
    fireEvent.change(screen.getByLabelText(/nom de l'entreprise/i), { target: { value: "Corp" } });
    fireEvent.change(screen.getByLabelText(/^poste/i), { target: { value: "Dev" } });
    fireEvent.change(screen.getByLabelText(/date de postulation/i), { target: { value: "2024-01-15" } });

    fireEvent.submit(screen.getByRole("button", { name: /créer la candidature/i }).closest("form")!);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: "destructive" })
      );
    });
  });
});

describe("CandidatureForm — mode édition", () => {
  const initialData = {
    id: "existing-id",
    poste: "Senior Dev",
    datePostulation: "2024-01-01",
    statut: "postule" as const,
    entreprise: { nom: "Old Corp" },
  };

  it("affiche le bouton Mettre à jour en mode edit", () => {
    render(<CandidatureForm initialData={initialData} mode="edit" />);
    expect(screen.getByRole("button", { name: /mettre à jour/i })).toBeInTheDocument();
  });

  it("pré-remplit le nom de l'entreprise", () => {
    render(<CandidatureForm initialData={initialData} mode="edit" />);
    expect(screen.getByDisplayValue("Old Corp")).toBeInTheDocument();
  });

  it("pré-remplit le poste", () => {
    render(<CandidatureForm initialData={initialData} mode="edit" />);
    expect(screen.getByDisplayValue("Senior Dev")).toBeInTheDocument();
  });

  it("appelle PATCH sur l'API en mode edit", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: "existing-id" }),
    });

    render(<CandidatureForm initialData={initialData} mode="edit" />);
    fireEvent.submit(screen.getByRole("button", { name: /mettre à jour/i }).closest("form")!);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/candidatures/${initialData.id}`,
        expect.objectContaining({ method: "PATCH" })
      );
    });
  });
});
