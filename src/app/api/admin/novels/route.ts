import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { author: { username: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [novels, total] = await Promise.all([
    prisma.novel.findMany({
      where,
      include: {
        author: { select: { id: true, username: true, displayName: true } },
        _count: { select: { chapters: true, votes: true, reports: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.novel.count({ where }),
  ]);

  return NextResponse.json({ novels, total, pages: Math.ceil(total / limit) });
}
