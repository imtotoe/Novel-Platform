import crypto from "crypto";
import { WEBHOOK_TIMESTAMP_TOLERANCE_MS } from "./coin.constants";

/**
 * Verify Omise webhook HMAC signature
 */
export function verifyOmiseSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Check if webhook timestamp is within tolerance (5 minutes)
 */
export function isTimestampValid(timestamp: string | number): boolean {
  const ts = typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp * 1000;
  const now = Date.now();
  return Math.abs(now - ts) <= WEBHOOK_TIMESTAMP_TOLERANCE_MS;
}
