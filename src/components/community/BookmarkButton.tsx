"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BookMarked } from "lucide-react";
import { toast } from "sonner";

interface BookmarkButtonProps {
  novelId: string;
  initialBookmarked: boolean;
  isLoggedIn: boolean;
}

export function BookmarkButton({ novelId, initialBookmarked, isLoggedIn }: BookmarkButtonProps) {
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setLoading(true);
    const method = bookmarked ? "DELETE" : "POST";
    const url = bookmarked ? `/api/bookmarks/${novelId}` : "/api/bookmarks";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: !bookmarked ? JSON.stringify({ novelId }) : undefined,
    });

    if (res.ok) {
      setBookmarked(!bookmarked);
      toast.success(bookmarked ? "ลบบุ๊คมาร์กแล้ว" : "บุ๊คมาร์กแล้ว");
      router.refresh();
    } else {
      toast.error("เกิดข้อผิดพลาด");
    }
    setLoading(false);
  }

  return (
    <Button
      variant={bookmarked ? "default" : "outline"}
      onClick={toggle}
      disabled={loading}
    >
      <BookMarked className={`mr-2 h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
      {bookmarked ? "บุ๊คมาร์กแล้ว" : "บุ๊คมาร์ก"}
    </Button>
  );
}
