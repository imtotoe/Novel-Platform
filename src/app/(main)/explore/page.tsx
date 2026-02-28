export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NovelCard } from "@/components/novel/NovelCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

export const metadata = { title: "สำรวจนิยาย" };

interface ExplorePageProps {
  searchParams: Promise<{
    page?: string;
    genre?: string;
    status?: string;
    sort?: string;
    search?: string;
  }>;
}

const sortOptions = [
  { value: "latest", label: "ล่าสุด" },
  { value: "popular", label: "ยอดนิยม" },
  { value: "top_voted", label: "คะแนนสูงสุด" },
];

const statusOptions = [
  { value: "ONGOING", label: "กำลังเขียน" },
  { value: "COMPLETED", label: "จบแล้ว" },
  { value: "HIATUS", label: "พัก" },
];

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const limit = 20;
  const genreSlug = params.genre;
  const status = params.status;
  const sort = params.sort || "latest";
  const search = params.search;

  const where: Record<string, unknown> = { isPublished: true };

  if (genreSlug) where.genres = { some: { genre: { slug: genreSlug } } };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { synopsis: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy =
    sort === "popular"
      ? { views: "desc" as const }
      : sort === "top_voted"
        ? { votes: { _count: "desc" as const } }
        : { updatedAt: "desc" as const };

  const [novels, total, genres] = await Promise.all([
    prisma.novel.findMany({
      where,
      include: {
        author: { select: { id: true, username: true, displayName: true, avatar: true } },
        genres: { include: { genre: true } },
        tags: { include: { tag: true } },
        _count: { select: { votes: true, chapters: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.novel.count({ where }),
    prisma.genre.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = { genre: genreSlug, status, sort, search, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, v);
    }
    return `/explore?${p.toString()}`;
  }

  const activeGenre = genres.find((g) => g.slug === genreSlug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Sidebar Filters */}
        <aside className="w-full shrink-0 md:w-56">
          <div className="sticky top-20 space-y-6">
            {/* Genre Filter */}
            <div>
              <h3 className="mb-3 text-sm font-semibold">แนวนิยาย</h3>
              <div className="flex flex-wrap gap-1.5 md:flex-col md:gap-1">
                <Link href={buildUrl({ genre: undefined, page: undefined })}>
                  <Badge
                    variant={!genreSlug ? "default" : "outline"}
                    className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    ทั้งหมด
                  </Badge>
                </Link>
                {genres.map((genre) => (
                  <Link
                    key={genre.id}
                    href={buildUrl({ genre: genre.slug, page: undefined })}
                  >
                    <Badge
                      variant={genreSlug === genre.slug ? "default" : "outline"}
                      className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      {genre.icon} {genre.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <h3 className="mb-3 text-sm font-semibold">สถานะ</h3>
              <div className="flex flex-wrap gap-1.5 md:flex-col md:gap-1">
                <Link href={buildUrl({ status: undefined, page: undefined })}>
                  <Badge
                    variant={!status ? "default" : "outline"}
                    className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    ทั้งหมด
                  </Badge>
                </Link>
                {statusOptions.map((opt) => (
                  <Link
                    key={opt.value}
                    href={buildUrl({ status: opt.value, page: undefined })}
                  >
                    <Badge
                      variant={status === opt.value ? "default" : "outline"}
                      className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      {opt.label}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Sort + Info Bar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">
              {search && (
                <span>
                  ผลการค้นหา &ldquo;{search}&rdquo; —{" "}
                </span>
              )}
              {activeGenre && (
                <span>{activeGenre.icon} {activeGenre.name} — </span>
              )}
              {total} เรื่อง
            </div>
            <div className="flex gap-1">
              {sortOptions.map((opt) => (
                <Link
                  key={opt.value}
                  href={buildUrl({ sort: opt.value, page: undefined })}
                >
                  <Badge
                    variant={sort === opt.value ? "default" : "outline"}
                    className="cursor-pointer"
                  >
                    {opt.label}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>

          {/* Novel Grid */}
          {novels.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {novels.map((novel) => (
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
            <div className="py-16 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">ไม่พบนิยาย</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                ลองเปลี่ยนตัวกรองหรือคำค้นหา
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {page > 1 && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={buildUrl({ page: String(page - 1) })}>
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
                  <Link href={buildUrl({ page: String(page + 1) })}>
                    ถัดไป
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
