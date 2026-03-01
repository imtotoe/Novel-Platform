import crypto from "crypto";

/**
 * Verify Bearer token from cron request using timing-safe comparison.
 * Returns true if the token matches CRON_SECRET.
 */
export function verifyCronAuth(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (token.length !== secret.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(token, "utf-8"),
    Buffer.from(secret, "utf-8")
  );
}
