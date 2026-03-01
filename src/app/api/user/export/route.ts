import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [user, novels, bookmarks, comments, votes, readHistory, following, followers, coinTransactions] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          bio: true,
          role: true,
          createdAt: true,
          consentAt: true,
        },
      }),
      prisma.novel.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          title: true,
          slug: true,
          synopsis: true,
          status: true,
          views: true,
          createdAt: true,
          chapters: {
            select: { id: true, title: true, chapterNumber: true, wordCount: true, createdAt: true },
          },
        },
      }),
      prisma.bookmark.findMany({
        where: { userId },
        include: { novel: { select: { title: true, slug: true } } },
      }),
      prisma.comment.findMany({
        where: { userId },
        select: { id: true, content: true, createdAt: true, chapterId: true },
      }),
      prisma.vote.findMany({
        where: { userId },
        include: { novel: { select: { title: true, slug: true } } },
      }),
      prisma.readHistory.findMany({
        where: { userId },
        select: { chapterId: true, progress: true, lastReadAt: true },
      }),
      prisma.follow.findMany({
        where: { followerId: userId },
        include: { following: { select: { username: true } } },
      }),
      prisma.follow.findMany({
        where: { followingId: userId },
        include: { follower: { select: { username: true } } },
      }),
      prisma.coinTransaction.findMany({
        where: { userId },
        select: { id: true, coinsGranted: true, paidAmount: true, status: true, createdAt: true },
      }),
    ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    profile: user,
    novels,
    bookmarks,
    comments,
    votes,
    readHistory,
    following: following.map((f) => ({ username: f.following.username, since: f.createdAt })),
    followers: followers.map((f) => ({ username: f.follower.username, since: f.createdAt })),
    coinTransactions,
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="storiwrite-export-${Date.now()}.json"`,
    },
  });
}
