import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST — บันทึก daily word count (upsert) + update streak
export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { wordCount, minuteSpent } = await request.json();

  if (typeof wordCount !== "number" || wordCount < 0) {
    return NextResponse.json({ error: "Invalid wordCount" }, { status: 400 });
  }

  const today = getTodayDate();

  // Upsert daily log
  const log = await prisma.dailyWritingLog.upsert({
    where: { userId_date: { userId: session.user.id, date: today } },
    update: {
      wordCount: { increment: wordCount },
      minuteSpent: { increment: minuteSpent ?? 0 },
    },
    create: {
      userId: session.user.id,
      date: today,
      wordCount,
      minuteSpent: minuteSpent ?? 0,
    },
  });

  // Update writing streak if user wrote at least 1 word
  if (wordCount > 0) {
    await updateStreak(session.user.id, today, wordCount);
  }

  return NextResponse.json({ success: true, log });
}

async function updateStreak(userId: string, today: Date, wordCount: number) {
  const streak = await prisma.writingStreak.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const lastDate = streak.lastWrittenDate;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  let newStreak = streak.currentStreak;

  if (!lastDate || isSameDay(lastDate, today)) {
    // Already counted today or first time
    if (!lastDate) newStreak = 1;
  } else if (isSameDay(lastDate, yesterday)) {
    // Consecutive day
    newStreak = streak.currentStreak + 1;
  } else if (isSameDay(lastDate, twoDaysAgo) && !streak.graceUsed) {
    // Grace period (1 day skip allowed once per month)
    newStreak = streak.currentStreak + 1;
    await prisma.writingStreak.update({
      where: { userId },
      data: { graceUsed: true },
    });
  } else {
    // Streak broken
    newStreak = 1;
  }

  await prisma.writingStreak.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(streak.longestStreak, newStreak),
      lastWrittenDate: today,
      totalDays: lastDate && isSameDay(lastDate, today) ? streak.totalDays : streak.totalDays + 1,
      totalWords: streak.totalWords + wordCount,
    },
  });
}

function getTodayDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
