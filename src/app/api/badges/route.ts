import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET — ดึง badge catalog ทั้งหมด
export async function GET() {
  const badges = await prisma.badge.findMany({
    orderBy: [{ category: "asc" }, { key: "asc" }],
  });

  return NextResponse.json({ badges });
}
