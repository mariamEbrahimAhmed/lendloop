import type messages from "./en.json";
import type { routing } from "./routing";

// Makes translation keys type-checked: t("Home.titel") is a TypeScript error.
// en.json is the reference file; every other language must have the same keys.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
