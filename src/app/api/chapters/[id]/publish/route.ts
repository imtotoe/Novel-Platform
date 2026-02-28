import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: { novel: { select: { authorId: true } } },
  });

  if (!chapter) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (chapter.novel.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const isPublishing = !chapter.isPublished;

  const updated = await prisma.chapter.update({
    where: { id },
    data: {
      isPublished: isPublishing,
      publishedAt: isPublishing ? new Date() : null,
    },
  });

  // Notify followers when a chapter is published
  if (isPublishing) {
    const novel = await prisma.novel.findUnique({
      where: { id: chapter.novelId },
      select: { title: true, slug: true, authorId: true },
    });
    if (novel) {
      const followers = await prisma.follow.findMany({
        where: { followingId: novel.authorId },
        select: { followerId: true },
      });
      if (followers.length > 0) {
        prisma.notification
          .createMany({
            data: followers.map((f) => ({
              type: "NEW_CHAPTER" as const,
              message: `"${novel.title}" มีตอนใหม่: ${updated.title}`,
              link: `/novel/${novel.slug}/${updated.id}`,
              userId: f.followerId,
            })),
          })
          .catch(console.error);
      }
    }
  }

  return NextResponse.json({ success: true, chapter: updated });
}
