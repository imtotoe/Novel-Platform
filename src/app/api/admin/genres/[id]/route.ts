import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { name, icon } = await request.json();

  const data: Record<string, unknown> = {};
  if (name) {
    data.name = name;
    data.slug = slugify(name, { lower: true, strict: true });
  }
  if (typeof icon === "string") data.icon = icon || null;

  const genre = await prisma.genre.update({ where: { id }, data });

  return NextResponse.json({ success: true, genre });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  // Check if genre is used by any novels
  const count = await prisma.genreOnNovel.count({ where: { genreId: id } });
  if (count > 0) {
    return NextResponse.json(
      { error: `ไม่สามารถลบได้ มี ${count} นิยายใช้แนวนี้อยู่` },
      { status: 400 }
    );
  }

  await prisma.genre.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
