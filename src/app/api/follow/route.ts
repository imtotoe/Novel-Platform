import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await request.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  if (userId === session.user.id) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  await prisma.follow.upsert({
    where: {
      followerId_followingId: { followerId: session.user.id, followingId: userId },
    },
    update: {},
    create: { followerId: session.user.id, followingId: userId },
  });

  // Notification for the followed user
  prisma.notification
    .create({
      data: {
        type: "NEW_FOLLOWER",
        message: `${session.user.username} เริ่มติดตามคุณ`,
        link: `/author/${session.user.username}`,
        userId,
      },
    })
    .catch(() => {});

  return NextResponse.json({ following: true });
}
