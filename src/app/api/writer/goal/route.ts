import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET — ดึง WritingGoal + today's log
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [goal, todayLog] = await Promise.all([
    prisma.writingGoal.findUnique({ where: { userId: session.user.id } }),
    prisma.dailyWritingLog.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: getTodayDate(),
        },
      },
    }),
  ]);

  return NextResponse.json({
    goal: goal || { dailyWordTarget: 500, reminderDays: [], isReminderOn: false },
    todayWords: todayLog?.wordCount ?? 0,
    todayMinutes: todayLog?.minuteSpent ?? 0,
  });
}

// PATCH — อัพเดท goal settings
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { dailyWordTarget, reminderTime, reminderDays, isReminderOn } = body;

  const goal = await prisma.writingGoal.upsert({
    where: { userId: session.user.id },
    update: {
      ...(dailyWordTarget !== undefined && { dailyWordTarget }),
      ...(reminderTime !== undefined && { reminderTime }),
      ...(reminderDays !== undefined && { reminderDays }),
      ...(isReminderOn !== undefined && { isReminderOn }),
    },
    create: {
      userId: session.user.id,
      dailyWordTarget: dailyWordTarget ?? 500,
      reminderTime,
      reminderDays: reminderDays ?? [],
      isReminderOn: isReminderOn ?? false,
    },
  });

  return NextResponse.json({ success: true, goal });
}

function getTodayDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
