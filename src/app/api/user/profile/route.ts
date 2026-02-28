import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { displayName, bio } = body;

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(displayName !== undefined && { displayName: displayName || null }),
      ...(bio !== undefined && { bio: bio || null }),
    },
    select: { id: true, displayName: true, bio: true },
  });

  return NextResponse.json({ success: true, user: updated });
}
