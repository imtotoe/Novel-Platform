import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/lib/validations";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: chapterId } = await params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { chapterId, parentId: null, isHidden: false },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
        replies: {
          where: { isHidden: false },
          include: {
            user: { select: { id: true, username: true, displayName: true, avatar: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.comment.count({ where: { chapterId, parentId: null, isHidden: false } }),
  ]);

  return NextResponse.json({
    comments: comments.map((c) => ({
      ...c,
      replyCount: c._count.replies,
    })),
    total,
    pages: Math.ceil(total / limit),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: chapterId } = await params;

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { id: true, novel: { select: { authorId: true } } },
  });
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

  const body = await request.json();
  const validated = commentSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { success: false, error: "VALIDATION_ERROR", details: validated.error.flatten() },
      { status: 400 }
    );
  }

  const { content: rawContent, parentId } = validated.data;

  // Sanitize HTML entities to prevent XSS
  const content = rawContent
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } });
    if (!parent || parent.chapterId !== chapterId) {
      return NextResponse.json({ error: "Invalid parent comment" }, { status: 400 });
    }
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      userId: session.user.id,
      chapterId,
      parentId: parentId || null,
    },
    include: {
      user: { select: { id: true, username: true, displayName: true, avatar: true } },
    },
  });

  // Create notification for the novel author (if commenter is not the author)
  if (chapter.novel.authorId !== session.user.id) {
    prisma.notification
      .create({
        data: {
          type: "NEW_COMMENT",
          message: `${session.user.username} แสดงความคิดเห็นในนิยายของคุณ`,
          link: `/novel/${chapterId}`,
          userId: chapter.novel.authorId,
        },
      })
      .catch(console.error);
  }

  return NextResponse.json({ success: true, comment }, { status: 201 });
}
