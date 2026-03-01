"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReaderTopBarProps {
  novelTitle: string;
  chapterNumber: number;
  visible: boolean;
}

export function ReaderTopBar({ novelTitle, chapterNumber, visible }: ReaderTopBarProps) {
  return (
    <div
      className={cn(
        "fixed top-[3px] left-0 right-0 z-50 transition-all duration-300",
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      )}
    >
      <div className="bg-background/90 backdrop-blur-sm border-b">
        <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 text-primary">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm font-bold hidden sm:inline">StoriWrite</span>
          </Link>

          {/* Chapter info */}
          <div className="flex-1 mx-4 text-center min-w-0">
            <p className="truncate text-xs text-muted-foreground">{novelTitle}</p>
            <p className="truncate text-xs font-medium">ตอนที่ {chapterNumber}</p>
          </div>

          {/* Spacer to balance layout */}
          <div className="w-8" />
        </div>
      </div>
    </div>
  );
}
