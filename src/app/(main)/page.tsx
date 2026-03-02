export const dynamic = "force-dynamic";

import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NovelCard } from "@/components/novel/NovelCard";
import { ArrowRight, BookOpen, PenTool, TrendingUp, Sparkles, Clock, Flame } from "lucide-react";
import { ReadingResumeBanner } from "@/components/reader/ReadingResumeBanner";

async function getFeaturedNovels() {
  return prisma.novel.findMany({
    where: { isPublished: true, isFeatured: true },
    include: {
      author: { select: { id: true, username: true, displayName: true, avatar: true } },
      genres: { include: { genre: true } },
      tags: { include: { tag: true } },
      _count: { select: { votes: true, chapters: true } },
    },
    orderBy: { views: "desc" },
    take: 6,
  });
}

async function getPopularNovels() {
  return prisma.novel.findMany({
    where: { isPublished: true },
    include: {
      author: { select: { id: true, username: true, displayName: true, avatar: true } },
      genres: { include: { genre: true } },
      tags: { include: { tag: true } },
      _count: { select: { votes: true, chapters: true } },
    },
    orderBy: { views: "desc" },
    take: 8,
  });
}

async function getLatestNovels() {
  return prisma.novel.findMany({
    where: { isPublished: true },
    include: {
      author: { select: { id: true, username: true, displayName: true, avatar: true } },
      genres: { include: { genre: true } },
      tags: { include: { tag: true } },
      _count: { select: { votes: true, chapters: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });
}

async function getRecentlyUpdatedWithChapters() {
  return prisma.novel.findMany({
    where: {
      isPublished: true,
      chapters: { some: { isPublished: true } },
    },
    include: {
      author: { select: { id: true, username: true, displayName: true, avatar: true } },
      genres: { include: { genre: true } },
      tags: { include: { tag: true } },
      _count: { select: { votes: true, chapters: true } },
      chapters: {
        where: { isPublished: true },
        orderBy: { publishedAt: "desc" },
        take: 1,
        select: { id: true, title: true, chapterNumber: true, publishedAt: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });
}

async function getGenres() {
  return prisma.genre.findMany({ orderBy: { name: "asc" } });
}

function mapNovel(n: Awaited<ReturnType<typeof getPopularNovels>>[number]) {
  return {
    ...n,
    genres: n.genres.map((g) => g.genre),
    tags: n.tags.map((t) => t.tag),
    voteCount: n._count.votes,
    chapterCount: n._count.chapters,
  };
}

export default async function HomePage() {
  const [session, featured, popular, latest, recentUpdates, genres] = await Promise.all([
    auth(),
    getFeaturedNovels(),
    getPopularNovels(),
    getLatestNovels(),
    getRecentlyUpdatedWithChapters(),
    getGenres(),
  ]);

  const user = session?.user;
  const isWriter = user?.role === "WRITER" || user?.role === "ADMIN";
  const hasContent = popular.length > 0 || latest.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-10">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden rounded-3xl" style={{ minHeight: "380px" }}>
        {/* Rich layered background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 120% 80% at 10% 110%, hsl(28,90%,52%) 0%, transparent 55%), " +
              "radial-gradient(ellipse 80% 60% at 90% -10%, hsl(220,60%,42%) 0%, transparent 50%), " +
              "radial-gradient(ellipse 60% 50% at 55% 50%, hsl(340,50%,30%) 0%, transparent 60%), " +
              "hsl(225,30%,12%)",
          }}
        />
        {/* Subtle noise vignette */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 256 256\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noise)\"/%3E%3C/svg%3E')" }}
        />
        {/* Decorative glowing orb */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(35,95%,65%) 0%, transparent 70%)" }}
          aria-hidden="true"
        />
        {/* Large decorative character */}
        <div
          className="pointer-events-none absolute bottom-0 right-0 select-none opacity-[0.07] text-[220px] leading-none md:text-[320px]"
          aria-hidden="true"
          style={{ fontFamily: "serif", lineHeight: 1 }}
        >
          書
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-8 py-14 md:px-16 md:py-20" style={{ minHeight: "380px" }}>
          {/* Eyebrow tag */}
          <div className="mb-5 inline-flex items-center gap-2 self-start rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm">
            <Flame className="h-3 w-3 text-amber-400" />
            แพลตฟอร์มนิยายออนไลน์ที่คุณรอคอย · v2
          </div>
          {/* Headline */}
          <h1
            className="max-w-xl text-4xl font-black leading-tight tracking-tight text-white md:text-5xl lg:text-6xl"
            style={{ fontFamily: "'Georgia', 'Noto Serif Thai', serif", textShadow: "0 2px 40px rgba(0,0,0,0.4)" }}
          >
            ค้นพบโลก
            <br />
            <span style={{ color: "hsl(35,95%,70%)" }}>แห่งนิยาย</span>
          </h1>
          <p className="mt-4 max-w-md text-base text-white/70 md:text-lg">
            อ่านและเขียนนิยายออนไลน์ หลากหลายแนว จากนักเขียนทั่วประเทศ ฟรี ไม่มีค่าใช้จ่าย
          </p>
          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              asChild
              className="rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 shadow-lg shadow-amber-500/30 transition-all hover:scale-105"
            >
              <Link href="/explore">
                <BookOpen className="mr-2 h-4 w-4" />
                เริ่มอ่านเลย
              </Link>
            </Button>
            {isWriter ? (
              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-xl border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-all hover:scale-105"
              >
                <Link href="/writer/novel/new">
                  <PenTool className="mr-2 h-4 w-4" />
                  สร้างนิยายใหม่
                </Link>
              </Button>
            ) : user ? (
              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-xl border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-all hover:scale-105"
              >
                <Link href="/settings">
                  <PenTool className="mr-2 h-4 w-4" />
                  อัพเกรดเป็นนักเขียน
                </Link>
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-xl border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-all hover:scale-105"
              >
                <Link href="/register">
                  <PenTool className="mr-2 h-4 w-4" />
                  เริ่มเขียนฟรี
                </Link>
              </Button>
            )}
          </div>
          {/* Stats strip */}
          <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-white/50">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              นิยายหลากหลายแนว
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400" />
              อัพเดตทุกวัน
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
              ฟรีเข้าอ่านได้เลย
            </span>
          </div>
        </div>
      </section>


      {/* Reading Resume */}
      <ReadingResumeBanner />

      {/* Genre Quick Links */}
      {genres.length > 0 && (
        <section>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Link key={genre.id} href={`/explore?genre=${genre.slug}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {genre.icon} {genre.name}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section>
          <SectionHeader
            icon={<Sparkles className="h-5 w-5 text-yellow-500" />}
            title="แนะนำ"
            href="/explore?sort=popular"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {featured.map((novel) => (
              <NovelCard key={novel.id} novel={mapNovel(novel)} />
            ))}
          </div>
        </section>
      )}

      {/* Popular */}
      {popular.length > 0 && (
        <section>
          <SectionHeader
            icon={<TrendingUp className="h-5 w-5 text-red-500" />}
            title="ยอดนิยม"
            href="/explore?sort=popular"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {popular.map((novel) => (
              <NovelCard key={novel.id} novel={mapNovel(novel)} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Updated */}
      {recentUpdates.length > 0 && (
        <section>
          <SectionHeader
            icon={<Clock className="h-5 w-5 text-blue-500" />}
            title="อัพเดตล่าสุด"
            href="/explore?sort=latest"
          />
          <div className="space-y-2">
            {recentUpdates.map((novel) => {
              const latestChapter = novel.chapters[0];
              return (
                <div
                  key={novel.id}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Link
                      href={`/novel/${novel.slug}`}
                      className="h-12 w-9 shrink-0 overflow-hidden rounded bg-muted block"
                    >
                      {novel.cover ? (
                        <img
                          src={novel.cover}
                          alt={novel.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </Link>
                    <div className="min-w-0">
                      <Link
                        href={`/novel/${novel.slug}`}
                        className="block truncate text-sm font-medium hover:text-primary"
                      >
                        {novel.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {novel.author.displayName || novel.author.username}
                      </p>
                    </div>
                  </div>
                  {latestChapter && (
                    <Link
                      href={`/novel/${novel.slug}/${latestChapter.id}`}
                      className="shrink-0 text-xs text-muted-foreground hover:text-primary ml-4"
                    >
                      ตอนที่ {latestChapter.chapterNumber}: {latestChapter.title}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Latest */}
      {latest.length > 0 && (
        <section>
          <SectionHeader
            icon={<BookOpen className="h-5 w-5 text-green-500" />}
            title="นิยายใหม่"
            href="/explore?sort=latest"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {latest.map((novel) => (
              <NovelCard key={novel.id} novel={mapNovel(novel)} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!hasContent && (
        <section className="py-16 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">ยังไม่มีนิยาย</h2>
          <p className="mt-2 text-muted-foreground">
            เป็นคนแรกที่เขียนนิยายบน StoriWrite!
          </p>
          <Button className="mt-6" asChild>
            <Link href="/register">เริ่มเขียนนิยาย</Link>
          </Button>
        </section>
      )}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  href: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-xl font-bold">
        {icon}
        {title}
      </h2>
      <Button variant="ghost" size="sm" asChild>
        <Link href={href}>
          ดูทั้งหมด
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
