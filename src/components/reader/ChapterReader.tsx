"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, List, Maximize2, Minimize2 } from "lucide-react";
import { ChapterContent } from "./ChapterContent";
import { ReaderSettings } from "./ReaderSettings";
import { CommentSection } from "@/components/community/CommentSection";
import { ReadingProgress } from "./ReadingProgress";
import { Separator } from "@/components/ui/separator";
import { useReaderSettings } from "@/lib/useReaderSettings";
import { cn } from "@/lib/utils";
import type { JSONContent } from "@tiptap/react";

interface ChapterData {
  id: string;
  title: string;
  chapterNumber: number;
  content: JSONContent;
  wordCount: number;
  publishedAt: string | null;
}

interface ChapterReaderProps {
  chapter: ChapterData;
  novelSlug: string;
  novelTitle: string;
  prevChapter: { id: string; title: string; chapterNumber: number } | null;
  nextChapter: { id: string; title: string; chapterNumber: number } | null;
}

const readingThemeStyles: Record<string, { bg: string; text: string }> = {
  default: { bg: "", text: "" },
  sepia: { bg: "bg-[#F5EFDC]", text: "text-[#5C4B3E]" },
  dark: { bg: "bg-[#1E1E1E]", text: "text-[#D4D4D4]" },
  night: { bg: "bg-[#0A0A0A]", text: "text-[#A89B8C]" },
};

const fontFamilyMap: Record<string, string> = {
  sans: "font-sans",
  serif: "font-serif",
  sarabun: "font-[Sarabun]",
  mono: "font-mono",
};

export function ChapterReader({
  chapter,
  novelSlug,
  novelTitle,
  prevChapter,
  nextChapter,
}: ChapterReaderProps) {
  const {
    fontSize,
    lineHeight,
    fontFamily,
    paragraphSpacing,
    maxWidth,
    readingTheme,
    blueLightFilter,
    brightness,
    immersiveMode,
    toggleImmersiveMode,
  } = useReaderSettings();

  const theme = readingThemeStyles[readingTheme] || readingThemeStyles.default;

  // --- Immersive mode: auto-hide controls on scroll ---
  const [controlsVisible, setControlsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide site navbar & footer when immersive
  useEffect(() => {
    const navbar = document.querySelector("nav");
    const footer = document.querySelector("footer");
    if (immersiveMode) {
      navbar?.classList.add("!hidden");
      footer?.classList.add("!hidden");
      // Push body to remove top spacing from navbar
      document.body.style.paddingTop = "0";
    } else {
      navbar?.classList.remove("!hidden");
      footer?.classList.remove("!hidden");
      document.body.style.paddingTop = "";
    }
    return () => {
      navbar?.classList.remove("!hidden");
      footer?.classList.remove("!hidden");
      document.body.style.paddingTop = "";
    };
  }, [immersiveMode]);

  // Auto-hide controls on scroll down, show on scroll up
  const handleScroll = useCallback(() => {
    if (!immersiveMode) return;
    const currentY = window.scrollY;
    if (currentY > lastScrollY && currentY > 100) {
      // scrolling down → hide
      setControlsVisible(false);
    } else {
      // scrolling up → show
      setControlsVisible(true);
    }
    setLastScrollY(currentY);
  }, [immersiveMode, lastScrollY]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Tap on reading area toggles controls in immersive mode
  const handleContentClick = useCallback(
    (e: React.MouseEvent) => {
      if (!immersiveMode) return;
      // Don't toggle if clicking a link or button
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [role=button]")) return;
      setControlsVisible((prev) => !prev);
    },
    [immersiveMode]
  );

  return (
    <div className={cn("relative", immersiveMode && "min-h-screen")}>
      {/* Top Nav */}
      <div
        className={cn(
          "z-40 border-b bg-background/95 backdrop-blur transition-all duration-300",
          immersiveMode
            ? controlsVisible
              ? "sticky top-0 translate-y-0 opacity-100"
              : "sticky top-0 -translate-y-full opacity-0 pointer-events-none"
            : "sticky top-14"
        )}
      >
        <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href={`/novel/${novelSlug}`}>
                <List className="h-4 w-4" />
              </Link>
            </Button>
            <span className="truncate text-xs text-muted-foreground">
              {novelTitle}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* Immersive mode toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleImmersiveMode}
              title={immersiveMode ? "ออกจากโหมดอ่าน" : "โหมดอ่านเต็มจอ"}
            >
              {immersiveMode ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <ReaderSettings />
          </div>
        </div>
      </div>

      {/* Reading Area */}
      <div
        className={cn(
          "min-h-screen transition-colors duration-300",
          theme.bg,
          theme.text
        )}
        style={{ filter: `brightness(${brightness}%)` }}
        onClick={handleContentClick}
      >
        {/* Chapter Header */}
        <div
          className={cn("mx-auto px-4 pt-8 pb-4", immersiveMode && "px-6 sm:px-8")}
          style={{ maxWidth }}
        >
          <p className="text-sm opacity-70">ตอนที่ {chapter.chapterNumber}</p>
          <h1 className="mt-1 text-xl font-bold md:text-2xl">{chapter.title}</h1>
          <div className="mt-2 flex items-center gap-3 text-xs opacity-60">
            <span>
              {chapter.wordCount.toLocaleString()} คำ · ~
              {Math.max(1, Math.ceil(chapter.wordCount / 250))} นาที
            </span>
            {chapter.publishedAt && (
              <span>
                {new Date(chapter.publishedAt).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div
          className={cn("mx-auto px-4 pb-12", immersiveMode && "px-6 sm:px-8")}
          style={{ maxWidth }}
        >
          <ChapterContent
            content={chapter.content}
            fontSize={fontSize}
            lineHeight={lineHeight}
            fontFamily={fontFamilyMap[fontFamily] || ""}
            paragraphSpacing={paragraphSpacing}
          />
        </div>

        {/* Blue light filter overlay */}
        {blueLightFilter > 0 && (
          <div
            className="pointer-events-none fixed inset-0 z-50"
            style={{
              backgroundColor: `rgba(255, 180, 50, ${blueLightFilter / 400})`,
              mixBlendMode: "multiply",
            }}
          />
        )}
      </div>

      {/* Reading Progress Tracker */}
      <ReadingProgress chapterId={chapter.id} />

      {/* Comments — hidden in immersive mode */}
      {!immersiveMode && (
        <div className="mx-auto max-w-3xl px-4 pb-8">
          <Separator className="mb-8" />
          <CommentSection chapterId={chapter.id} />
        </div>
      )}

      {/* Bottom Navigation */}
      <div
        className={cn(
          "border-t bg-muted/30 transition-all duration-300",
          immersiveMode && !controlsVisible && "translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          {prevChapter ? (
            <Button variant="outline" asChild>
              <Link href={`/novel/${novelSlug}/${prevChapter.id}`}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                ตอนที่ {prevChapter.chapterNumber}
              </Link>
            </Button>
          ) : (
            <div />
          )}

          <Button variant="ghost" size="sm" asChild>
            <Link href={`/novel/${novelSlug}`}>สารบัญ</Link>
          </Button>

          {nextChapter ? (
            <Button variant="outline" asChild>
              <Link href={`/novel/${novelSlug}/${nextChapter.id}`}>
                ตอนที่ {nextChapter.chapterNumber}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
