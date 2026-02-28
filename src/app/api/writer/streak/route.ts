import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET — ดึง writing streak stats
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const streak = await prisma.writingStreak.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({
    streak: streak || {
      currentStreak: 0,
      longestStreak: 0,
      totalDays: 0,
      totalWords: 0,
      lastWrittenDate: null,
    },
  });
}
