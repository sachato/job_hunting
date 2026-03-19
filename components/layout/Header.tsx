"use client";

import { useSession } from "next-auth/react";
import { Bell, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/lib/i18n";

type PageKey = keyof typeof translations.fr.pages;

interface HeaderProps {
  pageKey?: PageKey;
  title?: string;
  description?: string;
}

export function Header({ pageKey, title, description }: HeaderProps) {
  const { data: session } = useSession();
  const { lang, setLang, t } = useLanguage();

  const resolvedTitle = pageKey ? t.pages[pageKey].title : title;
  const resolvedDescription = pageKey ? t.pages[pageKey].description : description;

  const handleExport = async () => {
    try {
      const res = await fetch("/api/export");
      if (!res.ok) throw new Error("Erreur export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `candidatures-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: t.header.exportSuccess, description: t.header.exportSuccessDesc });
    } catch {
      toast({ title: t.header.exportError, description: t.header.exportErrorDesc, variant: "destructive" });
    }
  };

  return (
    <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold">{resolvedTitle}</h1>
        {resolvedDescription && (
          <p className="text-sm text-muted-foreground">{resolvedDescription}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLang(lang === "fr" ? "en" : "fr")}
          className="font-semibold w-12"
        >
          {lang === "fr" ? "EN" : "FR"}
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-1" />
          {t.header.exportCsv}
        </Button>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
          {session?.user?.email?.[0]?.toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  );
}
