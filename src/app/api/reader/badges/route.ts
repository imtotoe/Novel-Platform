import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET — ดึง badges ของ user
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userBadges = await prisma.userBadge.findMany({
    where: { userId: session.user.id },
    include: { badge: true },
    orderBy: { unlockedAt: "desc" },
  });

  // Mark all as seen
  await prisma.userBadge.updateMany({
    where: { userId: session.user.id, isNew: true },
    data: { isNew: false },
  });

  return NextResponse.json({ badges: userBadges });
}
