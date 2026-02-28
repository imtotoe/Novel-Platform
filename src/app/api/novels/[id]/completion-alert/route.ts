import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET — ตรวจสถานะ completion alert
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const alert = await prisma.completionAlert.findUnique({
    where: { userId_novelId: { userId: session.user.id, novelId: id } },
  });

  return NextResponse.json({ hasAlert: !!alert });
}

// POST — ตั้ง completion alert
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const novel = await prisma.novel.findUnique({ where: { id } });
  if (!novel) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (novel.status === "COMPLETED") {
    return NextResponse.json({ error: "นิยายจบแล้ว" }, { status: 400 });
  }

  await prisma.completionAlert.upsert({
    where: { userId_novelId: { userId: session.user.id, novelId: id } },
    update: {},
    create: { userId: session.user.id, novelId: id },
  });

  return NextResponse.json({ success: true, hasAlert: true });
}

// DELETE — ยกเลิก completion alert
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await prisma.completionAlert.deleteMany({
    where: { userId: session.user.id, novelId: id },
  });

  return NextResponse.json({ success: true, hasAlert: false });
}
