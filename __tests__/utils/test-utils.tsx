import { render as rtlRender, type RenderOptions } from "@testing-library/react";
import { type ReactElement } from "react";
import { LanguageProvider } from "@/components/providers/LanguageProvider";

function AllProviders({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}

function render(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return rtlRender(ui, { wrapper: AllProviders, ...options });
}

export * from "@testing-library/react";
export { render };
