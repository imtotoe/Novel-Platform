import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { NovelCard } from "@/components/novel/NovelCard";
import type { Metadata } from "next";

interface GenrePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
  const { slug } = await params;
  const genre = await prisma.genre.findUnique({ where: { slug } });
  if (!genre) return { title: "ไม่พบแนวนิยาย" };
  return { title: `${genre.icon ?? ""} ${genre.name}` };
}

export default async function GenrePage({ params, searchParams }: GenrePageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam || "1");
  const limit = 20;

  const genre = await prisma.genre.findUnique({ where: { slug } });
  if (!genre) notFound();

  const [novels, total] = await Promise.all([
    prisma.novel.findMany({
      where: {
        isPublished: true,
        genres: { some: { genreId: genre.id } },
      },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatar: true } },
        genres: { include: { genre: true } },
        _count: { select: { votes: true, chapters: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.novel.count({
      where: {
        isPublished: true,
        genres: { some: { genreId: genre.id } },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {genre.icon} {genre.name}
        </h1>
        <p className="mt-1 text-muted-foreground">{total} นิยาย</p>
      </div>

      {novels.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">ยังไม่มีนิยายในแนวนี้</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {novels.map((novel) => (
            <NovelCard
              key={novel.id}
              novel={{
                id: novel.id,
                title: novel.title,
                slug: novel.slug,
                synopsis: novel.synopsis,
                cover: novel.cover,
                status: novel.status,
                views: novel.views,
                updatedAt: novel.updatedAt,
                author: novel.author,
                genres: novel.genres.map((g) => g.genre),
                voteCount: novel._count.votes,
                chapterCount: novel._count.chapters,
              }}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/genre/${slug}?page=${p}`}
              className={`rounded-md px-3 py-1.5 text-sm ${
                p === page
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-accent"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
