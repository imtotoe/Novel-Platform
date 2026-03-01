import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/cron-auth";

// GET — Publish scheduled chapters
// Secured by CRON_SECRET with timing-safe comparison
export async function GET(request: Request) {
  if (!verifyCronAuth(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();

  const chapters = await prisma.chapter.findMany({
    where: {
      isPublished: false,
      scheduledAt: { not: null, lte: now },
    },
    include: {
      novel: {
        select: {
          id: true,
          slug: true,
          title: true,
          bookmarks: { select: { userId: true } },
        },
      },
    },
  });

  for (const chapter of chapters) {
    await prisma.chapter.update({
      where: { id: chapter.id },
      data: { isPublished: true, publishedAt: now, scheduledAt: null },
    });

    // Notify bookmarked users
    const notifications = chapter.novel.bookmarks.map((b) => ({
      userId: b.userId,
      type: "NEW_CHAPTER" as const,
      message: `${chapter.novel.title} อัพเดตตอนที่ ${chapter.chapterNumber}: ${chapter.title}`,
      link: `/novel/${chapter.novel.slug}/${chapter.id}`,
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
    }
  }

  return NextResponse.json({ published: chapters.length, timestamp: now.toISOString() });
}
