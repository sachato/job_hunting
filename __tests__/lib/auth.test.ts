import { authOptions } from "@/lib/auth";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockFindUnique = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

const mockCompare = jest.fn();
jest.mock("bcryptjs", () => ({
  compare: (...args: unknown[]) => mockCompare(...args),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

// En NextAuth v4, la vraie fonction authorize est dans provider.options.authorize
// (provider.authorize est juste un stub qui retourne null)
const authorize = (authOptions.providers[0] as unknown as {
  options: { authorize: (creds: Record<string, string> | undefined) => Promise<{ id: string; email: string } | null> };
}).options.authorize;

const jwtCallback = authOptions.callbacks!.jwt!;
const sessionCallback = authOptions.callbacks!.session!;

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Configuration ────────────────────────────────────────────────────────────

describe("authOptions — configuration", () => {
  it("utilise la stratégie JWT", () => {
    expect(authOptions.session?.strategy).toBe("jwt");
  });

  it("a une durée de session de 30 jours", () => {
    expect(authOptions.session?.maxAge).toBe(30 * 24 * 60 * 60);
  });

  it("redirige vers /login pour la connexion", () => {
    expect(authOptions.pages?.signIn).toBe("/login");
  });

  it("redirige vers /login pour les erreurs d'auth", () => {
    expect(authOptions.pages?.error).toBe("/login");
  });

  it("a exactement un provider", () => {
    expect(authOptions.providers).toHaveLength(1);
  });

  it("a des callbacks jwt et session définis", () => {
    expect(typeof authOptions.callbacks?.jwt).toBe("function");
    expect(typeof authOptions.callbacks?.session).toBe("function");
  });
});

// ─── authorize ────────────────────────────────────────────────────────────────

describe("authOptions — authorize", () => {
  it("lève une erreur si credentials est undefined", async () => {
    await expect(authorize(undefined)).rejects.toThrow("Email et mot de passe requis");
  });

  it("lève une erreur si l'email est vide", async () => {
    await expect(authorize({ email: "", password: "test123" })).rejects.toThrow("Email et mot de passe requis");
  });

  it("lève une erreur si le mot de passe est vide", async () => {
    await expect(authorize({ email: "test@test.com", password: "" })).rejects.toThrow("Email et mot de passe requis");
  });

  it("cherche l'utilisateur par email dans la base", async () => {
    mockFindUnique.mockResolvedValue(null);
    try { await authorize({ email: "test@test.com", password: "pass" }); } catch {}
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { email: "test@test.com" } });
  });

  it("lève une erreur si l'utilisateur n'existe pas", async () => {
    mockFindUnique.mockResolvedValue(null);
    await expect(
      authorize({ email: "inconnu@test.com", password: "pass" })
    ).rejects.toThrow("Email ou mot de passe incorrect");
  });

  it("compare le mot de passe fourni avec le hash stocké", async () => {
    mockFindUnique.mockResolvedValue({ id: "u1", email: "test@test.com", passwordHash: "hash123" });
    mockCompare.mockResolvedValue(false);
    try { await authorize({ email: "test@test.com", password: "monpass" }); } catch {}
    expect(mockCompare).toHaveBeenCalledWith("monpass", "hash123");
  });

  it("lève une erreur si le mot de passe est incorrect", async () => {
    mockFindUnique.mockResolvedValue({ id: "u1", email: "test@test.com", passwordHash: "hash" });
    mockCompare.mockResolvedValue(false);
    await expect(
      authorize({ email: "test@test.com", password: "mauvais" })
    ).rejects.toThrow("Email ou mot de passe incorrect");
  });

  it("retourne { id, email } si les credentials sont valides", async () => {
    mockFindUnique.mockResolvedValue({ id: "u1", email: "test@test.com", passwordHash: "hash" });
    mockCompare.mockResolvedValue(true);
    const result = await authorize({ email: "test@test.com", password: "correct" });
    expect(result).toEqual({ id: "u1", email: "test@test.com" });
  });

  it("ne retourne pas passwordHash dans le résultat", async () => {
    mockFindUnique.mockResolvedValue({ id: "u1", email: "test@test.com", passwordHash: "hash" });
    mockCompare.mockResolvedValue(true);
    const result = await authorize({ email: "test@test.com", password: "correct" });
    expect(result).not.toHaveProperty("passwordHash");
  });
});

// ─── Callback JWT ─────────────────────────────────────────────────────────────

describe("authOptions — callback jwt", () => {
  it("ajoute l'id de l'utilisateur au token", async () => {
    const token = { sub: "sub-1" };
    const user = { id: "user-1", email: "test@test.com", name: null };
    const result = await jwtCallback({ token, user } as never);
    expect(result.id).toBe("user-1");
  });

  it("retourne le token inchangé si user est absent", async () => {
    const token = { sub: "sub-1", id: "deja-la" };
    const result = await jwtCallback({ token } as never);
    expect(result).toEqual({ sub: "sub-1", id: "deja-la" });
  });

  it("ne modifie pas les autres champs du token", async () => {
    const token = { sub: "sub-1", email: "test@test.com", iat: 12345 };
    const user = { id: "user-1", email: "test@test.com" };
    const result = await jwtCallback({ token, user } as never);
    expect(result.sub).toBe("sub-1");
    expect(result.email).toBe("test@test.com");
    expect(result.iat).toBe(12345);
  });
});

// ─── Callback session ─────────────────────────────────────────────────────────

describe("authOptions — callback session", () => {
  it("ajoute l'id du token à session.user", async () => {
    const session = { user: { email: "test@test.com" }, expires: "2025-01-01" };
    const token = { id: "user-1", sub: "sub-1" };
    const result = await sessionCallback({ session, token } as never) as typeof session;
    expect(result.user?.id).toBe("user-1");
  });

  it("retourne la session inchangée si session.user est absent", async () => {
    const session = { expires: "2025-01-01" };
    const token = { id: "user-1" };
    const result = await sessionCallback({ session, token } as never);
    expect(result).toEqual({ expires: "2025-01-01" });
  });

  it("conserve les autres champs de session.user", async () => {
    const session = { user: { email: "test@test.com", name: "Alice" }, expires: "2025-01-01" };
    const token = { id: "user-1" };
    const result = await sessionCallback({ session, token } as never) as typeof session;
    expect(result.user?.email).toBe("test@test.com");
    expect(result.user?.name).toBe("Alice");
  });
});
