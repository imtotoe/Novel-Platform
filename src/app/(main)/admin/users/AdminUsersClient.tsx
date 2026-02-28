"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Search, Shield, ShieldOff } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  role: string;
  isBanned: boolean;
  createdAt: string;
  _count: { novels: number; comments: number };
}

interface AdminUsersClientProps {
  users: User[];
  total: number;
  page: number;
  pages: number;
  currentSearch: string;
  currentRole: string;
}

const roleBadge: Record<string, "default" | "secondary" | "destructive"> = {
  ADMIN: "destructive",
  WRITER: "default",
  READER: "secondary",
};

export function AdminUsersClient({
  users,
  total,
  page,
  pages,
  currentSearch,
  currentRole,
}: AdminUsersClientProps) {
  const router = useRouter();

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = { search: currentSearch || undefined, role: currentRole || undefined, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, v);
    }
    return `/admin/users?${p.toString()}`;
  }

  async function toggleBan(userId: string, isBanned: boolean) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBanned: !isBanned }),
    });
    if (res.ok) {
      toast.success(isBanned ? "ปลดแบนแล้ว" : "แบนแล้ว");
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(data.error || "เกิดข้อผิดพลาด");
    }
  }

  async function changeRole(userId: string, role: string) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      toast.success("เปลี่ยน role แล้ว");
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(data.error || "เกิดข้อผิดพลาด");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">จัดการผู้ใช้งาน ({total})</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form action="/admin/users" className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            defaultValue={currentSearch}
            placeholder="ค้นหาผู้ใช้..."
            className="pl-8"
          />
          {currentRole && <input type="hidden" name="role" value={currentRole} />}
        </form>
        <Select
          value={currentRole || "all"}
          onValueChange={(v) => router.push(buildUrl({ role: v === "all" ? undefined : v, page: undefined }))}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="READER">Reader</SelectItem>
            <SelectItem value="WRITER">Writer</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User List */}
      <div className="space-y-2">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="flex items-center gap-4 py-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar ?? undefined} />
                <AvatarFallback>
                  {(user.displayName ?? user.username)[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/author/${user.username}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {user.displayName || user.username}
                  </Link>
                  <Badge variant={roleBadge[user.role]}>{user.role}</Badge>
                  {user.isBanned && <Badge variant="destructive">Banned</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  @{user.username} · {user.email} · {user._count.novels} นิยาย · {user._count.comments} ความคิดเห็น
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Select
                  value={user.role}
                  onValueChange={(v) => changeRole(user.id, v)}
                >
                  <SelectTrigger className="h-8 w-28 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="READER">Reader</SelectItem>
                    <SelectItem value="WRITER">Writer</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={user.isBanned ? "outline" : "destructive"}
                  size="sm"
                  onClick={() => toggleBan(user.id, user.isBanned)}
                >
                  {user.isBanned ? (
                    <><ShieldOff className="mr-1 h-3 w-3" /> ปลดแบน</>
                  ) : (
                    <><Shield className="mr-1 h-3 w-3" /> แบน</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={buildUrl({ page: String(page - 1) })}>
                <ChevronLeft className="h-4 w-4" /> ก่อนหน้า
              </Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground">{page} / {pages}</span>
          {page < pages && (
            <Button variant="outline" size="sm" asChild>
              <Link href={buildUrl({ page: String(page + 1) })}>
                ถัดไป <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
