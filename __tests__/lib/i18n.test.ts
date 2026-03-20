import { translations } from "@/lib/i18n";

/** Récupère toutes les clés feuilles d'un objet imbriqué */
function getLeafKeys(obj: object, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      return getLeafKeys(value as object, fullKey);
    }
    return [fullKey];
  });
}

/** Accède à une clé pointée (ex: "sidebar.dashboard") dans un objet */
function getNestedValue(obj: object, key: string): unknown {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[part];
    return undefined;
  }, obj);
}

describe("Structure des traductions i18n", () => {
  const frKeys = getLeafKeys(translations.fr);
  const enKeys = getLeafKeys(translations.en);

  it("EN contient toutes les clés de FR", () => {
    frKeys.forEach((key) => {
      expect(enKeys).toContain(key);
    });
  });

  it("FR contient toutes les clés de EN", () => {
    enKeys.forEach((key) => {
      expect(frKeys).toContain(key);
    });
  });

  it("aucune valeur vide dans FR", () => {
    frKeys.forEach((key) => {
      const value = getNestedValue(translations.fr, key);
      if (typeof value === "string") {
        expect(value.length).toBeGreaterThan(0);
      }
    });
  });

  it("aucune valeur vide dans EN", () => {
    enKeys.forEach((key) => {
      const value = getNestedValue(translations.en, key);
      if (typeof value === "string") {
        expect(value.length).toBeGreaterThan(0);
      }
    });
  });

  it("les statuts FR et EN ont les mêmes clés", () => {
    expect(Object.keys(translations.fr.statuts)).toEqual(Object.keys(translations.en.statuts));
  });

  it("les typesRappel FR et EN ont les mêmes clés", () => {
    expect(Object.keys(translations.fr.typesRappel)).toEqual(Object.keys(translations.en.typesRappel));
  });

  it("les pages FR et EN ont les mêmes clés", () => {
    expect(Object.keys(translations.fr.pages)).toEqual(Object.keys(translations.en.pages));
  });

  it("FR et EN ont des traductions différentes (pas de copié-collé)", () => {
    // Vérifie que les labels des statuts diffèrent entre les deux langues
    expect(translations.fr.statuts.postule).not.toBe(translations.en.statuts.postule);
    expect(translations.fr.sidebar.logout).not.toBe(translations.en.sidebar.logout);
  });
});
