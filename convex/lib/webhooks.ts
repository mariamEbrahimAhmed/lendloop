/**
 * Signature check for incoming webhooks signed with the Standard Webhooks
 * scheme (what Clerk uses, via Svix). Uses the built-in Web Crypto API; no
 * package needed.
 *
 * The sender signs `${id}.${timestamp}.${body}` with HMAC-SHA256 using the
 * endpoint's secret ("whsec_<base64>") and sends:
 *   svix-id, svix-timestamp (unix seconds), svix-signature ("v1,<base64> v1,<base64>…")
 */

/** Reject requests signed more than this long ago (or ahead): stops replays. */
const TOLERANCE_SECONDS = 5 * 60;

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * True if the request was signed with `secret`. Pass the raw body text:
 * re-serialized JSON would not match the signature.
 */
export async function verifyWebhookSignature(
  body: string,
  headers: Headers,
  secret: string,
): Promise<boolean> {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signatures = headers.get("svix-signature");
  if (!id || !timestamp || !signatures) return false;

  const sentAt = Number(timestamp);
  if (!Number.isInteger(sentAt) || Math.abs(Date.now() / 1000 - sentAt) > TOLERANCE_SECONDS) {
    return false;
  }

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      base64ToBytes(secret.replace(/^whsec_/, "")),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const signedContent = new TextEncoder().encode(`${id}.${timestamp}.${body}`);

    // The header can hold several signatures (e.g. during secret rotation); one match is enough.
    for (const entry of signatures.split(" ")) {
      const [version, signature] = entry.split(",");
      if (version !== "v1" || !signature) continue;
      // crypto.subtle.verify compares in constant time (no timing leaks).
      if (await crypto.subtle.verify("HMAC", key, base64ToBytes(signature), signedContent)) {
        return true;
      }
    }
  } catch {
    // Malformed secret or signature (bad base64): treat as not verified.
  }
  return false;
}
