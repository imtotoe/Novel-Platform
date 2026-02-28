"use client";

import { useEffect, useRef, useCallback } from "react";

interface ReadingProgressProps {
  chapterId: string;
  initialProgress?: number;
}

export function ReadingProgress({ chapterId, initialProgress }: ReadingProgressProps) {
  const lastSavedRef = useRef(initialProgress ?? 0);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const saveProgress = useCallback(
    (progress: number) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (Math.abs(progress - lastSavedRef.current) < 5) return;
        lastSavedRef.current = progress;
        fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chapterId, progress }),
        }).catch(() => {});
      }, 5000);
    },
    [chapterId]
  );

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const progress = Math.min(100, Math.round((scrollTop / docHeight) * 100));
      saveProgress(progress);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [saveProgress]);

  // Auto scroll to saved progress on mount
  useEffect(() => {
    if (!initialProgress || initialProgress <= 5) return;
    const timer = setTimeout(() => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const targetY = (initialProgress / 100) * docHeight;
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }, 500);
    return () => clearTimeout(timer);
  }, [initialProgress]);

  return null;
}
