"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function AccountSettingsClient({ email, username }: { email: string; username: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      toast.error("รหัสผ่านใหม่ไม่ตรงกัน");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      toast.error("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/user/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
      (e.target as HTMLFormElement).reset();
    } else {
      toast.error(data.error || "เกิดข้อผิดพลาด");
    }
    setLoading(false);
  }

  async function handleExport() {
    setExportLoading(true);
    try {
      const res = await fetch("/api/user/export");
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `storiwrite-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("ดาวน์โหลดข้อมูลสำเร็จ");
    } catch {
      toast.error("เกิดข้อผิดพลาดในการดาวน์โหลด");
    }
    setExportLoading(false);
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== username) return;
    setDeleteLoading(true);

    try {
      const res = await fetch("/api/user/account", { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("ลบบัญชีสำเร็จ");
      await signOut({ redirect: false });
      router.push("/");
    } catch {
      toast.error("เกิดข้อผิดพลาดในการลบบัญชี");
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>อีเมล</CardTitle>
          <CardDescription>อีเมลที่ใช้เข้าสู่ระบบ</CardDescription>
        </CardHeader>
        <CardContent>
          <Input value={email} disabled className="bg-muted" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>เปลี่ยนรหัสผ่าน</CardTitle>
          <CardDescription>ตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">รหัสผ่านปัจจุบัน</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">รหัสผ่านใหม่</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              เปลี่ยนรหัสผ่าน
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ดาวน์โหลดข้อมูล</CardTitle>
          <CardDescription>
            ดาวน์โหลดข้อมูลทั้งหมดของคุณในรูปแบบ JSON ตามสิทธิ์ PDPA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleExport} disabled={exportLoading}>
            {exportLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            ดาวน์โหลดข้อมูลของฉัน
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">ลบบัญชี</CardTitle>
          <CardDescription>
            การลบบัญชีจะลบข้อมูลทั้งหมดของคุณอย่างถาวร รวมถึงนิยาย ตอน ความคิดเห็น และ Coin คงเหลือ
            การกระทำนี้ไม่สามารถย้อนกลับได้
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                ลบบัญชีของฉัน
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ยืนยันการลบบัญชี</DialogTitle>
                <DialogDescription>
                  การกระทำนี้ไม่สามารถย้อนกลับได้ ข้อมูลทั้งหมดจะถูกลบอย่างถาวร
                  พิมพ์ <span className="font-semibold text-foreground">{username}</span> เพื่อยืนยัน
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="deleteConfirm">พิมพ์ชื่อผู้ใช้เพื่อยืนยัน</Label>
                <Input
                  id="deleteConfirm"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder={username}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button
                  variant="destructive"
                  disabled={deleteConfirm !== username || deleteLoading}
                  onClick={handleDeleteAccount}
                >
                  {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  ลบบัญชีถาวร
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
