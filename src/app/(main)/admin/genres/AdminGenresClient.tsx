"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Trash2, Edit, Loader2, X, Check } from "lucide-react";
import { toast } from "sonner";

interface Genre {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  _count: { novels: number };
}

export function AdminGenresClient({ genres }: { genres: Genre[] }) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");

  async function addGenre() {
    if (!newName.trim()) return;
    setAdding(true);
    const res = await fetch("/api/admin/genres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), icon: newIcon.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("เพิ่มแนวนิยายแล้ว");
      setNewName("");
      setNewIcon("");
      router.refresh();
    } else {
      toast.error(data.error || "เกิดข้อผิดพลาด");
    }
    setAdding(false);
  }

  async function updateGenre(id: string) {
    const res = await fetch(`/api/admin/genres/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, icon: editIcon }),
    });
    if (res.ok) {
      toast.success("อัพเดตแล้ว");
      setEditingId(null);
      router.refresh();
    } else {
      toast.error("เกิดข้อผิดพลาด");
    }
  }

  async function deleteGenre(id: string) {
    const res = await fetch(`/api/admin/genres/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      toast.success("ลบแล้ว");
      router.refresh();
    } else {
      toast.error(data.error || "เกิดข้อผิดพลาด");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">จัดการแนวนิยาย ({genres.length})</h1>

      {/* Add Form */}
      <Card>
        <CardContent className="flex items-end gap-3 pt-6">
          <div className="space-y-1">
            <Label className="text-xs">ไอคอน</Label>
            <Input
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              placeholder="emoji"
              className="w-20"
            />
          </div>
          <div className="flex-1 space-y-1">
            <Label className="text-xs">ชื่อแนว</Label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="ชื่อแนวนิยาย"
              onKeyDown={(e) => e.key === "Enter" && addGenre()}
            />
          </div>
          <Button onClick={addGenre} disabled={adding || !newName.trim()}>
            {adding ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-1 h-4 w-4" />}
            เพิ่ม
          </Button>
        </CardContent>
      </Card>

      {/* Genre List */}
      <div className="space-y-2">
        {genres.map((genre) => (
          <Card key={genre.id}>
            <CardContent className="flex items-center gap-3 py-3">
              {editingId === genre.id ? (
                <>
                  <Input
                    value={editIcon}
                    onChange={(e) => setEditIcon(e.target.value)}
                    className="w-16"
                  />
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && updateGenre(genre.id)}
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => updateGenre(genre.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-lg">{genre.icon}</span>
                  <span className="flex-1 text-sm font-medium">{genre.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {genre._count.novels} นิยาย
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => {
                      setEditingId(genre.id);
                      setEditName(genre.name);
                      setEditIcon(genre.icon || "");
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => deleteGenre(genre.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
