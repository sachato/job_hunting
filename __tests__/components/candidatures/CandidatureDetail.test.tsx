import { render, screen, fireEvent, waitFor, within } from "../../utils/test-utils";
import userEvent from "@testing-library/user-event";
import { CandidatureDetail } from "@/components/candidatures/CandidatureDetail";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockToast = jest.fn();
const mockFetch = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

jest.mock("@/components/ui/use-toast", () => ({
  toast: (...args: unknown[]) => mockToast(...args),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children, onClick, disabled, ...props
  }: React.PropsWithChildren<{ onClick?: () => void; disabled?: boolean; [k: string]: unknown }>) => (
    <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: React.PropsWithChildren) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardHeader: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardTitle: ({ children }: React.PropsWithChildren) => <h3>{children}</h3>,
}));

jest.mock("@/components/ui/textarea", () => ({
  Textarea: ({
    value, onChange, placeholder, ...props
  }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea value={value} onChange={onChange} placeholder={placeholder} {...props} />
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({
    type: _t, required: _r, value, onChange, ...props
  }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input value={value} onChange={onChange} {...props} />
  ),
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: React.PropsWithChildren<React.LabelHTMLAttributes<HTMLLabelElement>>) => (
    <label {...props}>{children}</label>
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({
    children, value, onValueChange,
  }: React.PropsWithChildren<{ value?: string; onValueChange?: (v: string) => void }>) => (
    <select value={value} onChange={(e) => onValueChange?.(e.target.value)}>
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

jest.mock("@/components/ui/separator", () => ({
  Separator: () => <hr />,
}));

// ─── Données de test ──────────────────────────────────────────────────────────

const baseCandidature = {
  id: "cand-1",
  poste: "Développeur Senior",
  statut: "postule",
  datePostulation: "2024-01-15T00:00:00.000Z",
  contact: null,
  emailContact: null,
  telephone: null,
  salairePropose: null,
  lienOffre: null,
  createdAt: "2024-01-10T00:00:00.000Z",
  entreprise: { nom: "TechCorp", secteur: null, taille: null, siteWeb: null },
  notes: [],
  documents: [],
  rappels: [],
};

const richCandidature = {
  ...baseCandidature,
  contact: "Marie Dupont",
  emailContact: "marie@techcorp.com",
  telephone: "0612345678",
  salairePropose: 60000,
  lienOffre: "https://example.com/offre",
  entreprise: { nom: "TechCorp", secteur: "Tech", taille: "50-200", siteWeb: "https://techcorp.com" },
  notes: [
    { id: "note-1", contenu: "Très bonne impression", createdAt: "2024-01-16T00:00:00.000Z" },
    { id: "note-2", contenu: "RH très sympa", createdAt: "2024-01-17T00:00:00.000Z" },
  ],
  documents: [
    { id: "doc-1", nom: "CV_2024.pdf", url: "/uploads/cv.pdf", type: "cv", createdAt: "2024-01-16T00:00:00.000Z" },
  ],
  rappels: [
    { id: "rap-1", date: "2024-02-01T09:00:00.000Z", type: "relance", message: "Relancer RH", status: "a_faire" },
    { id: "rap-2", date: "2024-01-20T14:00:00.000Z", type: "entretien", message: "Préparer entretien", status: "fait" },
  ],
};

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.resetAllMocks();
  global.fetch = mockFetch;
  window.confirm = jest.fn(() => true);
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("CandidatureDetail — rendu de base", () => {
  it("affiche le poste", () => {
    render(<CandidatureDetail candidature={baseCandidature} />);
    expect(screen.getByText("Développeur Senior")).toBeInTheDocument();
  });

  it("affiche le nom de l'entreprise", () => {
    render(<CandidatureDetail candidature={baseCandidature} />);
    expect(screen.getByText("TechCorp")).toBeInTheDocument();
  });

  it("affiche le lien Modifier", () => {
    render(<CandidatureDetail candidature={baseCandidature} />);
    expect(screen.getByRole("link", { name: /modifier/i })).toHaveAttribute(
      "href",
      "/candidatures/cand-1/modifier"
    );
  });

  it("affiche le select de statut", () => {
    render(<CandidatureDetail candidature={baseCandidature} />);
    expect(screen.getAllByRole("combobox")[0]).toBeInTheDocument();
  });

  it("affiche la date de postulation", () => {
    render(<CandidatureDetail candidature={baseCandidature} />);
    expect(screen.getByText("15/01/2024")).toBeInTheDocument();
  });
});

describe("CandidatureDetail — infos optionnelles", () => {
  it("affiche le salaire si renseigné", () => {
    render(<CandidatureDetail candidature={richCandidature} />);
    expect(screen.getByText(/60[\s\u202f]?000/)).toBeInTheDocument();
  });

  it("n'affiche pas de salaire si absent", () => {
    render(<CandidatureDetail candidature={baseCandidature} />);
    expect(screen.queryByText(/salaire/i)).not.toBeInTheDocument();
  });

  it("affiche le secteur si renseigné", () => {
    render(<CandidatureDetail candidature={richCandidature} />);
    expect(screen.getByText("Tech")).toBeInTheDocument();
  });

  it("affiche la taille si renseignée", () => {
    render(<CandidatureDetail candidature={richCandidature} />);
    expect(screen.getByText("50-200")).toBeInTheDocument();
  });

  it("affiche le lien de l'offre si renseigné", () => {
    render(<CandidatureDetail candidature={richCandidature} />);
    const link = screen.getByRole("link", { name: /voir l'offre/i });
    expect(link).toHaveAttribute("href", "https://example.com/offre");
  });

  it("n'affiche pas le lien offre si absent", () => {
    render(<CandidatureDetail candidature={baseCandidature} />);
    expect(screen.queryByRole("link", { name: /voir l'offre/i })).not.toBeInTheDocument();
  });

  it("affiche le nom du contact si renseigné", () => {
    render(<CandidatureDetail candidature={richCandidature} />);
    expect(screen.getByText("Marie Dupont")).toBeInTheDocument();
  });

  it("affiche le lien email du contact", () => {
    render(<CandidatureDetail candidature={richCandidature} />);
    expect(screen.getByRole("link", { name: "marie@techcorp.com" })).toHaveAttribute(
      "href",
      "mailto:marie@techcorp.com"
    );
  });

  it("affiche le téléphone si renseigné", () => {
    render(<CandidatureDetail candidature={richCandidature} />);
    expect(screen.getByText("0612345678")).toBeInTheDocument();
  });

  it("n'affiche pas la section contact si tous les champs sont vides", () => {
    render(<CandidatureDetail candidature={baseCandidature} />);
    expect(screen.queryByText("Contact recruteur")).not.toBeInTheDocument();
  });
});

describe("CandidatureDetail — changement de statut", () => {
  it("appelle l'API PATCH avec le nouveau statut", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    render(<CandidatureDetail candidature={baseCandidature} />);

    const select = screen.getAllByRole("combobox")[0];
    fireEvent.change(select, { target: { value: "entretien1" } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/candidatures/cand-1",
        expect.objectContaining({
          method: "PATCH",
          body: expect.stringContaining("entretien1"),
        })
      );
    });
  });

  it("affiche un toast après changement de statut", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    render(<CandidatureDetail candidature={baseCandidature} />);

    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "offre" } });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Statut mis à jour" })
      );
    });
  });

  it("ne toast pas si l'API retourne une erreur", async () => {
    mockFetch.mockResolvedValue({ ok: false });
    render(<CandidatureDetail candidature={baseCandidature} />);

    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "offre" } });

    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    expect(mockToast).not.toHaveBeenCalled();
  });
});

describe("CandidatureDetail — notes", () => {
  it("affiche le compteur de notes", () => {
    render(<CandidatureDetail candidature={richCandidature} />);
    expect(screen.getByText(`Notes (${richCandidature.notes.length})`)).toBeInTheDocument();
  });

  it("affiche le contenu des notes existantes", () => {
    render(<CandidatureDetail candidature={richCandidature} />);
    expect(screen.getByText("Très bonne impression")).toBeInTheDocument();
    expect(screen.getByText("RH très sympa")).toBeInTheDocument();
  });

  it("affiche le placeholder du textarea", () => {
    render(<CandidatureDetail candidature={baseCandidature} />);
    expect(screen.getByPlaceholderText("Ajouter une note...")).toBeInTheDocument();
  });

  it("le bouton Ajouter est désactivé si la note est vide", () => {
    render(<CandidatureDetail candidature={baseCandidature} />);
    expect(screen.getAllByRole("button", { name: /ajouter/i })[0]).toBeDisabled();
  });

  it("le bouton Ajouter s'active quand on tape du texte", async () => {
    const user = userEvent.setup();
    render(<CandidatureDetail candidature={baseCandidature} />);

    await user.type(screen.getByPlaceholderText("Ajouter une note..."), "Ma note");
    expect(screen.getAllByRole("button", { name: /ajouter/i })[0]).toBeEnabled();
  });

  it("n'envoie pas si la note est vide (guard handleAddNote)", async () => {
    render(<CandidatureDetail candidature={baseCandidature} />);
    // Tenter de cliquer le bouton désactivé ne déclenche rien
    fireEvent.click(screen.getAllByRole("button", { name: /ajouter/i })[0]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("appelle POST /api/notes avec le bon contenu", async () => {
    const user = userEvent.setup();
    const updated = { ...baseCandidature, notes: [{ id: "note-new", contenu: "Nouvelle note", createdAt: "2024-01-20T00:00:00.000Z" }] };
    mockFetch
      .mockResolvedValueOnce({ ok: true }) // POST /api/notes
      .mockResolvedValueOnce({ ok: true, json: async () => updated }); // refresh

    render(<CandidatureDetail candidature={baseCandidature} />);

    await user.type(screen.getByPlaceholderText("Ajouter une note..."), "Nouvelle note");
    await user.click(screen.getAllByRole("button", { name: /ajouter/i })[0]);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/notes",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("Nouvelle note"),
        })
      );
    });
  });

  it("affiche un toast après ajout de note", async () => {
    const user = userEvent.setup();
    const updated = { ...baseCandidature, notes: [] };
    mockFetch
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true, json: async () => updated });

    render(<CandidatureDetail candidature={baseCandidature} />);
    await user.type(screen.getByPlaceholderText("Ajouter une note..."), "Test note");
    await user.click(screen.getAllByRole("button", { name: /ajouter/i })[0]);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Note ajoutée" }));
    });
  });

  it("supprime une note via DELETE /api/notes/:id", async () => {
    mockFetch.mockResolvedValue({ ok: true });
    render(<CandidatureDetail candidature={richCandidature} />);

    // Boutons X de suppression des notes (boutons sans texte visible)
    const deleteNoteButtons = screen.getAllByRole("button").filter(
      (b) => b.className?.includes("text-muted-foreground") && !b.textContent?.trim()
    );
    fireEvent.click(deleteNoteButtons[0]);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/notes/note-1",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  it("retire la note supprimée de l'interface", async () => {
    mockFetch.mockResolvedValue({ ok: true });
    render(<CandidatureDetail candidature={richCandidature} />);

    expect(screen.getByText("Très bonne impression")).toBeInTheDocument();

    // Clic sur le premier bouton X inline (suppression note-1)
    const xButtons = screen.getAllByRole("button").filter(
      (b) => b.className?.includes("text-muted-foreground") && b.className?.includes("shrink-0") && !b.textContent?.trim()
    );
    fireEvent.click(xButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText("Très bonne impression")).not.toBeInTheDocument();
    });
  });

  it("affiche un toast après suppression de note", async () => {
    mockFetch.mockResolvedValue({ ok: true });
    render(<CandidatureDetail candidature={richCandidature} />);

    const xButtons = screen.getAllByRole("button").filter(
      (b) => b.className?.includes("text-muted-foreground") && b.className?.includes("shrink-0") && !b.textContent?.trim()
    );
    fireEvent.click(xButtons[0]);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Note supprimée" }));
    });
  });
});

describe("CandidatureDetail — documents", () => {
  it("affiche le compteur de documents", () => {
    render(<CandidatureDetail candidature={richCandidature} />);
    expect(screen.getByText(`Documents (${richCandidature.documents.length})`)).toBeInTheDocument();
  });

  it("affiche le nom du document", () => {
    render(<CandidatureDetail candidature={richCandidature} />);
    expect(screen.getByText("CV_2024.pdf")).toBeInTheDocument();
  });

  it("affiche le label 'Uploader un fichier'", () => {
    render(<CandidatureDetail candidature={baseCandidature} />);
    expect(screen.getByText("Uploader un fichier")).toBeInTheDocument();
  });

  it("uploade un fichier et appelle POST /api/documents", async () => {
    const updated = { ...baseCandidature };
    mockFetch
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true, json: async () => updated });

    render(<CandidatureDetail candidature={baseCandidature} />);

    const fileInput = document.querySelector("#file-upload") as HTMLInputElement;
    const file = new File(["content"], "cv.pdf", { type: "application/pdf" });
    Object.defineProperty(fileInput, "files", { value: [file], writable: false });
    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/documents",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("affiche un toast de succès après upload", async () => {
    const updated = { ...baseCandidature };
    mockFetch
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true, json: async () => updated });

    render(<CandidatureDetail candidature={baseCandidature} />);

    const fileInput = document.querySelector("#file-upload") as HTMLInputElement;
    const file = new File(["c"], "test.pdf", { type: "application/pdf" });
    Object.defineProperty(fileInput, "files", { value: [file], writable: false });
    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Document uploadé" }));
    });
  });

  it("affiche un toast d'erreur si l'upload échoue", async () => {
    mockFetch.mockResolvedValue({ ok: false });

    render(<CandidatureDetail candidature={baseCandidature} />);

    const fileInput = document.querySelector("#file-upload") as HTMLInputElement;
    const file = new File(["c"], "test.pdf", { type: "application/pdf" });
    Object.defineProperty(fileInput, "files", { value: [file], writable: false });
    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: "destructive" })
      );
    });
  });

  it("ne fait rien si aucun fichier sélectionné", async () => {
    render(<CandidatureDetail candidature={baseCandidature} />);
    const fileInput = document.querySelector("#file-upload") as HTMLInputElement;
    Object.defineProperty(fileInput, "files", { value: [], writable: false });
    fireEvent.change(fileInput);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("supprime un document via DELETE /api/documents/:id", async () => {
    mockFetch.mockResolvedValue({ ok: true });
    render(<CandidatureDetail candidature={richCandidature} />);

    // Bouton suppression du document (classe h-7 w-7 text-destructive)
    const trashButtons = screen.getAllByRole("button").filter(
      (b) => b.className?.includes("h-7 w-7") && b.className?.includes("text-destructive") && !b.textContent?.trim()
    );
    fireEvent.click(trashButtons[0]);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/documents/doc-1",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  it("retire le document supprimé de l'interface", async () => {
    mockFetch.mockResolvedValue({ ok: true });
    render(<CandidatureDetail candidature={richCandidature} />);

    expect(screen.getByText("CV_2024.pdf")).toBeInTheDocument();

    const trashButtons = screen.getAllByRole("button").filter(
      (b) => b.className?.includes("h-7 w-7") && b.className?.includes("text-destructive") && !b.textContent?.trim()
    );
    fireEvent.click(trashButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText("CV_2024.pdf")).not.toBeInTheDocument();
    });
  });
});

describe("CandidatureDetail — rappels", () => {
  it("affiche 'Aucun rappel' si la liste est vide", () => {
    render(<CandidatureDetail candidature={baseCandidature} />);
    expect(screen.getByText("Aucun rappel")).toBeInTheDocument();
  });

  it("affiche les rappels existants", () => {
    render(<CandidatureDetail candidature={richCandidature} />);
    expect(screen.getByText("Relancer RH")).toBeInTheDocument();
    expect(screen.getByText("Préparer entretien")).toBeInTheDocument();
  });

  it("affiche '✓ Fait' pour les rappels terminés", () => {
    render(<CandidatureDetail candidature={richCandidature} />);
    expect(screen.getByText("✓ Fait")).toBeInTheDocument();
  });

  it("n'affiche pas le bouton 'check' pour un rappel déjà fait", () => {
    render(<CandidatureDetail candidature={richCandidature} />);
    // rap-2 a status "fait", pas de bouton check pour lui
    const checkButtons = screen.getAllByRole("button").filter(
      (b) => b.querySelector(".lucide-check") && b.className.includes("text-green")
    );
    // Seul rap-1 (a_faire) a le bouton check
    expect(checkButtons).toHaveLength(1);
  });

  it("ouvre le formulaire d'ajout de rappel au clic sur 'Ajouter'", () => {
    render(<CandidatureDetail candidature={baseCandidature} />);

    // Pas de champ date avant d'ouvrir
    expect(screen.queryByText("Date")).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /ajouter/i })[1]);

    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/relancer pour/i)).toBeInTheDocument();
  });

  it("ferme le formulaire au clic sur Annuler", () => {
    render(<CandidatureDetail candidature={baseCandidature} />);

    fireEvent.click(screen.getAllByRole("button", { name: /ajouter/i })[1]);
    expect(screen.getByPlaceholderText(/relancer pour/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /annuler/i }));
    expect(screen.queryByPlaceholderText(/relancer pour/i)).not.toBeInTheDocument();
  });

  it("ne soumet pas le rappel si la date est vide (guard)", async () => {
    render(<CandidatureDetail candidature={baseCandidature} />);
    fireEvent.click(screen.getAllByRole("button", { name: /ajouter/i })[1]);

    // Rempli le message mais pas la date
    fireEvent.change(screen.getByPlaceholderText(/relancer pour/i), {
      target: { value: "Relancer" },
    });
    fireEvent.click(screen.getByRole("button", { name: /créer/i }));

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("ne soumet pas si le message est vide (guard)", async () => {
    render(<CandidatureDetail candidature={baseCandidature} />);
    fireEvent.click(screen.getAllByRole("button", { name: /ajouter/i })[1]);

    // Rempli la date mais pas le message
    const dateInput = document.querySelector("input.h-8") as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "2024-03-01T10:00" } });
    fireEvent.click(screen.getByRole("button", { name: /créer/i }));

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("appelle POST /api/rappels avec les bonnes données", async () => {
    const updated = { ...baseCandidature, rappels: [] };
    mockFetch
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true, json: async () => updated });

    render(<CandidatureDetail candidature={baseCandidature} />);
    fireEvent.click(screen.getAllByRole("button", { name: /ajouter/i })[1]);

    fireEvent.change(document.querySelector("input.h-8") as HTMLInputElement, { target: { value: "2024-03-01T10:00" } });
    fireEvent.change(screen.getByPlaceholderText(/relancer pour/i), {
      target: { value: "Relancer RH" },
    });
    fireEvent.click(screen.getByRole("button", { name: /créer/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/rappels",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("Relancer RH"),
        })
      );
    });
  });

  it("affiche un toast après création du rappel", async () => {
    const updated = { ...baseCandidature, rappels: [] };
    mockFetch
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true, json: async () => updated });

    render(<CandidatureDetail candidature={baseCandidature} />);
    fireEvent.click(screen.getAllByRole("button", { name: /ajouter/i })[1]);
    fireEvent.change(document.querySelector("input.h-8") as HTMLInputElement, { target: { value: "2024-03-01T10:00" } });
    fireEvent.change(screen.getByPlaceholderText(/relancer pour/i), {
      target: { value: "Relancer" },
    });
    fireEvent.click(screen.getByRole("button", { name: /créer/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Rappel créé" }));
    });
  });

  it("marque un rappel comme fait", async () => {
    mockFetch.mockResolvedValue({ ok: true });
    render(<CandidatureDetail candidature={richCandidature} />);

    const checkButton = screen.getAllByRole("button").find(
      (b) => b.querySelector(".lucide-check") && b.className.includes("text-green")
    )!;
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/rappels/rap-1",
        expect.objectContaining({
          method: "PATCH",
          body: expect.stringContaining("fait"),
        })
      );
    });
  });

  it("affiche un toast après marqué comme fait", async () => {
    mockFetch.mockResolvedValue({ ok: true });
    render(<CandidatureDetail candidature={richCandidature} />);

    const checkButton = screen.getAllByRole("button").find(
      (b) => b.querySelector(".lucide-check") && b.className.includes("text-green")
    )!;
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Rappel marqué comme fait" })
      );
    });
  });

  it("supprime un rappel via DELETE /api/rappels/:id", async () => {
    mockFetch.mockResolvedValue({ ok: true });
    render(<CandidatureDetail candidature={richCandidature} />);

    // Boutons X de suppression de rappels (pas de shrink-0 contrairement aux notes)
    const xRappelButtons = screen.getAllByRole("button").filter(
      (b) => b.className?.includes("text-muted-foreground") &&
             !b.className?.includes("shrink-0") &&
             !b.textContent?.trim()
    );
    fireEvent.click(xRappelButtons[0]);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/rappels\//),
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  it("retire le rappel supprimé de l'interface", async () => {
    mockFetch.mockResolvedValue({ ok: true });
    render(<CandidatureDetail candidature={richCandidature} />);

    expect(screen.getByText("Relancer RH")).toBeInTheDocument();

    const xButtons = screen.getAllByRole("button").filter(
      (b) => b.className?.includes("text-muted-foreground") &&
             !b.className?.includes("shrink-0") &&
             !b.textContent?.trim()
    );
    fireEvent.click(xButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText("Relancer RH")).not.toBeInTheDocument();
    });
  });
});

describe("CandidatureDetail — suppression de la candidature", () => {
  it("demande confirmation avant de supprimer", async () => {
    window.confirm = jest.fn(() => false);
    mockFetch.mockResolvedValue({ ok: true });
    render(<CandidatureDetail candidature={baseCandidature} />);

    const trashButton = screen.getAllByRole("button").find(
      (b) => b.className?.startsWith("text-destructive") && !b.textContent?.trim()
    )!;
    fireEvent.click(trashButton);

    expect(window.confirm).toHaveBeenCalledWith("Supprimer définitivement cette candidature ?");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("appelle DELETE /api/candidatures/:id si confirmé", async () => {
    window.confirm = jest.fn(() => true);
    mockFetch.mockResolvedValue({ ok: true });
    render(<CandidatureDetail candidature={baseCandidature} />);

    const trashButton = screen.getAllByRole("button").find(
      (b) => b.className?.startsWith("text-destructive") && !b.textContent?.trim()
    )!;
    fireEvent.click(trashButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/candidatures/cand-1",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  it("redirige vers /candidatures après suppression", async () => {
    window.confirm = jest.fn(() => true);
    mockFetch.mockResolvedValue({ ok: true });
    render(<CandidatureDetail candidature={baseCandidature} />);

    const trashButton = screen.getAllByRole("button").find(
      (b) => b.className?.startsWith("text-destructive") && !b.textContent?.trim()
    )!;
    fireEvent.click(trashButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/candidatures");
    });
  });

  it("affiche un toast après suppression", async () => {
    window.confirm = jest.fn(() => true);
    mockFetch.mockResolvedValue({ ok: true });
    render(<CandidatureDetail candidature={baseCandidature} />);

    const trashButton = screen.getAllByRole("button").find(
      (b) => b.className?.startsWith("text-destructive") && !b.textContent?.trim()
    )!;
    fireEvent.click(trashButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Candidature supprimée" })
      );
    });
  });

  it("ne supprime pas si l'utilisateur annule la confirmation", async () => {
    window.confirm = jest.fn(() => false);
    render(<CandidatureDetail candidature={baseCandidature} />);

    const trashButton = screen.getAllByRole("button").find(
      (b) => b.className?.startsWith("text-destructive") && !b.textContent?.trim()
    )!;
    fireEvent.click(trashButton);

    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
