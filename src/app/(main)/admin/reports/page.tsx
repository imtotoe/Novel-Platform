import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminReportsClient } from "./AdminReportsClient";

export const metadata = { title: "รายงาน" };

interface Props {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function AdminReportsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const limit = 20;
  const status = params.status;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        reporter: { select: { id: true, username: true } },
        reportedUser: { select: { id: true, username: true } },
        reportedNovel: { select: { id: true, title: true, slug: true } },
        reportedComment: { select: { id: true, content: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.report.count({ where }),
  ]);

  return (
    <AdminReportsClient
      reports={JSON.parse(JSON.stringify(reports))}
      total={total}
      page={page}
      pages={Math.ceil(total / limit)}
      currentStatus={status || ""}
    />
  );
}
