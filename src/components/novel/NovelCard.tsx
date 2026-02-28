import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Eye, Heart } from "lucide-react";

interface NovelCardProps {
  novel: {
    id: string;
    title: string;
    slug: string;
    synopsis: string;
    cover: string | null;
    status: string;
    views: number;
    updatedAt: string | Date;
    author: {
      id: string;
      username: string;
      displayName: string | null;
      avatar: string | null;
    };
    genres: { id: string; name: string; slug: string; icon?: string | null }[];
    tags?: { id: string; name: string }[];
    voteCount: number;
    chapterCount: number;
    [key: string]: unknown;
  };
  compact?: boolean;
}

const statusLabel: Record<string, string> = {
  ONGOING: "กำลังเขียน",
  COMPLETED: "จบแล้ว",
  HIATUS: "พัก",
};

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  ONGOING: "default",
  COMPLETED: "secondary",
  HIATUS: "outline",
};

export function NovelCard({ novel, compact }: NovelCardProps) {
  if (compact) {
    return (
      <Link
        href={`/novel/${novel.slug}`}
        className="flex gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
      >
        <div className="h-20 w-14 shrink-0 overflow-hidden rounded bg-muted">
          {novel.cover ? (
            <img
              src={novel.cover}
              alt={novel.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium">{novel.title}</h3>
          <p className="text-xs text-muted-foreground">
            {novel.author.displayName || novel.author.username}
          </p>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {novel.chapterCount}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {novel.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {novel.voteCount}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/novel/${novel.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border transition-colors hover:border-primary/50"
    >
      <div className="aspect-[2/3] w-full overflow-hidden bg-muted">
        {novel.cover ? (
          <img
            src={novel.cover}
            alt={novel.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight group-hover:text-primary">
          {novel.title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {novel.author.displayName || novel.author.username}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-1 pt-2">
          {novel.genres.slice(0, 2).map((genre) => (
            <Badge key={genre.id} variant="secondary" className="text-[10px] px-1.5 py-0">
              {genre.name}
            </Badge>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {novel.chapterCount}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {novel.views.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {novel.voteCount}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function NovelCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border">
      <div className="aspect-[2/3] w-full animate-pulse bg-muted" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
