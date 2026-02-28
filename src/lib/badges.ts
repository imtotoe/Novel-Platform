import { prisma } from "@/lib/prisma";
import type { BadgeCategory } from "@/generated/prisma/client";

interface BadgeDef {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
}

export const BADGE_DEFINITIONS: BadgeDef[] = [
  // Writer Milestones
  { key: "first_chapter", name: "บทแรก", description: "publish chapter แรก", icon: "🖊️", category: "WRITER_MILESTONE" },
  { key: "words_10k", name: "นักเขียนตัวจริง", description: "เขียนสะสม 10,000 คำ", icon: "📝", category: "WRITER_MILESTONE" },
  { key: "words_100k", name: "นิยายยาว", description: "เขียนสะสม 100,000 คำ", icon: "📚", category: "WRITER_MILESTONE" },
  { key: "completed_novel", name: "จบแล้ว!", description: "เขียนนิยายจนจบ 1 เรื่อง", icon: "🎉", category: "WRITER_MILESTONE" },

  // Writer Streak
  { key: "streak_3", name: "เริ่มต้นแล้ว", description: "เขียนติดต่อกัน 3 วัน", icon: "🔥", category: "WRITER_STREAK" },
  { key: "streak_7", name: "สม่ำเสมอ", description: "เขียนติดต่อกัน 7 วัน", icon: "✍️", category: "WRITER_STREAK" },
  { key: "streak_30", name: "รักการเขียน", description: "เขียนติดต่อกัน 30 วัน", icon: "📅", category: "WRITER_STREAK" },
  { key: "streak_100", name: "นักเขียนเหล็ก", description: "เขียนติดต่อกัน 100 วัน", icon: "💪", category: "WRITER_STREAK" },

  // Writer Community
  { key: "followers_10", name: "มีแฟนแล้ว", description: "ผู้ติดตาม 10 คน", icon: "👥", category: "WRITER_COMMUNITY" },
  { key: "followers_100", name: "นักเขียนดาวรุ่ง", description: "ผู้ติดตาม 100 คน", icon: "⭐", category: "WRITER_COMMUNITY" },
  { key: "followers_1k", name: "Verified Writer", description: "ผู้ติดตาม 1,000 คน", icon: "🌟", category: "WRITER_COMMUNITY" },

  // Reader Milestones
  { key: "first_read", name: "นักอ่านตัวจริง", description: "อ่านครบ chapter แรก", icon: "📖", category: "READER_MILESTONE" },
  { key: "read_10", name: "อ่านเยอะ", description: "อ่านครบ 10 เรื่อง", icon: "🗂️", category: "READER_MILESTONE" },
  { key: "read_50", name: "บรรณารักษ์", description: "อ่านครบ 50 เรื่อง", icon: "📚", category: "READER_MILESTONE" },

  // Reader Streak
  { key: "read_streak_7", name: "อ่านทุกวัน", description: "อ่านติดกัน 7 วัน", icon: "🌙", category: "READER_STREAK" },
  { key: "read_streak_30", name: "นักอ่านเหล็ก", description: "อ่านติดกัน 30 วัน", icon: "☀️", category: "READER_STREAK" },

  // Reader Community
  { key: "first_comment", name: "เริ่มพูดแล้ว", description: "comment ครั้งแรก", icon: "💬", category: "READER_COMMUNITY" },
  { key: "comments_50", name: "ช่างพูด", description: "comment 50 ครั้ง", icon: "🗣️", category: "READER_COMMUNITY" },
  { key: "votes_100", name: "ให้กำลังใจ", description: "vote 100 ครั้ง", icon: "❤️", category: "READER_COMMUNITY" },
];

export async function seedBadges() {
  for (const badge of BADGE_DEFINITIONS) {
    await prisma.badge.upsert({
      where: { key: badge.key },
      update: { name: badge.name, description: badge.description, icon: badge.icon, category: badge.category },
      create: badge,
    });
  }
}

export async function grantBadge(userId: string, badgeKey: string): Promise<boolean> {
  const badge = await prisma.badge.findUnique({ where: { key: badgeKey } });
  if (!badge) return false;

  const existing = await prisma.userBadge.findUnique({
    where: { userId_badgeId: { userId, badgeId: badge.id } },
  });
  if (existing) return false;

  await prisma.userBadge.create({
    data: { userId, badgeId: badge.id },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId,
      type: "NEW_VOTE", // reuse type for now
      message: `ได้รับ badge ใหม่: ${badge.icon} ${badge.name}`,
      link: "/profile/badges",
    },
  });

  return true;
}

export async function checkWriterBadges(userId: string) {
  const streak = await prisma.writingStreak.findUnique({ where: { userId } });
  if (!streak) return;

  // Streak badges
  if (streak.currentStreak >= 3) await grantBadge(userId, "streak_3");
  if (streak.currentStreak >= 7) await grantBadge(userId, "streak_7");
  if (streak.currentStreak >= 30) await grantBadge(userId, "streak_30");
  if (streak.currentStreak >= 100) await grantBadge(userId, "streak_100");

  // Word count badges
  if (streak.totalWords >= 10000) await grantBadge(userId, "words_10k");
  if (streak.totalWords >= 100000) await grantBadge(userId, "words_100k");

  // First chapter badge
  const publishedCount = await prisma.chapter.count({
    where: { novel: { authorId: userId }, isPublished: true },
  });
  if (publishedCount >= 1) await grantBadge(userId, "first_chapter");

  // Completed novel badge
  const completedCount = await prisma.novel.count({
    where: { authorId: userId, status: "COMPLETED" },
  });
  if (completedCount >= 1) await grantBadge(userId, "completed_novel");

  // Follower badges
  const followerCount = await prisma.follow.count({ where: { followingId: userId } });
  if (followerCount >= 10) await grantBadge(userId, "followers_10");
  if (followerCount >= 100) await grantBadge(userId, "followers_100");
  if (followerCount >= 1000) await grantBadge(userId, "followers_1k");
}
