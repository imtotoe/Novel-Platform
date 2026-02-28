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

  await prisma.bookmark.deleteMany({
    where: { userId: session.user.id, novelId },
  });

  return NextResponse.json({ bookmarked: false });
}
