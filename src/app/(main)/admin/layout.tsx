import Link from "next/link";
import { BarChart3, Users, BookOpen, Flag, Tags } from "lucide-react";

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/users", label: "ผู้ใช้งาน", icon: Users },
  { href: "/admin/novels", label: "นิยาย", icon: BookOpen },
  { href: "/admin/reports", label: "รายงาน", icon: Flag },
  { href: "/admin/genres", label: "แนวนิยาย", icon: Tags },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl">
      <aside className="hidden w-52 shrink-0 border-r md:block">
        <nav className="sticky top-14 space-y-1 p-4">
          <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            Admin Panel
          </p>
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 p-4 md:p-6">{children}</div>
    </div>
  );
}
