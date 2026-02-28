"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface FollowButtonProps {
  userId: string;
  initialFollowing: boolean;
  isLoggedIn: boolean;
  isSelf?: boolean;
}

export function FollowButton({
  userId,
  initialFollowing,
  isLoggedIn,
  isSelf,
}: FollowButtonProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  if (isSelf) return null;

  async function toggle() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setLoading(true);
    const method = following ? "DELETE" : "POST";
    const url = following ? `/api/follow/${userId}` : "/api/follow";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: !following ? JSON.stringify({ userId }) : undefined,
    });

    if (res.ok) {
      setFollowing(!following);
      toast.success(following ? "เลิกติดตามแล้ว" : "ติดตามแล้ว");
      router.refresh();
    } else {
      toast.error("เกิดข้อผิดพลาด");
    }
    setLoading(false);
  }

  return (
    <Button
      variant={following ? "secondary" : "default"}
      size="sm"
      onClick={toggle}
      disabled={loading}
    >
      {following ? (
        <>
          <UserCheck className="mr-1.5 h-4 w-4" />
          ติดตามแล้ว
        </>
      ) : (
        <>
          <UserPlus className="mr-1.5 h-4 w-4" />
          ติดตาม
        </>
      )}
    </Button>
  );
}
