import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST — create charge via Omise
export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { coinPackId, paymentMethod, returnUri } = await request.json();

  if (!coinPackId || !paymentMethod) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const pack = await prisma.coinPack.findUnique({ where: { id: coinPackId } });
  if (!pack || !pack.isActive) {
    return NextResponse.json({ error: "Invalid coin pack" }, { status: 400 });
  }

  // Import Omise SDK dynamically
  const Omise = (await import("omise")).default;
  const omise = Omise({
    secretKey: process.env.OMISE_SECRET_KEY!,
  });

  try {
    // Create Omise source for PromptPay or charge for card
    let charge;

    if (paymentMethod === "promptpay") {
      const source = await omise.sources.create({
        amount: pack.price,
        currency: "THB",
        type: "promptpay",
      });

      charge = await omise.charges.create({
        amount: pack.price,
        currency: "THB",
        source: source.id,
        return_uri: returnUri || `${process.env.NEXT_PUBLIC_APP_URL}/coins/status`,
      });
    } else if (paymentMethod === "truemoney") {
      const source = await omise.sources.create({
        amount: pack.price,
        currency: "THB",
        type: "truemoney",
      });

      charge = await omise.charges.create({
        amount: pack.price,
        currency: "THB",
        source: source.id,
        return_uri: returnUri || `${process.env.NEXT_PUBLIC_APP_URL}/coins/status`,
      });
    } else {
      return NextResponse.json({ error: "Unsupported payment method" }, { status: 400 });
    }

    // Create pending transaction
    const transaction = await prisma.coinTransaction.create({
      data: {
        userId: session.user.id,
        coinPackId: pack.id,
        coinsGranted: pack.coins + pack.bonusCoins,
        paidAmount: pack.price,
        paymentGateway: "omise",
        gatewayTxId: charge.id,
        gatewayPayload: charge as unknown as object,
        paymentMethod,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      transactionId: transaction.id,
      chargeId: charge.id,
      paymentMethod,
      amount: pack.price,
      qrCodeUrl: charge.source?.scannable_code?.image?.download_uri,
      authorizeUri: charge.authorize_uri,
      expiresAt: charge.expires_at,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment creation failed";
    console.error("Omise charge error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
