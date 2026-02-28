import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET — ดึง WritingSession ล่าสุดของ user
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const writingSession = await prisma.writingSession.findFirst({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      novel: { select: { id: true, title: true, slug: true, cover: true } },
      chapter: { select: { id: true, title: true, chapterNumber: true } },
    },
  });

  return NextResponse.json({ session: writingSession });
}

// POST — upsert WritingSession
export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { novelId, chapterId, lastContent, cursorPosition, wordCount } = body;

  if (!novelId) {
    return NextResponse.json({ error: "novelId is required" }, { status: 400 });
  }

  const writingSession = await prisma.writingSession.upsert({
    where: {
      userId_novelId: { userId: session.user.id, novelId },
    },
    update: {
      chapterId: chapterId || null,
      lastContent: lastContent || undefined,
      cursorPosition: cursorPosition ?? 0,
      wordCount: wordCount ?? 0,
    },
    create: {
      userId: session.user.id,
      novelId,
      chapterId: chapterId || null,
      lastContent,
      cursorPosition: cursorPosition ?? 0,
      wordCount: wordCount ?? 0,
    },
  });

  return NextResponse.json({ success: true, session: writingSession });
}
