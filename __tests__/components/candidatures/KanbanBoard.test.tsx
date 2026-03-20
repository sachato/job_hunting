import { render, screen, waitFor } from "../../utils/test-utils";
import { KanbanBoard } from "@/components/candidatures/KanbanBoard";

const mockToast = jest.fn();

jest.mock("@/components/ui/use-toast", () => ({
  toast: (...args: unknown[]) => mockToast(...args),
}));

// Mock @dnd-kit/core pour éviter les problèmes de pointer events en jsdom
jest.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: React.PropsWithChildren) => <div data-testid="dnd-context">{children}</div>,
  DragOverlay: ({ children }: React.PropsWithChildren) => <div data-testid="drag-overlay">{children}</div>,
  PointerSensor: class {},
  useSensor: () => ({}),
  useSensors: (...args: unknown[]) => args,
  useDroppable: () => ({ setNodeRef: () => {}, isOver: false }),
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    isDragging: false,
  }),
}));

const mockCandidatures = [
  {
    id: "1",
    poste: "Développeur Frontend",
    statut: "postule",
    datePostulation: "2024-01-15T00:00:00.000Z",
    salairePropose: 50000,
    entreprise: { nom: "Acme Corp" },
  },
  {
    id: "2",
    poste: "Product Manager",
    statut: "entretien1",
    datePostulation: "2024-02-01T00:00:00.000Z",
    salairePropose: null,
    entreprise: { nom: "Beta Ltd" },
  },
];

const mockFetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = mockFetch;
});

describe("KanbanBoard", () => {
  it("affiche des colonnes de chargement pendant le fetch", () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<KanbanBoard />);
    // Les skeletons de loading sont des divs avec animate-pulse
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("affiche toutes les colonnes de statut après chargement", async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ candidatures: [] }),
    });
    render(<KanbanBoard />);
    await waitFor(() => {
      expect(screen.getByText("Envisagé")).toBeInTheDocument();
      expect(screen.getByText("Postulé")).toBeInTheDocument();
      expect(screen.getByText("Entretien 1")).toBeInTheDocument();
      expect(screen.getByText("Entretien 2")).toBeInTheDocument();
      expect(screen.getByText("Offre")).toBeInTheDocument();
      expect(screen.getByText("Refus")).toBeInTheDocument();
      expect(screen.getByText("Archivé")).toBeInTheDocument();
    });
  });

  it("affiche 'Vide' dans les colonnes sans candidature", async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ candidatures: [] }),
    });
    render(<KanbanBoard />);
    await waitFor(() => {
      expect(screen.getAllByText("Vide").length).toBe(7);
    });
  });

  it("affiche les candidatures dans la bonne colonne", async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ candidatures: mockCandidatures }),
    });
    render(<KanbanBoard />);
    await waitFor(() => {
      expect(screen.getByText("Développeur Frontend")).toBeInTheDocument();
      expect(screen.getByText("Product Manager")).toBeInTheDocument();
    });
  });

  it("affiche le nom de l'entreprise sur les cartes", async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ candidatures: mockCandidatures }),
    });
    render(<KanbanBoard />);
    await waitFor(() => {
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
      expect(screen.getByText("Beta Ltd")).toBeInTheDocument();
    });
  });

  it("wrap le board dans DndContext", async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ candidatures: [] }),
    });
    render(<KanbanBoard />);
    await waitFor(() => {
      expect(screen.getByTestId("dnd-context")).toBeInTheDocument();
    });
  });

  it("affiche 7 colonnes au total", async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({ candidatures: [] }),
    });
    render(<KanbanBoard />);
    await waitFor(() => {
      // 7 labels de statut dans les headers de colonnes
      const statuts = ["Envisagé", "Postulé", "Entretien 1", "Entretien 2", "Offre", "Refus", "Archivé"];
      statuts.forEach((s) => expect(screen.getByText(s)).toBeInTheDocument());
    });
  });
});
