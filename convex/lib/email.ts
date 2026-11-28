import { ConvexError } from "convex/values";

// Convex has no email type (only v.string()), so every mutation that saves an
// email passes it through normalizeEmail() first.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Trims and lower-cases an email; throws if it isn't a valid address. */
export function normalizeEmail(raw: string): string {
  const email = raw.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    throw new ConvexError("Invalid email address");
  }
  return email;
}
