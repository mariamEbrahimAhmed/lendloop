import { appError, ErrorCode } from "./errors";

// Convex has no email type (only v.string()), so every mutation that saves an
// email passes it through normalizeEmail() first.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Trims and lower-cases an email; throws ErrorCode.InvalidEmail if it isn't valid. */
export function normalizeEmail(raw: string): string {
  const email = raw.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    throw appError(ErrorCode.InvalidEmail);
  }
  return email;
}
