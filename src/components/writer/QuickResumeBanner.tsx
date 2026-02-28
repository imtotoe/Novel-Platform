"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PenLine, ArrowRight } from "lucide-react";

interface WritingSession {
  id: string;
  wordCount: number;
  updatedAt: string;
  novel: { id: string; title: string; slug: string; cover: string | null };
  chapter: { id: string; title: string; chapterNumber: number } | null;
}

export function QuickResumeBanner() {
  const [session, setSession] = useState<WritingSession | null>(null);

  useEffect(() => {
    fetch("/api/writer/session")
      .then((r) => r.json())
      .then((data) => {
        if (data.session) setSession(data.session);
      })
      .catch(() => {});
  }, []);

  if (!session) return null;

  const timeAgo = getTimeAgo(new Date(session.updatedAt));
  const href = session.chapter
    ? `/writer/novel/${session.novel.id}/chapter/${session.chapter.id}/edit`
    : `/writer/novel/${session.novel.id}/chapter/new`;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <PenLine className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">เขียนต่อจากที่ค้างไว้</p>
            <p className="text-xs text-muted-foreground">
              &ldquo;{session.novel.title}&rdquo;
              {session.chapter && ` — ตอนที่ ${session.chapter.chapterNumber}: ${session.chapter.title}`}
              {" "}· {timeAgo} · {session.wordCount.toLocaleString()} คำ
            </p>
          </div>
        </div>
        <Button size="sm" asChild>
          <Link href={href}>
            เขียนต่อ
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "เมื่อสักครู่";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hours / 24);
  return `${days} วันที่แล้ว`;
}
