import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminNovelsClient } from "./AdminNovelsClient";

export const metadata = { title: "จัดการนิยาย" };

interface Props {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}

export default async function AdminNovelsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const limit = 20;
  const status = params.status;
  const search = params.search;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { author: { username: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [novels, total] = await Promise.all([
    prisma.novel.findMany({
      where,
      include: {
        author: { select: { id: true, username: true, displayName: true } },
        _count: { select: { chapters: true, votes: true, reports: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.novel.count({ where }),
  ]);

  return (
    <AdminNovelsClient
      novels={JSON.parse(JSON.stringify(novels))}
      total={total}
      page={page}
      pages={Math.ceil(total / limit)}
      currentStatus={status || ""}
      currentSearch={search || ""}
    />
  );
}
