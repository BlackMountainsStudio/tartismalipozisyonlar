/**
 * Admin auth helpers.
 * Tokens are stored as HMAC-SHA256 digests — never as plaintext.
 */

async function sha256Hex(message: string): Promise<string> {
  const encoded = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Returns the hashed form of the admin secret to store/compare in the cookie. */
export async function hashAdminToken(plaintext: string): Promise<string> {
  return sha256Hex(`varodasi:admin:${plaintext}`);
}
