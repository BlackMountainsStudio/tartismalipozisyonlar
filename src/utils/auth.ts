import crypto from "crypto";

/**
 * Creates a deterministic hash of the admin token using HMAC-SHA256
 * This allows for fast verification in middleware while avoiding storing plaintext
 * @param token - The admin secret
 * @returns string - The hashed token
 */
export function hashAdminToken(token: string): string {
  const salt = process.env.ADMIN_TOKEN_SALT || "admin_token_salt_2024";
  return crypto.createHmac("sha256", salt).update(token).digest("hex");
}

/**
 * Verifies if a hashed token was generated from the correct admin secret
 * @param adminSecret - The admin secret to verify against
 * @param hashedToken - The stored hashed token
 * @returns boolean - True if the hash matches
 */
export function verifyAdminToken(adminSecret: string, hashedToken: string): boolean {
  try {
    const expectedHash = hashAdminToken(adminSecret);
    return crypto.timingSafeEqual(
      Buffer.from(hashedToken, "hex"),
      Buffer.from(expectedHash, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Checks if a token matches the admin secret and returns a hashed version
 * @param token - The token to verify
 * @param adminSecret - The admin secret to compare against
 * @returns string | null - Hashed token if valid, null otherwise
 */
export function validateAndHashAdminToken(token: string, adminSecret: string): string | null {
  if (!adminSecret || token !== adminSecret) {
    return null;
  }
  return hashAdminToken(token);
}