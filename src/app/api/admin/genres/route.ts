import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const genres = await prisma.genre.findMany({
    include: { _count: { select: { novels: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ genres });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, icon } = await request.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const slug = slugify(name, { lower: true, strict: true });

  const existing = await prisma.genre.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Genre already exists" }, { status: 400 });
  }

  const genre = await prisma.genre.create({
    data: { name, slug, icon: icon || null },
  });

  return NextResponse.json({ success: true, genre }, { status: 201 });
}
