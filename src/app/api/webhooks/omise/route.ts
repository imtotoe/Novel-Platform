import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { completeCoinPurchase } from "@/modules/coin/coin.service";
import { verifyOmiseSignature } from "@/modules/coin/coin.security";

// POST — Omise webhook for charge completion
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("omise-signature") || "";

  // Verify HMAC signature if secret is configured
  const webhookSecret = process.env.OMISE_WEBHOOK_SIGNING_SECRET;
  if (webhookSecret && signature) {
    if (!verifyOmiseSignature(rawBody, signature, webhookSecret)) {
      console.error("Omise webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const event = JSON.parse(rawBody);

  // Only handle charge.complete events
  if (event.key !== "charge.complete") {
    return NextResponse.json({ received: true });
  }

  const charge = event.data;
  const chargeId = charge.id as string;

  // Idempotency: find the transaction by gateway ID
  const transaction = await prisma.coinTransaction.findUnique({
    where: { gatewayTxId: chargeId },
  });

  if (!transaction) {
    console.error(`Omise webhook: no transaction for charge ${chargeId}`);
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  if (transaction.status !== "PENDING") {
    // Already processed (idempotent)
    return NextResponse.json({ received: true, status: transaction.status });
  }

  if (charge.status === "successful") {
    await completeCoinPurchase(transaction.id);
    return NextResponse.json({ received: true, status: "COMPLETED" });
  } else if (charge.status === "failed") {
    await prisma.coinTransaction.update({
      where: { id: transaction.id },
      data: {
        status: "FAILED",
        failureCode: charge.failure_code,
        failureMessage: charge.failure_message,
      },
    });
    return NextResponse.json({ received: true, status: "FAILED" });
  } else if (charge.status === "expired") {
    await prisma.coinTransaction.update({
      where: { id: transaction.id },
      data: { status: "EXPIRED", expiredAt: new Date() },
    });
    return NextResponse.json({ received: true, status: "EXPIRED" });
  }

  return NextResponse.json({ received: true });
}
