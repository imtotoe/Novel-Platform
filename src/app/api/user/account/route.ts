import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      // Delete related data in dependency order
      await tx.notification.deleteMany({ where: { userId } });
      await tx.comment.deleteMany({ where: { userId } });
      await tx.bookmark.deleteMany({ where: { userId } });
      await tx.vote.deleteMany({ where: { userId } });
      await tx.follow.deleteMany({ where: { OR: [{ followerId: userId }, { followingId: userId }] } });
      await tx.readHistory.deleteMany({ where: { userId } });
      await tx.completionAlert.deleteMany({ where: { userId } });
      await tx.userBadge.deleteMany({ where: { userId } });
      await tx.readingStreak.deleteMany({ where: { userId } });
      await tx.dailyWritingLog.deleteMany({ where: { userId } });
      await tx.writingStreak.deleteMany({ where: { userId } });
      await tx.writingGoal.deleteMany({ where: { userId } });
      await tx.writingSession.deleteMany({ where: { userId } });
      await tx.chapterVersion.deleteMany({ where: { savedById: userId } });
      await tx.coinLedger.deleteMany({ where: { userId } });
      await tx.coinSpend.deleteMany({ where: { userId } });
      await tx.coinTransaction.deleteMany({ where: { userId } });
      await tx.writerRevenue.deleteMany({ where: { writerId: userId } });
      await tx.withdrawalRequest.deleteMany({ where: { writerId: userId } });
      await tx.report.deleteMany({ where: { OR: [{ reporterId: userId }, { reportedUserId: userId }] } });

      // Delete user's novels (chapters cascade via onDelete)
      const novels = await tx.novel.findMany({ where: { authorId: userId }, select: { id: true } });
      for (const novel of novels) {
        await tx.chapter.deleteMany({ where: { novelId: novel.id } });
        await tx.genreOnNovel.deleteMany({ where: { novelId: novel.id } });
        await tx.tagOnNovel.deleteMany({ where: { novelId: novel.id } });
      }
      await tx.novel.deleteMany({ where: { authorId: userId } });

      // Delete auth-related data
      await tx.account.deleteMany({ where: { userId } });
      await tx.session.deleteMany({ where: { userId } });

      // Finally delete the user
      await tx.user.delete({ where: { id: userId } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
