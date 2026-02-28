import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminUsersClient } from "./AdminUsersClient";

export const metadata = { title: "จัดการผู้ใช้งาน" };

interface AdminUsersPageProps {
  searchParams: Promise<{ page?: string; search?: string; role?: string }>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const limit = 20;
  const search = params.search;
  const role = params.role;

  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { username: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { displayName: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        role: true,
        isBanned: true,
        createdAt: true,
        _count: { select: { novels: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return (
    <AdminUsersClient
      users={JSON.parse(JSON.stringify(users))}
      total={total}
      page={page}
      pages={Math.ceil(total / limit)}
      currentSearch={search || ""}
      currentRole={role || ""}
    />
  );
}
