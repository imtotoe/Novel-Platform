import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AccountSettingsClient } from "./AccountSettingsClient";

export const metadata = { title: "ตั้งค่าบัญชี" };

export default async function AccountSettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">ตั้งค่าบัญชี</h1>
      <AccountSettingsClient email={session.user.email!} />
    </div>
  );
}
