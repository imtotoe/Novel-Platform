import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileSettingsClient } from "./ProfileSettingsClient";

export const metadata = { title: "ตั้งค่าโปรไฟล์" };

export default async function ProfileSettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      bio: true,
      email: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">ตั้งค่าโปรไฟล์</h1>
      <ProfileSettingsClient user={user} />
    </div>
  );
}
