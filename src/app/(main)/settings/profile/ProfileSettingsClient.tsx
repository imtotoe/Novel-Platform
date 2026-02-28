"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Camera } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
  email: string;
}

export function ProfileSettingsClient({ user }: { user: User }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("รองรับเฉพาะไฟล์ JPG, PNG, WEBP");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("ไฟล์ใหญ่เกินไป (สูงสุด 2MB)");
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setAvatarPreview(data.url);
        toast.success("อัพโหลดรูปโปรไฟล์สำเร็จ");
      } else {
        toast.error(data.error || "อัพโหลดล้มเหลว");
        setAvatarPreview(user.avatar);
      }
    } catch {
      toast.error("อัพโหลดล้มเหลว");
      setAvatarPreview(user.avatar);
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      displayName: formData.get("displayName") as string,
      bio: formData.get("bio") as string,
    };

    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      toast.success("บันทึกโปรไฟล์สำเร็จ");
      router.refresh();
    } else {
      toast.error("เกิดข้อผิดพลาด");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>รูปโปรไฟล์</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarPreview ?? undefined} />
              <AvatarFallback className="text-2xl">
                {(user.displayName ?? user.username)[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p>คลิกไอคอนกล้องเพื่อเปลี่ยนรูป</p>
            <p>รองรับ JPG, PNG, WEBP (สูงสุด 2MB)</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลโปรไฟล์</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>ชื่อผู้ใช้</Label>
            <Input value={user.username} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">ชื่อผู้ใช้ไม่สามารถเปลี่ยนได้</p>
          </div>

          <div className="space-y-2">
            <Label>อีเมล</Label>
            <Input value={user.email} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">ชื่อที่แสดง</Label>
            <Input
              id="displayName"
              name="displayName"
              defaultValue={user.displayName ?? ""}
              placeholder="ชื่อที่ต้องการให้แสดง"
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">แนะนำตัว</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={user.bio ?? ""}
              placeholder="เขียนแนะนำตัวสั้นๆ..."
              maxLength={500}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          บันทึก
        </Button>
      </div>
    </form>
  );
}
