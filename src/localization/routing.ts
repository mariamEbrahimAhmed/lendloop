import { defineRouting } from "next-intl/routing";

// Supported languages. Add a locale here AND a matching <locale>.json next to this file.
export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  // Every URL carries its language: /en/..., /ar/...
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

// Languages written right-to-left. Used for <html dir>.
const rtlLocales: readonly Locale[] = ["ar"];

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}
