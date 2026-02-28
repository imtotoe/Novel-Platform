import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { NovelCard } from "@/components/novel/NovelCard";
import { FollowButton } from "@/components/community/FollowButton";
import { BookOpen, Users, Eye } from "lucide-react";
import type { Metadata } from "next";

interface AuthorPageProps {
  params: Promise<{ username: string }>;
}

async function getAuthor(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      bio: true,
      role: true,
      createdAt: true,
      _count: { select: { followers: true, following: true, novels: true } },
      novels: {
        where: { isPublished: true },
        include: {
          genres: { include: { genre: true } },
          tags: { include: { tag: true } },
          _count: { select: { votes: true, chapters: true } },
          author: { select: { id: true, username: true, displayName: true, avatar: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { username } = await params;
  const author = await getAuthor(username);
  if (!author) return { title: "ไม่พบนักเขียน" };
  return {
    title: author.displayName || author.username,
    description: author.bio?.slice(0, 160) || `โปรไฟล์ของ ${author.displayName || author.username}`,
  };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { username } = await params;
  const author = await getAuthor(username);
  if (!author) notFound();

  const session = await auth();
  let isFollowing = false;
  if (session?.user?.id && session.user.id !== author.id) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: author.id,
        },
      },
    });
    isFollowing = !!follow;
  }

  const totalViews = author.novels.reduce((sum, n) => sum + n.views, 0);
  const isSelf = session?.user?.id === author.id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <Avatar className="h-24 w-24">
          <AvatarImage src={author.avatar ?? undefined} />
          <AvatarFallback className="text-2xl">
            {(author.displayName ?? author.username)[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <div>
              <h1 className="text-2xl font-bold">
                {author.displayName || author.username}
              </h1>
              <p className="text-sm text-muted-foreground">@{author.username}</p>
            </div>
            <FollowButton
              userId={author.id}
              initialFollowing={isFollowing}
              isLoggedIn={!!session}
              isSelf={isSelf}
            />
          </div>

          {author.bio && (
            <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
              {author.bio}
            </p>
          )}

          {/* Stats */}
          <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm sm:justify-start">
            <div className="text-center">
              <p className="font-bold">{author._count.novels}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <BookOpen className="h-3 w-3" />
                นิยาย
              </p>
            </div>
            <div className="text-center">
              <p className="font-bold">{author._count.followers}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                ผู้ติดตาม
              </p>
            </div>
            <div className="text-center">
              <p className="font-bold">{totalViews.toLocaleString()}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" />
                ยอดอ่านรวม
              </p>
            </div>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            เข้าร่วมเมื่อ{" "}
            {new Date(author.createdAt).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Novels */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">
          ผลงานนิยาย ({author.novels.length})
        </h2>
        {author.novels.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {author.novels.map((novel) => (
              <NovelCard
                key={novel.id}
                novel={{
                  ...novel,
                  genres: novel.genres.map((g) => g.genre),
                  tags: novel.tags.map((t) => t.tag),
                  voteCount: novel._count.votes,
                  chapterCount: novel._count.chapters,
                }}
              />
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            ยังไม่มีนิยายที่เผยแพร่
          </p>
        )}
      </section>
    </div>
  );
}
