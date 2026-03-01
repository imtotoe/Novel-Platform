"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, List, Settings, MessageSquare, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReadingTheme } from "@/lib/useReaderSettings";

interface ReaderOverlayProps {
  visible: boolean;
  onDismiss: () => void;
  onOpenSettings: () => void;
  onOpenChapterList: () => void;
  onScrollToComments: () => void;
  onCycleTheme: () => void;
  currentTheme: ReadingTheme;
  chapterNumber: number;
  novelSlug: string;
  prevChapter: { id: string; chapterNumber: number } | null;
  nextChapter: { id: string; chapterNumber: number } | null;
}

const themeLabels: Record<ReadingTheme, string> = {
  default: "ปกติ",
  sepia: "ซีเปีย",
  dark: "มืด",
  night: "กลางคืน",
};

export function ReaderOverlay({
  visible,
  onDismiss,
  onOpenSettings,
  onOpenChapterList,
  onScrollToComments,
  onCycleTheme,
  currentTheme,
  chapterNumber,
  novelSlug,
  prevChapter,
  nextChapter,
}: ReaderOverlayProps) {
  const autoHideRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (visible) {
      autoHideRef.current = setTimeout(onDismiss, 5000);
      return () => clearTimeout(autoHideRef.current);
    }
  }, [visible, onDismiss]);

  // Reset timer on interaction
  function resetTimer() {
    if (autoHideRef.current) clearTimeout(autoHideRef.current);
    autoHideRef.current = setTimeout(onDismiss, 5000);
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[55] flex flex-col justify-between transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={onDismiss}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Top info */}
      <div
        className="relative z-10 bg-background/95 backdrop-blur-sm px-4 py-3 border-b"
        onClick={(e) => e.stopPropagation()}
        onPointerMove={resetTimer}
      >
        <p className="text-sm font-medium text-center">ตอนที่ {chapterNumber}</p>
      </div>

      {/* Center action icons */}
      <div
        className="relative z-10 flex items-center justify-center gap-6"
        onClick={(e) => e.stopPropagation()}
        onPointerMove={resetTimer}
      >
        <div className="flex items-center gap-4 rounded-2xl bg-background/95 backdrop-blur-sm px-6 py-3 shadow-lg border">
          <button
            onClick={() => { onOpenChapterList(); onDismiss(); }}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <List className="h-6 w-6" />
            <span className="text-[10px]">สารบัญ</span>
          </button>
          <button
            onClick={() => { onOpenSettings(); onDismiss(); }}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="h-6 w-6" />
            <span className="text-[10px]">ตั้งค่า</span>
          </button>
          <button
            onClick={() => { onScrollToComments(); onDismiss(); }}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageSquare className="h-6 w-6" />
            <span className="text-[10px]">ความเห็น</span>
          </button>
          <button
            onClick={() => { onCycleTheme(); resetTimer(); }}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Palette className="h-6 w-6" />
            <span className="text-[10px]">{themeLabels[currentTheme]}</span>
          </button>
        </div>
      </div>

      {/* Bottom navigation */}
      <div
        className="relative z-10 bg-background/95 backdrop-blur-sm px-4 py-3 border-t"
        onClick={(e) => e.stopPropagation()}
        onPointerMove={resetTimer}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          {prevChapter ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/novel/${novelSlug}/${prevChapter.id}`}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                ตอนที่ {prevChapter.chapterNumber}
              </Link>
            </Button>
          ) : (
            <div className="text-xs text-muted-foreground px-2">ตอนแรก</div>
          )}

          <span className="text-xs text-muted-foreground">
            ตอนที่ {chapterNumber}
          </span>

          {nextChapter ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/novel/${novelSlug}/${nextChapter.id}`}>
                ตอนที่ {nextChapter.chapterNumber}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <div className="text-xs text-muted-foreground px-2">ตอนล่าสุด</div>
          )}
        </div>
      </div>
    </div>
  );
}
