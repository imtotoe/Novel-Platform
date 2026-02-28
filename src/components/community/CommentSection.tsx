"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageCircle } from "lucide-react";
import { CommentItem } from "./CommentItem";
import { toast } from "sonner";
import Link from "next/link";

interface CommentUser {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: CommentUser;
  replies?: Comment[];
  replyCount?: number;
}

interface CommentSectionProps {
  chapterId: string;
}

export function CommentSection({ chapterId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async (p: number) => {
    setLoading(true);
    const res = await fetch(`/api/chapters/${chapterId}/comments?page=${p}&limit=20`);
    if (res.ok) {
      const data = await res.json();
      setComments(data.comments);
      setTotal(data.total);
      setPages(data.pages);
    }
    setLoading(false);
  }, [chapterId]);

  useEffect(() => {
    fetchComments(page);
  }, [page, fetchComments]);

  async function handleSubmit() {
    if (!newComment.trim()) return;
    setSubmitting(true);

    const res = await fetch(`/api/chapters/${chapterId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment }),
    });

    if (res.ok) {
      setNewComment("");
      toast.success("แสดงความคิดเห็นแล้ว");
      fetchComments(1);
      setPage(1);
    } else {
      toast.error("เกิดข้อผิดพลาด");
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <MessageCircle className="h-5 w-5" />
        ความคิดเห็น ({total})
      </h3>

      {/* New Comment Form */}
      {session ? (
        <div className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="เขียนความคิดเห็น..."
            rows={3}
            maxLength={1000}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {newComment.length}/1000
            </span>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !newComment.trim()}
              size="sm"
            >
              {submitting && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              ส่งความคิดเห็น
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border p-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            เข้าสู่ระบบ
          </Link>{" "}
          เพื่อแสดงความคิดเห็น
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length > 0 ? (
        <div className="divide-y">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              chapterId={chapterId}
              currentUserId={session?.user?.id}
              isAdmin={session?.user?.role === "ADMIN"}
            />
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">
          ยังไม่มีความคิดเห็น — เป็นคนแรกที่แสดงความคิดเห็น!
        </p>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ก่อนหน้า
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
          >
            ถัดไป
          </Button>
        </div>
      )}
    </div>
  );
}
