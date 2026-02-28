import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST — ตั้ง schedule publish
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { scheduledAt } = await request.json();

  if (!scheduledAt) {
    return NextResponse.json({ error: "scheduledAt is required" }, { status: 400 });
  }

  const scheduledDate = new Date(scheduledAt);
  if (scheduledDate <= new Date()) {
    return NextResponse.json({ error: "ต้องเลือกเวลาในอนาคต" }, { status: 400 });
  }

  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: { novel: { select: { authorId: true } } },
  });

  if (!chapter) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (chapter.novel.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (chapter.isPublished) {
    return NextResponse.json({ error: "Chapter เผยแพร่แล้ว" }, { status: 400 });
  }

  const updated = await prisma.chapter.update({
    where: { id },
    data: { scheduledAt: scheduledDate },
  });

  return NextResponse.json({ success: true, scheduledAt: updated.scheduledAt });
}

// DELETE — ยกเลิก schedule
export async function DELETE(
  _request: Request,
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

  await prisma.chapter.update({
    where: { id },
    data: { scheduledAt: null },
  });

  return NextResponse.json({ success: true });
}
