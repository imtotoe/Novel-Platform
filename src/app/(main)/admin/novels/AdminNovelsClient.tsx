"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Star,
  StarOff,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Flag,
} from "lucide-react";
import { toast } from "sonner";

interface Novel {
  id: string;
  title: string;
  slug: string;
  status: string;
  isPublished: boolean;
  isFeatured: boolean;
  views: number;
  createdAt: string;
  author: { id: string; username: string; displayName: string | null };
  _count: { chapters: number; votes: number; reports: number };
}

interface Props {
  novels: Novel[];
  total: number;
  page: number;
  pages: number;
  currentStatus: string;
  currentSearch: string;
}

const statusLabel: Record<string, string> = {
  DRAFT: "ฉบับร่าง",
  ONGOING: "กำลังเขียน",
  COMPLETED: "จบแล้ว",
  HIATUS: "พัก",
};

export function AdminNovelsClient({ novels, total, page, pages, currentStatus, currentSearch }: Props) {
  const router = useRouter();

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = { search: currentSearch || undefined, status: currentStatus || undefined, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, v);
    }
    return `/admin/novels?${p.toString()}`;
  }

  async function toggleFeatured(id: string, isFeatured: boolean) {
    const res = await fetch(`/api/admin/novels/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !isFeatured }),
    });
    if (res.ok) {
      toast.success(isFeatured ? "ยกเลิกแนะนำ" : "ตั้งเป็นแนะนำ");
      router.refresh();
    }
  }

  async function togglePublished(id: string, isPublished: boolean) {
    const res = await fetch(`/api/admin/novels/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !isPublished }),
    });
    if (res.ok) {
      toast.success(isPublished ? "ซ่อนนิยายแล้ว" : "เผยแพร่นิยายแล้ว");
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">จัดการนิยาย ({total})</h1>

      <div className="flex flex-wrap gap-3">
        <form action="/admin/novels" className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input name="search" defaultValue={currentSearch} placeholder="ค้นหานิยาย..." className="pl-8" />
          {currentStatus && <input type="hidden" name="status" value={currentStatus} />}
        </form>
        <Select
          value={currentStatus || "all"}
          onValueChange={(v) => router.push(buildUrl({ status: v === "all" ? undefined : v, page: undefined }))}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="สถานะ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="DRAFT">ฉบับร่าง</SelectItem>
            <SelectItem value="ONGOING">กำลังเขียน</SelectItem>
            <SelectItem value="COMPLETED">จบแล้ว</SelectItem>
            <SelectItem value="HIATUS">พัก</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {novels.map((novel) => (
          <Card key={novel.id}>
            <CardContent className="flex items-center gap-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link href={`/novel/${novel.slug}`} className="text-sm font-medium hover:underline truncate">
                    {novel.title}
                  </Link>
                  <Badge variant="outline">{statusLabel[novel.status]}</Badge>
                  {novel.isPublished && <Badge variant="secondary">เผยแพร่</Badge>}
                  {novel.isFeatured && <Badge className="bg-yellow-500">แนะนำ</Badge>}
                  {novel._count.reports > 0 && (
                    <Badge variant="destructive">
                      <Flag className="mr-1 h-3 w-3" />
                      {novel._count.reports}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  โดย @{novel.author.username} · {novel._count.chapters} ตอน · {novel.views.toLocaleString()} อ่าน · {novel._count.votes} โหวต
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toggleFeatured(novel.id, novel.isFeatured)}
                  title={novel.isFeatured ? "ยกเลิกแนะนำ" : "ตั้งเป็นแนะนำ"}
                >
                  {novel.isFeatured ? (
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => togglePublished(novel.id, novel.isPublished)}
                  title={novel.isPublished ? "ซ่อน" : "เผยแพร่"}
                >
                  {novel.isPublished ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={buildUrl({ page: String(page - 1) })}><ChevronLeft className="h-4 w-4" /> ก่อนหน้า</Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground">{page} / {pages}</span>
          {page < pages && (
            <Button variant="outline" size="sm" asChild>
              <Link href={buildUrl({ page: String(page + 1) })}>ถัดไป <ChevronRight className="h-4 w-4" /></Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
