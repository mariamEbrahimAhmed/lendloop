import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { routing } from "./routing";

// Loads the messages for the current language on the server.
// The language comes from the [locale] URL segment via next/root-params,
// so pages stay statically prerendered per language (works with cacheComponents).
export default getRequestConfig(async ({ locale: override }) => {
  const requested = override ?? (await rootLocale());
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`./${locale}.json`)).default,
  };
});
