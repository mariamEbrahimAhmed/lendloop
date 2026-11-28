import { ConvexError, type Value } from "convex/values";

/**
 * Errors the user is meant to see. Throw them with appError(); the client reads
 * `error.data.code` and shows the translated message (`Errors.<code>` in
 * src/localization/en.json and ar.json), so the server never sends UI text.
 *
 * Bugs and setup problems (e.g. "seed not run") throw a plain Error instead:
 * Convex hides those from clients in production ("Server Error").
 */
export enum ErrorCode {
  // General: the usual API error categories
  BadRequest = "bad_request", // the input is invalid
  Unauthenticated = "unauthenticated", // not signed in
  Forbidden = "forbidden", // signed in, but missing the permission
  NotFound = "not_found", // doesn't exist (or isn't visible to this user)
  Conflict = "conflict", // clashes with the current state (e.g. tool already lent out)
  RateLimited = "rate_limited", // too many attempts; try again later
  Unavailable = "unavailable", // an outside service is down; try again later

  // Specific: a clearer message for a common case of a general one
  InvalidEmail = "invalid_email", // a BadRequest
}

/**
 * HTTP status for each code, for httpActions that answer a caller with an error
 * (e.g. n8n calling Convex). Queries and mutations don't use it: their errors
 * reach the client as `error.data.code`. Unexpected errors are always 500.
 */
export const ERROR_HTTP_STATUS: Record<ErrorCode, number> = {
  [ErrorCode.BadRequest]: 400,
  [ErrorCode.Unauthenticated]: 401,
  [ErrorCode.Forbidden]: 403,
  [ErrorCode.NotFound]: 404,
  [ErrorCode.Conflict]: 409,
  [ErrorCode.RateLimited]: 429,
  [ErrorCode.Unavailable]: 503,
  [ErrorCode.InvalidEmail]: 400,
};

/** What an appError carries: its code, plus optional details (e.g. { toolId }). */
export type AppErrorData = { code: ErrorCode } & Record<string, Value>;

/** An expected error with a code. Usage: `throw appError(ErrorCode.Forbidden)`. */
export function appError(code: ErrorCode, details: Record<string, Value> = {}) {
  return new ConvexError<AppErrorData>({ ...details, code });
}

/** True if `error` came from appError() (and has `code`, when given). */
export function isAppError(
  error: unknown,
  code?: ErrorCode,
): error is ConvexError<AppErrorData> {
  if (!(error instanceof ConvexError)) return false;
  const data: unknown = error.data;
  return (
    typeof data === "object" &&
    data !== null &&
    "code" in data &&
    (code === undefined || data.code === code)
  );
}
