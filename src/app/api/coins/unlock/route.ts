import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { unlockChapter } from "@/modules/coin/coin.service";

// POST — unlock a chapter using coins
export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { chapterId } = await request.json();

  if (!chapterId) {
    return NextResponse.json({ error: "chapterId is required" }, { status: 400 });
  }

  try {
    const result = await unlockChapter(session.user.id, chapterId);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
