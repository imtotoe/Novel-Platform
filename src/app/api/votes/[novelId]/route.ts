import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ novelId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { novelId } = await params;

  await prisma.vote.deleteMany({
    where: { userId: session.user.id, novelId },
  });

  const voteCount = await prisma.vote.count({ where: { novelId } });

  return NextResponse.json({ voted: false, voteCount });
}
