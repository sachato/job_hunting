import {
  loginSchema,
  registerSchema,
  candidatureSchema,
  noteSchema,
  rappelSchema,
} from "@/lib/validations";

describe("loginSchema", () => {
  it("validates correct credentials", () => {
    expect(loginSchema.safeParse({ email: "test@test.com", password: "password123" }).success).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(loginSchema.safeParse({ email: "notanemail", password: "password123" }).success).toBe(false);
  });

  it("rejects empty password", () => {
    expect(loginSchema.safeParse({ email: "test@test.com", password: "" }).success).toBe(false);
  });

  it("rejects missing fields", () => {
    expect(loginSchema.safeParse({}).success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("validates correct data", () => {
    expect(registerSchema.safeParse({ email: "user@test.com", password: "password123" }).success).toBe(true);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({ email: "user@test.com", password: "short" });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toContain("8 caractères");
  });

  it("rejects invalid email", () => {
    expect(registerSchema.safeParse({ email: "invalid", password: "password123" }).success).toBe(false);
  });

  it("accepts password of exactly 8 characters", () => {
    expect(registerSchema.safeParse({ email: "user@test.com", password: "12345678" }).success).toBe(true);
  });
});

describe("candidatureSchema", () => {
  const validData = {
    poste: "Développeur Frontend",
    datePostulation: "2024-01-15",
    statut: "postule" as const,
    entreprise: { nom: "Acme Corp" },
  };

  it("validates correct candidature", () => {
    expect(candidatureSchema.safeParse(validData).success).toBe(true);
  });

  it("rejects empty poste", () => {
    expect(candidatureSchema.safeParse({ ...validData, poste: "" }).success).toBe(false);
  });

  it("rejects invalid statut value", () => {
    expect(candidatureSchema.safeParse({ ...validData, statut: "invalid" }).success).toBe(false);
  });

  it("accepts all valid statut values", () => {
    const validStatuts = ["envisage", "postule", "entretien1", "entretien2", "offre", "refus", "archive"] as const;
    validStatuts.forEach((statut) => {
      expect(candidatureSchema.safeParse({ ...validData, statut }).success).toBe(true);
    });
  });

  it("accepts optional fields as empty strings", () => {
    expect(candidatureSchema.safeParse({ ...validData, lienOffre: "", emailContact: "" }).success).toBe(true);
  });

  it("rejects an invalid URL for lienOffre", () => {
    expect(candidatureSchema.safeParse({ ...validData, lienOffre: "not-a-url" }).success).toBe(false);
  });

  it("accepts a valid URL for lienOffre", () => {
    expect(candidatureSchema.safeParse({ ...validData, lienOffre: "https://example.com/job" }).success).toBe(true);
  });

  it("rejects invalid emailContact", () => {
    expect(candidatureSchema.safeParse({ ...validData, emailContact: "notanemail" }).success).toBe(false);
  });

  it("accepts a positive salary", () => {
    expect(candidatureSchema.safeParse({ ...validData, salairePropose: 50000 }).success).toBe(true);
  });

  it("rejects empty entreprise nom", () => {
    expect(candidatureSchema.safeParse({ ...validData, entreprise: { nom: "" } }).success).toBe(false);
  });
});

describe("noteSchema", () => {
  it("validates a correct note", () => {
    expect(noteSchema.safeParse({ contenu: "Une note importante", candidatureId: "abc123" }).success).toBe(true);
  });

  it("rejects empty contenu", () => {
    const result = noteSchema.safeParse({ contenu: "", candidatureId: "abc123" });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toContain("vide");
  });

  it("rejects missing candidatureId", () => {
    expect(noteSchema.safeParse({ contenu: "Une note" }).success).toBe(false);
  });
});

describe("rappelSchema", () => {
  const valid = {
    date: "2024-12-01",
    type: "relance" as const,
    message: "Penser à relancer",
    candidatureId: "abc123",
  };

  it("validates a correct rappel", () => {
    expect(rappelSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts all valid type values", () => {
    (["relance", "entretien", "autre"] as const).forEach((type) => {
      expect(rappelSchema.safeParse({ ...valid, type }).success).toBe(true);
    });
  });

  it("rejects an invalid type", () => {
    expect(rappelSchema.safeParse({ ...valid, type: "invalide" }).success).toBe(false);
  });

  it("rejects empty message", () => {
    expect(rappelSchema.safeParse({ ...valid, message: "" }).success).toBe(false);
  });

  it("rejects missing date", () => {
    expect(rappelSchema.safeParse({ ...valid, date: "" }).success).toBe(false);
  });
});
