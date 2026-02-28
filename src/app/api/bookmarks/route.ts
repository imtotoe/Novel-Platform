import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    include: {
      novel: {
        include: {
          author: { select: { id: true, username: true, displayName: true, avatar: true } },
          genres: { include: { genre: true } },
          tags: { include: { tag: true } },
          _count: { select: { votes: true, chapters: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    novels: bookmarks.map((b) => ({
      ...b.novel,
      genres: b.novel.genres.map((g) => g.genre),
      tags: b.novel.tags.map((t) => t.tag),
      voteCount: b.novel._count.votes,
      chapterCount: b.novel._count.chapters,
      bookmarkedAt: b.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { novelId } = await request.json();
  if (!novelId) return NextResponse.json({ error: "novelId required" }, { status: 400 });

  await prisma.bookmark.upsert({
    where: { userId_novelId: { userId: session.user.id, novelId } },
    update: {},
    create: { userId: session.user.id, novelId },
  });

  return NextResponse.json({ bookmarked: true });
}
