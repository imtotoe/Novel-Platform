import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { seedBadges } from "@/lib/badges";
import { DEFAULT_COIN_PACKS } from "@/modules/coin/coin.constants";

// POST — Seed badges and coin packs (admin only)
export async function POST() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  await seedBadges();

  // Seed coin packs
  for (const pack of DEFAULT_COIN_PACKS) {
    await prisma.coinPack.upsert({
      where: { id: pack.name.toLowerCase() },
      update: pack,
      create: pack,
    });
  }

  const badgeCount = await prisma.badge.count();
  const packCount = await prisma.coinPack.count();

  return NextResponse.json({
    success: true,
    badges: badgeCount,
    coinPacks: packCount,
  });
}
