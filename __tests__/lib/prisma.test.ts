// Tests du singleton Prisma
// Chaque test réinitialise le registre de modules pour simuler un cold start

beforeEach(() => {
  jest.resetModules();
  // Supprimer l'éventuel singleton stocké dans globalThis entre les tests
  delete (globalThis as Record<string, unknown>).prisma;
});

afterEach(() => {
  delete (globalThis as Record<string, unknown>).prisma;
});

describe("prisma — singleton", () => {
  it("crée une instance PrismaClient au premier import", () => {
    const MockClient = jest.fn().mockReturnValue({ __mock: true });
    jest.doMock("@prisma/client", () => ({ PrismaClient: MockClient }));

    const { prisma } = require("@/lib/prisma");

    expect(MockClient).toHaveBeenCalledTimes(1);
    expect(prisma).toBeDefined();
  });

  it("réutilise l'instance déjà stockée dans globalThis", () => {
    const existingInstance = { __existing: true };
    (globalThis as Record<string, unknown>).prisma = existingInstance;

    const MockClient = jest.fn();
    jest.doMock("@prisma/client", () => ({ PrismaClient: MockClient }));

    const { prisma } = require("@/lib/prisma");

    expect(MockClient).not.toHaveBeenCalled();
    expect(prisma).toBe(existingInstance);
  });

  it("stocke l'instance dans globalThis hors production", () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as Record<string, unknown>).NODE_ENV = "test";

    const instance = { __test: true };
    const MockClient = jest.fn().mockReturnValue(instance);
    jest.doMock("@prisma/client", () => ({ PrismaClient: MockClient }));

    require("@/lib/prisma");

    expect((globalThis as Record<string, unknown>).prisma).toBe(instance);
    (process.env as Record<string, unknown>).NODE_ENV = originalEnv;
  });

  it("ne stocke pas dans globalThis en production", () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as Record<string, unknown>).NODE_ENV = "production";

    const MockClient = jest.fn().mockReturnValue({ __prod: true });
    jest.doMock("@prisma/client", () => ({ PrismaClient: MockClient }));

    require("@/lib/prisma");

    expect((globalThis as Record<string, unknown>).prisma).toBeUndefined();
    (process.env as Record<string, unknown>).NODE_ENV = originalEnv;
  });

  it("utilise log ['query','error','warn'] en développement", () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as Record<string, unknown>).NODE_ENV = "development";

    const MockClient = jest.fn().mockReturnValue({});
    jest.doMock("@prisma/client", () => ({ PrismaClient: MockClient }));

    require("@/lib/prisma");

    expect(MockClient).toHaveBeenCalledWith({ log: ["query", "error", "warn"] });
    (process.env as Record<string, unknown>).NODE_ENV = originalEnv;
  });

  it("utilise log ['error'] hors développement", () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as Record<string, unknown>).NODE_ENV = "production";

    const MockClient = jest.fn().mockReturnValue({});
    jest.doMock("@prisma/client", () => ({ PrismaClient: MockClient }));

    require("@/lib/prisma");

    expect(MockClient).toHaveBeenCalledWith({ log: ["error"] });
    (process.env as Record<string, unknown>).NODE_ENV = originalEnv;
  });
});
