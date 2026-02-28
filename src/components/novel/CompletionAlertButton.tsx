"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CompletionAlertButtonProps {
  novelId: string;
  novelStatus: string;
}

export function CompletionAlertButton({ novelId, novelStatus }: CompletionAlertButtonProps) {
  const [hasAlert, setHasAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (novelStatus === "COMPLETED") return;
    fetch(`/api/novels/${novelId}/completion-alert`)
      .then((r) => r.json())
      .then((data) => {
        setHasAlert(data.hasAlert);
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, [novelId, novelStatus]);

  if (novelStatus === "COMPLETED" || !checked) return null;

  async function toggle() {
    setLoading(true);
    const method = hasAlert ? "DELETE" : "POST";
    const res = await fetch(`/api/novels/${novelId}/completion-alert`, { method });
    const data = await res.json();
    if (res.ok) {
      setHasAlert(data.hasAlert);
      toast.success(data.hasAlert ? "จะแจ้งเตือนเมื่อนิยายจบ" : "ยกเลิกการแจ้งเตือนแล้ว");
    } else {
      toast.error(data.error || "เกิดข้อผิดพลาด");
    }
    setLoading(false);
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle} disabled={loading}>
      {loading ? (
        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
      ) : hasAlert ? (
        <BellOff className="mr-1.5 h-4 w-4" />
      ) : (
        <Bell className="mr-1.5 h-4 w-4" />
      )}
      {hasAlert ? "ยกเลิกแจ้งเตือน" : "แจ้งเมื่อนิยายจบ"}
    </Button>
  );
}
