import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [userCount, novelCount, chapterCount, commentCount, reportCount, pendingReports] =
    await Promise.all([
      prisma.user.count(),
      prisma.novel.count(),
      prisma.chapter.count(),
      prisma.comment.count(),
      prisma.report.count(),
      prisma.report.count({ where: { status: "PENDING" } }),
    ]);

  return NextResponse.json({
    userCount,
    novelCount,
    chapterCount,
    commentCount,
    reportCount,
    pendingReports,
  });
}
