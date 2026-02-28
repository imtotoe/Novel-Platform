"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ArrowRight } from "lucide-react";

interface ResumeItem {
  chapterId: string;
  chapterTitle: string;
  chapterNumber: number;
  progress: number;
  lastReadAt: string;
  novel: {
    id: string;
    title: string;
    slug: string;
    cover: string | null;
    totalChapters: number;
  };
}

export function ReadingResumeBanner() {
  const [items, setItems] = useState<ResumeItem[]>([]);

  useEffect(() => {
    fetch("/api/history/resume")
      .then((r) => r.json())
      .then((data) => {
        if (data.items?.length) setItems(data.items);
      })
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  const main = items[0];

  return (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
      <CardContent className="py-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-muted">
            {main.novel.cover ? (
              <img src={main.novel.cover} alt={main.novel.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-blue-500" />
              อ่านต่อจากที่ค้างไว้
            </p>
            <p className="text-sm truncate">{main.novel.title}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                ตอนที่ {main.chapterNumber}
              </span>
              <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${main.progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{main.progress}%</span>
            </div>
          </div>
          <Button size="sm" asChild>
            <Link href={`/novel/${main.novel.slug}/${main.chapterId}`}>
              อ่านต่อ
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Additional items */}
        {items.length > 1 && (
          <div className="mt-3 flex gap-3 pt-3 border-t border-blue-200/50 dark:border-blue-900/50">
            {items.slice(1).map((item) => (
              <Link
                key={item.chapterId}
                href={`/novel/${item.novel.slug}/${item.chapterId}`}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="truncate max-w-32">{item.novel.title}</span>
                <span>ตอน {item.chapterNumber}</span>
                <span className="text-blue-500">{item.progress}%</span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
