export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { NovelCard } from "@/components/novel/NovelCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "ค้นหานิยาย" };

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

async function searchNovels(query: string, page: number, limit: number) {
  const where = {
    isPublished: true,
    OR: [
      { title: { contains: query, mode: "insensitive" as const } },
      { synopsis: { contains: query, mode: "insensitive" as const } },
    ],
  };

  const [novels, total] = await Promise.all([
    prisma.novel.findMany({
      where,
      include: {
        author: { select: { id: true, username: true, displayName: true, avatar: true } },
        genres: { include: { genre: true } },
        tags: { include: { tag: true } },
        _count: { select: { votes: true, chapters: true } },
      },
      orderBy: { views: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.novel.count({ where }),
  ]);

  return {
    novels: novels.map((n) => ({
      ...n,
      genres: n.genres.map((g) => g.genre),
      tags: n.tags.map((t) => t.tag),
      voteCount: n._count.votes,
      chapterCount: n._count.chapters,
    })),
    total,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const page = Math.max(1, parseInt(params.page || "1"));
  const limit = 20;

  const { novels, total } = query
    ? await searchNovels(query, page, limit)
    : { novels: [], total: 0 };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <form action="/search" className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={query}
            placeholder="ค้นหานิยาย..."
            className="h-11 pl-10 text-base"
            autoFocus
          />
        </div>
      </form>

      {query ? (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            ผลการค้นหา &ldquo;{query}&rdquo; — {total} เรื่อง
          </p>

          {novels.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {novels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">ไม่พบนิยาย</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                ลองใช้คำค้นหาอื่น
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {page > 1 && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}>
                    <ChevronLeft className="h-4 w-4" />
                    ก่อนหน้า
                  </Link>
                </Button>
              )}
              <span className="text-sm text-muted-foreground">
                หน้า {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}>
                    ถัดไป
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="py-16 text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">ค้นหานิยาย</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            พิมพ์ชื่อนิยายหรือเรื่องย่อที่ต้องการค้นหา
          </p>
        </div>
      )}
    </div>
  );
}
