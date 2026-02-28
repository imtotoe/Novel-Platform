import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { isBanned, role } = body;

  // Prevent admin from modifying themselves
  if (id === session.user.id) {
    return NextResponse.json({ error: "Cannot modify your own account" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof isBanned === "boolean") data.isBanned = isBanned;
  if (role && ["READER", "WRITER", "ADMIN"].includes(role)) data.role = role;

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      role: true,
      isBanned: true,
    },
  });

  return NextResponse.json({ success: true, user });
}
