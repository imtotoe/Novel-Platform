"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ReaderSettings, type ReaderSettingsHandle } from "./ReaderSettings";

interface ReaderTopBarProps {
  novelTitle: string;
  chapterNumber: number;
  visible: boolean;
  settingsRef?: React.RefObject<ReaderSettingsHandle | null>;
  onExitImmersive?: () => void;
}

export function ReaderTopBar({
  novelTitle,
  chapterNumber,
  visible,
  settingsRef,
  onExitImmersive,
}: ReaderTopBarProps) {
  const [scrollPct, setScrollPct] = useState(0);
  const { data: session } = useSession();
  const user = session?.user;

  useEffect(() => {
    function onScroll() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      setScrollPct(Math.min(100, Math.round((window.scrollY / docHeight) * 100)));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        <div className="mx-auto flex h-12 max-w-3xl items-center px-4 gap-2">
          {/* Logo — links home */}
          <Link href="/" className="flex items-center gap-1.5 text-primary shrink-0">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm font-bold hidden sm:inline">StoriWrite</span>
          </Link>

          {/* Chapter info + scroll % */}
          <div className="flex-1 mx-3 text-center min-w-0">
            <p className="truncate text-xs text-muted-foreground">{novelTitle}</p>
            <p className="truncate text-xs font-medium">
              ตอนที่ {chapterNumber}
              <span className="ml-2 text-[10px] text-muted-foreground tabular-nums">
                {scrollPct}%
              </span>
            </p>
          </div>

          {/* Right controls — desktop only (mobile/tablet uses tap-to-open sheet) */}
          <div className="hidden md:flex items-center gap-1 shrink-0">
            {/* Exit immersive */}
            {onExitImmersive && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onExitImmersive}
                title="ออกจากโหมดเต็มจอ"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            )}
            {/* Reading settings — same component as normal mode */}
            {settingsRef && <ReaderSettings ref={settingsRef} />}
          </div>

          {/* Avatar — always visible */}
          <div className="shrink-0 ml-1">
            {user ? (
              <Link href={`/author/${user.username}`}>
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {(user.name ?? user.username ?? "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground px-1">
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
