import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { checkWriterBadges } from "@/lib/badges";

// GET — Consolidated daily cron: inactive writer, streak reset, badge checks
// Secured by CRON_SECRET
export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  // 1. Reset broken streaks (not written for 2+ days)
  const brokenStreaks = await prisma.writingStreak.findMany({
    where: {
      currentStreak: { gt: 0 },
      lastWrittenDate: { lt: twoDaysAgo },
    },
  });

  for (const streak of brokenStreaks) {
    await prisma.writingStreak.update({
      where: { id: streak.id },
      data: { currentStreak: 0 },
    });
  }

  // 2. Reset grace period monthly (first of each month)
  if (today.getDate() === 1) {
    await prisma.writingStreak.updateMany({
      where: { graceUsed: true },
      data: { graceUsed: false },
    });
  }

  // 3. Inactive writer notifications
  const thresholds = [
    { days: 7, message: "นักอ่านกำลังรอตอนใหม่ของคุณอยู่นะ!" },
    { days: 14, message: "นิยายของคุณมีคนรอติดตาม — กลับมาเขียนต่อได้เลย" },
    { days: 30, message: "แจ้งนักอ่านว่าพักเรื่องชั่วคราวได้นะ — ตั้งสถานะ Hiatus" },
  ];

  for (const { days, message } of thresholds) {
    const threshold = new Date(today);
    threshold.setDate(threshold.getDate() - days);
    const thresholdNext = new Date(threshold);
    thresholdNext.setDate(thresholdNext.getDate() + 1);

    // Writers with ONGOING novels who haven't written since threshold day
    const inactiveWriters = await prisma.user.findMany({
      where: {
        novels: { some: { status: "ONGOING" } },
        writingStreak: {
          OR: [
            { lastWrittenDate: { lt: thresholdNext, gte: threshold } },
            { lastWrittenDate: null },
          ],
        },
      },
      select: { id: true },
      take: 100,
    });

    for (const writer of inactiveWriters) {
      // Don't send duplicate notifications
      const existing = await prisma.notification.findFirst({
        where: {
          userId: writer.id,
          message: { contains: message.slice(0, 20) },
          createdAt: { gte: threshold },
        },
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            userId: writer.id,
            type: "NEW_CHAPTER", // reuse for now
            message,
            link: "/writer/dashboard",
          },
        });
      }
    }
  }

  // 4. Check badges for recently active writers
  const recentWriters = await prisma.dailyWritingLog.findMany({
    where: { date: { gte: new Date(today.getTime() - 86400000) } },
    select: { userId: true },
    distinct: ["userId"],
    take: 100,
  });

  for (const { userId } of recentWriters) {
    await checkWriterBadges(userId).catch(console.error);
  }

  return NextResponse.json({
    brokenStreaks: brokenStreaks.length,
    badgeChecks: recentWriters.length,
    timestamp: now.toISOString(),
  });
}
