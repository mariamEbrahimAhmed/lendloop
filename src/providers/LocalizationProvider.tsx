import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";

// Makes translations available to Client Components (useTranslations, useLocale).
// Rendered from the server layout, it picks up the locale and messages from
// src/localization/request.ts automatically.
// Server Components don't need it: they call getTranslations() directly.
export function LocalizationProvider({ children }: { children: ReactNode }) {
  return <NextIntlClientProvider>{children}</NextIntlClientProvider>;
}
