"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface VoteButtonProps {
  novelId: string;
  initialVoted: boolean;
  initialCount: number;
  isLoggedIn: boolean;
}

export function VoteButton({ novelId, initialVoted, initialCount, isLoggedIn }: VoteButtonProps) {
  const router = useRouter();
  const [voted, setVoted] = useState(initialVoted);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setLoading(true);
    const method = voted ? "DELETE" : "POST";
    const url = voted ? `/api/votes/${novelId}` : "/api/votes";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: !voted ? JSON.stringify({ novelId }) : undefined,
    });

    if (res.ok) {
      const data = await res.json();
      setVoted(data.voted);
      setCount(data.voteCount);
      router.refresh();
    } else {
      toast.error("เกิดข้อผิดพลาด");
    }
    setLoading(false);
  }

  return (
    <Button
      variant={voted ? "default" : "outline"}
      onClick={toggle}
      disabled={loading}
    >
      <Heart className={`mr-2 h-4 w-4 ${voted ? "fill-current" : ""}`} />
      โหวต {count}
    </Button>
  );
}
