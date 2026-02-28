"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, CheckCircle, Clock, Eye } from "lucide-react";
import { toast } from "sonner";

interface Report {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
  reporter: { id: string; username: string };
  reportedUser: { id: string; username: string } | null;
  reportedNovel: { id: string; title: string; slug: string } | null;
  reportedComment: { id: string; content: string } | null;
}

interface Props {
  reports: Report[];
  total: number;
  page: number;
  pages: number;
  currentStatus: string;
}

const reasonLabel: Record<string, string> = {
  INAPPROPRIATE_CONTENT: "เนื้อหาไม่เหมาะสม",
  SPAM: "สแปม",
  COPYRIGHT: "ลิขสิทธิ์",
  OTHER: "อื่นๆ",
};

const statusBadge: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "รอดำเนินการ", variant: "destructive" },
  REVIEWED: { label: "กำลังตรวจสอบ", variant: "default" },
  RESOLVED: { label: "เสร็จสิ้น", variant: "secondary" },
};

export function AdminReportsClient({ reports, total, page, pages, currentStatus }: Props) {
  const router = useRouter();

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success("อัพเดตสถานะแล้ว");
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">รายงาน ({total})</h1>

      <Select
        value={currentStatus || "all"}
        onValueChange={(v) => {
          const p = new URLSearchParams();
          if (v !== "all") p.set("status", v);
          router.push(`/admin/reports?${p.toString()}`);
        }}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="สถานะ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ทั้งหมด</SelectItem>
          <SelectItem value="PENDING">รอดำเนินการ</SelectItem>
          <SelectItem value="REVIEWED">กำลังตรวจสอบ</SelectItem>
          <SelectItem value="RESOLVED">เสร็จสิ้น</SelectItem>
        </SelectContent>
      </Select>

      {reports.length > 0 ? (
        <div className="space-y-2">
          {reports.map((report) => {
            const badge = statusBadge[report.status];
            return (
              <Card key={report.id}>
                <CardContent className="py-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                        <Badge variant="outline">{reasonLabel[report.reason]}</Badge>
                        <span className="text-xs text-muted-foreground">
                          รายงานโดย @{report.reporter.username} ·{" "}
                          {new Date(report.createdAt).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Target */}
                      <div className="mt-1 text-sm">
                        {report.reportedNovel && (
                          <span>
                            นิยาย:{" "}
                            <Link href={`/novel/${report.reportedNovel.slug}`} className="text-primary hover:underline">
                              {report.reportedNovel.title}
                            </Link>
                          </span>
                        )}
                        {report.reportedUser && (
                          <span>
                            ผู้ใช้:{" "}
                            <Link href={`/author/${report.reportedUser.username}`} className="text-primary hover:underline">
                              @{report.reportedUser.username}
                            </Link>
                          </span>
                        )}
                        {report.reportedComment && (
                          <span className="text-muted-foreground">
                            ความคิดเห็น: &ldquo;{report.reportedComment.content.slice(0, 100)}&rdquo;
                          </span>
                        )}
                      </div>

                      {report.description && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {report.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {report.status === "PENDING" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus(report.id, "REVIEWED")}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          ตรวจสอบ
                        </Button>
                      )}
                      {report.status !== "RESOLVED" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => updateStatus(report.id, "RESOLVED")}
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          เสร็จสิ้น
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">ไม่มีรายงาน</h3>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/reports?status=${currentStatus}&page=${page - 1}`}>
                <ChevronLeft className="h-4 w-4" /> ก่อนหน้า
              </Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground">{page} / {pages}</span>
          {page < pages && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/reports?status=${currentStatus}&page=${page + 1}`}>
                ถัดไป <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
