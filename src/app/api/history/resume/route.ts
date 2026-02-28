import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET — ดึง "อ่านต่อ" ล่าสุด (3 เรื่อง)
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get latest read history per novel
  const histories = await prisma.readHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { lastReadAt: "desc" },
    include: {
      chapter: {
        select: {
          id: true,
          title: true,
          chapterNumber: true,
          novel: {
            select: {
              id: true,
              title: true,
              slug: true,
              cover: true,
              _count: { select: { chapters: { where: { isPublished: true } } } },
            },
          },
        },
      },
    },
    take: 20,
  });

  // Deduplicate by novel (keep latest read chapter per novel)
  const seenNovels = new Set<string>();
  const resumeItems = [];

  for (const h of histories) {
    const novelId = h.chapter.novel.id;
    if (seenNovels.has(novelId)) continue;
    seenNovels.add(novelId);

    resumeItems.push({
      chapterId: h.chapter.id,
      chapterTitle: h.chapter.title,
      chapterNumber: h.chapter.chapterNumber,
      progress: h.progress,
      lastReadAt: h.lastReadAt,
      novel: {
        id: h.chapter.novel.id,
        title: h.chapter.novel.title,
        slug: h.chapter.novel.slug,
        cover: h.chapter.novel.cover,
        totalChapters: h.chapter.novel._count.chapters,
      },
    });

    if (resumeItems.length >= 3) break;
  }

  return NextResponse.json({ items: resumeItems });
}
