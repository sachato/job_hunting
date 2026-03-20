import { formatDate, formatSalaire, getStatutLabel, getStatutColor, STATUTS } from "@/lib/utils";

describe("formatDate", () => {
  it("formats a date string in fr-FR by default", () => {
    expect(formatDate("2024-01-15")).toBe("15/01/2024");
  });

  it("formats a date string in en-US locale", () => {
    expect(formatDate("2024-01-15", "en-US")).toBe("01/15/2024");
  });

  it("accepts a Date object", () => {
    expect(formatDate(new Date("2024-06-01T00:00:00Z"), "fr-FR")).toBe("01/06/2024");
  });
});

describe("formatSalaire", () => {
  it("returns em dash for null", () => {
    expect(formatSalaire(null)).toBe("—");
  });

  it("returns em dash for undefined", () => {
    expect(formatSalaire(undefined)).toBe("—");
  });

  it("returns em dash for zero", () => {
    expect(formatSalaire(0)).toBe("—");
  });

  it("formats a salary value with EUR currency", () => {
    const result = formatSalaire(50000);
    expect(result).toMatch(/50[\s\u202f]?000/);
    expect(result).toContain("€");
  });

  it("formats a large salary", () => {
    const result = formatSalaire(120000);
    expect(result).toMatch(/120[\s\u202f]?000/);
  });
});

describe("getStatutLabel", () => {
  it("returns French label for known statuts", () => {
    expect(getStatutLabel("envisage")).toBe("Envisagé");
    expect(getStatutLabel("postule")).toBe("Postulé");
    expect(getStatutLabel("entretien1")).toBe("Entretien 1");
    expect(getStatutLabel("entretien2")).toBe("Entretien 2");
    expect(getStatutLabel("offre")).toBe("Offre");
    expect(getStatutLabel("refus")).toBe("Refus");
    expect(getStatutLabel("archive")).toBe("Archivé");
  });

  it("returns the raw value for an unknown statut", () => {
    expect(getStatutLabel("inconnu")).toBe("inconnu");
  });
});

describe("getStatutColor", () => {
  it("returns color class for postule (blue)", () => {
    expect(getStatutColor("postule")).toContain("blue");
  });

  it("returns color class for offre (green)", () => {
    expect(getStatutColor("offre")).toContain("green");
  });

  it("returns color class for refus (red)", () => {
    expect(getStatutColor("refus")).toContain("red");
  });

  it("returns default gray for unknown statut", () => {
    expect(getStatutColor("unknown")).toContain("gray");
  });
});

describe("STATUTS", () => {
  it("contains all 7 expected statuts", () => {
    expect(STATUTS).toHaveLength(7);
    const values = STATUTS.map((s) => s.value);
    expect(values).toContain("envisage");
    expect(values).toContain("postule");
    expect(values).toContain("entretien1");
    expect(values).toContain("entretien2");
    expect(values).toContain("offre");
    expect(values).toContain("refus");
    expect(values).toContain("archive");
  });

  it("each statut has a non-empty value, label, and color", () => {
    STATUTS.forEach((s) => {
      expect(s.value.length).toBeGreaterThan(0);
      expect(s.label.length).toBeGreaterThan(0);
      expect(s.color.length).toBeGreaterThan(0);
    });
  });
});
