import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { NovelCard } from "@/components/novel/NovelCard";
import { BookMarked, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = { title: "ชั้นหนังสือ" };

export default async function LibraryPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    include: {
      novel: {
        include: {
          author: { select: { id: true, username: true, displayName: true, avatar: true } },
          genres: { include: { genre: true } },
          tags: { include: { tag: true } },
          _count: { select: { votes: true, chapters: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <BookMarked className="h-6 w-6" />
          ชั้นหนังสือ
        </h1>
        <p className="text-sm text-muted-foreground">
          {bookmarks.length} เรื่อง
        </p>
      </div>

      {bookmarks.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {bookmarks.map((b) => (
            <NovelCard
              key={b.novel.id}
              novel={{
                ...b.novel,
                genres: b.novel.genres.map((g) => g.genre),
                tags: b.novel.tags.map((t) => t.tag),
                voteCount: b.novel._count.votes,
                chapterCount: b.novel._count.chapters,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">ยังไม่มีบุ๊คมาร์ก</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            สำรวจนิยายและเพิ่มเข้าชั้นหนังสือของคุณ
          </p>
          <Button className="mt-4" asChild>
            <Link href="/explore">สำรวจนิยาย</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
