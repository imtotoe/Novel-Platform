"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUp, BookOpen, BookmarkPlus, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface NovelBottomBarProps {
  novelSlug: string;
  novelId: string;
  firstChapterId: string | null;
  lastReadChapterId: string | null;
  lastReadChapterNumber: number | null;
  isBookmarked: boolean;
  isLoggedIn: boolean;
}

export function NovelBottomBar({
  novelSlug,
  novelId,
  firstChapterId,
  lastReadChapterId,
  lastReadChapterNumber,
  isBookmarked: initialBookmarked,
  isLoggedIn,
}: NovelBottomBarProps) {
  const router = useRouter();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 300);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleBookmark() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setBookmarkLoading(true);
    try {
      if (bookmarked) {
        await fetch(`/api/bookmarks/${novelId}`, { method: "DELETE" });
        setBookmarked(false);
        toast.success("ลบบุ๊คมาร์กแล้ว");
      } else {
        await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ novelId }),
        });
        setBookmarked(true);
        toast.success("บุ๊คมาร์กแล้ว");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    }
    setBookmarkLoading(false);
  }

  // Determine CTA
  const hasResume = lastReadChapterId && lastReadChapterNumber;
  const ctaHref = hasResume
    ? `/novel/${novelSlug}/${lastReadChapterId}`
    : firstChapterId
      ? `/novel/${novelSlug}/${firstChapterId}`
      : null;
  const ctaLabel = hasResume
    ? `อ่านต่อ ตอนที่ ${lastReadChapterNumber}`
    : "เริ่มอ่าน";

  if (!ctaHref) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        {/* Scroll to top */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-10 w-10 transition-opacity",
            showScrollTop ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={scrollToTop}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>

        {/* CTA */}
        <Button asChild className="h-10 px-8 font-semibold">
          <Link href={ctaHref}>
            <BookOpen className="mr-2 h-4 w-4" />
            {ctaLabel}
          </Link>
        </Button>

        {/* Bookmark toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={toggleBookmark}
          disabled={bookmarkLoading}
        >
          {bookmarked ? (
            <BookmarkCheck className="h-5 w-5 text-primary" />
          ) : (
            <BookmarkPlus className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
