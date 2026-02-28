"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Trash2, Loader2 } from "lucide-react";
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

interface CommentItemProps {
  comment: Comment;
  chapterId: string;
  currentUserId?: string;
  isAdmin?: boolean;
  depth?: number;
}

export function CommentItem({
  comment,
  chapterId,
  currentUserId,
  isAdmin,
  depth = 0,
}: CommentItemProps) {
  const router = useRouter();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = currentUserId === comment.user.id;
  const canDelete = isOwner || isAdmin;

  async function handleReply() {
    if (!replyContent.trim()) return;
    setSubmitting(true);

    const res = await fetch(`/api/chapters/${chapterId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyContent, parentId: comment.id }),
    });

    if (res.ok) {
      setReplyContent("");
      setShowReplyForm(false);
      toast.success("ตอบกลับแล้ว");
      router.refresh();
    } else {
      toast.error("เกิดข้อผิดพลาด");
    }
    setSubmitting(false);
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("ลบความคิดเห็นแล้ว");
      router.refresh();
    } else {
      toast.error("เกิดข้อผิดพลาด");
    }
    setDeleting(false);
  }

  return (
    <div className={depth > 0 ? "ml-8 border-l pl-4" : ""}>
      <div className="flex gap-3 py-3">
        <Link href={`/author/${comment.user.username}`}>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={comment.user.avatar ?? undefined} />
            <AvatarFallback>
              {(comment.user.displayName ?? comment.user.username)[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/author/${comment.user.username}`}
              className="text-sm font-medium hover:underline"
            >
              {comment.user.displayName || comment.user.username}
            </Link>
            <span className="text-xs text-muted-foreground">
              {new Date(comment.createdAt).toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <p className="mt-1 whitespace-pre-line text-sm">{comment.content}</p>
          <div className="mt-1 flex items-center gap-2">
            {currentUserId && depth === 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <MessageCircle className="mr-1 h-3 w-3" />
                ตอบกลับ
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                ลบ
              </Button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-2 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="เขียนตอบกลับ..."
                rows={2}
                maxLength={1000}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleReply} disabled={submitting || !replyContent.trim()}>
                  {submitting && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                  ตอบกลับ
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent("");
                  }}
                >
                  ยกเลิก
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              chapterId={chapterId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
