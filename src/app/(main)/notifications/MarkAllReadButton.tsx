"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";
import { toast } from "sonner";

export function MarkAllReadButton() {
  const router = useRouter();

  async function handleMarkAll() {
    const res = await fetch("/api/notifications/read-all", { method: "PATCH" });
    if (res.ok) {
      toast.success("อ่านทั้งหมดแล้ว");
      router.refresh();
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleMarkAll}>
      <CheckCheck className="mr-1.5 h-4 w-4" />
      อ่านทั้งหมด
    </Button>
  );
}
