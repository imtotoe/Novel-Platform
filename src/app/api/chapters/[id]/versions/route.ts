import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET — ดึง version history list
export async function GET(
  _request: NextRequest,
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
  if (chapter.novel.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const versions = await prisma.chapterVersion.findMany({
    where: { chapterId: id },
    orderBy: { savedAt: "desc" },
    select: {
      id: true,
      wordCount: true,
      savedAt: true,
      label: true,
      savedBy: { select: { username: true, displayName: true } },
    },
  });

  return NextResponse.json({ versions });
}

// POST — สร้าง version ใหม่ (auto-save / manual / before-publish)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { content, wordCount, label } = body;

  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: { novel: { select: { authorId: true } } },
  });

  if (!chapter) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (chapter.novel.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Keep max 10 versions per chapter (FIFO)
  const existingCount = await prisma.chapterVersion.count({ where: { chapterId: id } });
  if (existingCount >= 10) {
    const oldest = await prisma.chapterVersion.findFirst({
      where: { chapterId: id },
      orderBy: { savedAt: "asc" },
    });
    if (oldest) {
      await prisma.chapterVersion.delete({ where: { id: oldest.id } });
    }
  }

  const version = await prisma.chapterVersion.create({
    data: {
      chapterId: id,
      content,
      wordCount: wordCount ?? 0,
      label: label || "auto-save",
      savedById: session.user.id,
    },
  });

  return NextResponse.json({ success: true, version });
}
