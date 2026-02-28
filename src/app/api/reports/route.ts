import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { reason, description, reportedUserId, reportedNovelId, reportedCommentId } = body;

  if (!reason || !["INAPPROPRIATE_CONTENT", "SPAM", "COPYRIGHT", "OTHER"].includes(reason)) {
    return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
  }

  if (!reportedUserId && !reportedNovelId && !reportedCommentId) {
    return NextResponse.json({ error: "Must specify a target" }, { status: 400 });
  }

  const report = await prisma.report.create({
    data: {
      reason,
      description: description || null,
      reporterId: session.user.id,
      reportedUserId: reportedUserId || null,
      reportedNovelId: reportedNovelId || null,
      reportedCommentId: reportedCommentId || null,
    },
  });

  return NextResponse.json({ success: true, report }, { status: 201 });
}
