import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminGenresClient } from "./AdminGenresClient";

export const metadata = { title: "จัดการแนวนิยาย" };

export default async function AdminGenresPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const genres = await prisma.genre.findMany({
    include: { _count: { select: { novels: true } } },
    orderBy: { name: "asc" },
  });

  return <AdminGenresClient genres={JSON.parse(JSON.stringify(genres))} />;
}
