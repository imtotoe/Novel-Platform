import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { extractText } from "@/lib/utils";

// POST — กู้คืน version
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: chapterId } = await params;
  const { versionId } = await request.json();

  if (!versionId) {
    return NextResponse.json({ error: "versionId is required" }, { status: 400 });
  }

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { novel: { select: { authorId: true } } },
  });

  if (!chapter) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (chapter.novel.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const version = await prisma.chapterVersion.findUnique({
    where: { id: versionId },
  });

  if (!version || version.chapterId !== chapterId) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  // Save current content as a "before-restore" version first
  await prisma.chapterVersion.create({
    data: {
      chapterId,
      content: chapter.content as object,
      wordCount: chapter.wordCount,
      label: "before-restore",
      savedById: session.user.id,
    },
  });

  // Restore the version
  const contentText = extractText(version.content as Record<string, unknown>);
  const updated = await prisma.chapter.update({
    where: { id: chapterId },
    data: {
      content: version.content as object,
      contentText,
      wordCount: version.wordCount,
    },
  });

  return NextResponse.json({ success: true, chapter: updated });
}
