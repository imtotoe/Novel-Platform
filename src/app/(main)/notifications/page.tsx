import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Bell, BookOpen, Heart, MessageCircle, UserPlus } from "lucide-react";
import Link from "next/link";
import { MarkAllReadButton } from "./MarkAllReadButton";

export const metadata = { title: "การแจ้งเตือน" };

const typeIcon: Record<string, React.ReactNode> = {
  NEW_CHAPTER: <BookOpen className="h-4 w-4 text-blue-500" />,
  NEW_COMMENT: <MessageCircle className="h-4 w-4 text-green-500" />,
  NEW_FOLLOWER: <UserPlus className="h-4 w-4 text-purple-500" />,
  NEW_VOTE: <Heart className="h-4 w-4 text-red-500" />,
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Bell className="h-6 w-6" />
            การแจ้งเตือน
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} รายการที่ยังไม่ได้อ่าน
            </p>
          )}
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-1">
          {notifications.map((notification) => {
            const className = `flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-accent ${
              !notification.isRead ? "bg-primary/5" : ""
            }`;

            const content = (
              <>
                <div className="mt-0.5 shrink-0">
                  {typeIcon[notification.type] || <Bell className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${!notification.isRead ? "font-medium" : ""}`}>
                    {notification.message}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
              </>
            );

            return notification.link ? (
              <Link key={notification.id} href={notification.link} className={className}>
                {content}
              </Link>
            ) : (
              <div key={notification.id} className={className}>
                {content}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">ไม่มีการแจ้งเตือน</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            เมื่อมีกิจกรรมใหม่ คุณจะเห็นการแจ้งเตือนที่นี่
          </p>
        </div>
      )}
    </div>
  );
}
