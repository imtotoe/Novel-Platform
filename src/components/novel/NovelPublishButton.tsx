"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Globe, GlobeLock, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface NovelPublishButtonProps {
  novelId: string;
  isPublished: boolean;
}

export function NovelPublishButton({ novelId, isPublished }: NovelPublishButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch(`/api/novels/${novelId}/publish`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.novel.isPublished ? "เผยแพร่นิยายแล้ว" : "ยกเลิกการเผยแพร่แล้ว");
      router.refresh();
    } else {
      toast.error(data.error || "เกิดข้อผิดพลาด");
    }
    setLoading(false);
  }

  return (
    <Button
      variant={isPublished ? "outline" : "default"}
      size="sm"
      onClick={toggle}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
      ) : isPublished ? (
        <GlobeLock className="mr-1.5 h-4 w-4" />
      ) : (
        <Globe className="mr-1.5 h-4 w-4" />
      )}
      {isPublished ? "ยกเลิกเผยแพร่" : "เผยแพร่นิยาย"}
    </Button>
  );
}
