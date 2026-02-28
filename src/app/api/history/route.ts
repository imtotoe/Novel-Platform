import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  const [history, total] = await Promise.all([
    prisma.readHistory.findMany({
      where: { userId: session.user.id },
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
                author: { select: { username: true, displayName: true } },
              },
            },
          },
        },
      },
      orderBy: { lastReadAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.readHistory.count({ where: { userId: session.user.id } }),
  ]);

  return NextResponse.json({
    history,
    total,
    pages: Math.ceil(total / limit),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { chapterId } = await request.json();
  if (!chapterId) return NextResponse.json({ error: "chapterId required" }, { status: 400 });

  await prisma.readHistory.upsert({
    where: {
      userId_chapterId: { userId: session.user.id, chapterId },
    },
    update: { lastReadAt: new Date() },
    create: { userId: session.user.id, chapterId },
  });

  return NextResponse.json({ success: true });
}
