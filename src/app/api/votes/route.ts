import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { novelId } = await request.json();
  if (!novelId) return NextResponse.json({ error: "novelId required" }, { status: 400 });

  await prisma.vote.upsert({
    where: { userId_novelId: { userId: session.user.id, novelId } },
    update: {},
    create: { userId: session.user.id, novelId },
  });

  const [voteCount, novel] = await Promise.all([
    prisma.vote.count({ where: { novelId } }),
    prisma.novel.findUnique({ where: { id: novelId }, select: { authorId: true, title: true, slug: true } }),
  ]);

  // Notify the novel author
  if (novel && novel.authorId !== session.user.id) {
    prisma.notification
      .create({
        data: {
          type: "NEW_VOTE",
          message: `${session.user.username} โหวตให้นิยาย "${novel.title}" ของคุณ`,
          link: `/novel/${novel.slug}`,
          userId: novel.authorId,
        },
      })
      .catch(console.error);
  }

  return NextResponse.json({ voted: true, voteCount });
}
