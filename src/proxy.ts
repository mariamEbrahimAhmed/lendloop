import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/localization/routing";

// Adds/validates the language prefix (/en, /ar) and redirects / to the
// visitor's language.
export default createIntlMiddleware(routing);

export const config = {
  // Every path except API routes, Next.js internals and files with an extension.
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
