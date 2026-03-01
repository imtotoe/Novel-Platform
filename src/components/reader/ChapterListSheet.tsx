"use client";

import Link from "next/link";
import { Coins } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/useMediaQuery";

interface ChapterItem {
  id: string;
  title: string;
  chapterNumber: number;
  coinPrice?: number | null;
}

interface ChapterListSheetProps {
  chapters: ChapterItem[];
  currentChapterId: string;
  novelSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChapterListSheet({
  chapters,
  currentChapterId,
  novelSlug,
  open,
  onOpenChange,
}: ChapterListSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isDesktop ? "left" : "bottom"}
        className={isDesktop ? "w-80 overflow-y-auto" : "h-[70vh] rounded-t-2xl"}
      >
        <SheetHeader>
          <SheetTitle>สารบัญ ({chapters.length} ตอน)</SheetTitle>
        </SheetHeader>
        <div className="mt-2 overflow-y-auto flex-1 -mx-2">
          {chapters.map((ch) => (
            <Link
              key={ch.id}
              href={`/novel/${novelSlug}/${ch.id}`}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-accent",
                ch.id === currentChapterId && "bg-primary/10 text-primary font-medium"
              )}
              onClick={() => onOpenChange(false)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0 w-14 text-muted-foreground">
                  ตอนที่ {ch.chapterNumber}
                </span>
                <span className="truncate">{ch.title}</span>
              </div>
              {ch.coinPrice && ch.coinPrice > 0 && (
                <span className="inline-flex items-center gap-0.5 shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400">
                  <Coins className="h-3 w-3" />
                  {ch.coinPrice}
                </span>
              )}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
