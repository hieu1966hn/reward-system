"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/lib/types";

interface SidebarProps {
  role: UserRole;
  userName: string | null;
}

// Navigation items — updated each round
// Round 1: Dashboard | Round 2: + Hồ sơ điểm
const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
        />
      </svg>
    ),
    roles: ["student", "teacher", "admin"] as UserRole[],
  },
  {
    label: "Hồ sơ điểm",
    href: "/profile",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
        />
      </svg>
    ),
    roles: ["student", "teacher", "admin"] as UserRole[],
  },
];

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();

  // Filter nav items by role
  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  // Role badge mapping
  const roleBadge: Record<UserRole, { label: string; className: string }> = {
    student: { label: "Học viên", className: "badge-indigo" },
    teacher: { label: "Giáo viên", className: "badge-green" },
    admin: { label: "Quản trị", className: "badge-amber" },
  };

  const badge = roleBadge[role];

  return (
    <aside className="fixed top-0 left-0 h-full w-60 bg-white border-r border-slate-100 flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
              />
            </svg>
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 leading-tight block">
              RewardSystem
            </span>
            <span className="text-xs text-slate-400 leading-tight">MindX</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Menu
        </p>

        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? "nav-item-active" : "nav-item"}
              aria-current={isActive ? "page" : undefined}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info at bottom */}
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          {/* Avatar placeholder */}
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-indigo-600">
              {(userName ?? "?").charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">
              {userName ?? "Người dùng"}
            </p>
            <span className={`badge text-xs ${badge.className}`}>
              {badge.label}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
