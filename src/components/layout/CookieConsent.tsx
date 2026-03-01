"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "storiwrite-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    document.cookie = `${STORAGE_KEY}=accepted; path=/; max-age=31536000; SameSite=Lax`;
    setVisible(false);
  }

  function handleDecline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    document.cookie = `${STORAGE_KEY}=declined; path=/; max-age=31536000; SameSite=Lax`;
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 shadow-lg">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          เราใช้คุกกี้เพื่อพัฒนาประสบการณ์การใช้งาน อ่านรายละเอียดใน{" "}
          <Link href="/privacy" className="text-primary underline">
            นโยบายความเป็นส่วนตัว
          </Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleDecline}>
            ปฏิเสธ
          </Button>
          <Button size="sm" onClick={handleAccept}>
            ยอมรับ
          </Button>
        </div>
      </div>
    </div>
  );
}
