"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/lib/types";

interface SidebarProps {
  role: UserRole;
  userName: string | null;
}

interface NavItem {
  label: string;
  href: string;
  roles: UserRole[];
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// Navigation items — Round 3
const navSections: NavSection[] = [
  {
    title: "Tổng quan",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        roles: ["student", "teacher", "admin"],
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
      },
      {
        label: "Hồ sơ điểm",
        href: "/profile",
        roles: ["student", "teacher", "admin"],
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
      },
    ],
  },
  {
    title: "Quà tặng",
    items: [
      {
        label: "Danh mục quà tặng",
        href: "/rewards",
        roles: ["student", "teacher", "admin"],
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
              d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
            />
          </svg>
        ),
      },
      {
        label: "Yêu cầu của tôi",
        href: "/rewards/my-redemptions",
        roles: ["student"],
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
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.25 2.25 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V8.25H8.25Zm-1.5-1.5h1.5"
            />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Vận hành",
    items: [
      {
        label: "Kho quà (Inventory)",
        href: "/inventory",
        roles: ["teacher", "admin"],
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
          </svg>
        ),
      },
      {
        label: "Duyệt đổi quà",
        href: "/approvals",
        roles: ["teacher", "admin"],
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Điểm thưởng",
    items: [
      {
        label: "Lịch sử điểm",
        href: "/points/history",
        roles: ["student", "teacher", "admin"],
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
              d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z"
            />
          </svg>
        ),
      },
      {
        label: "Cộng điểm thủ công",
        href: "/points/add",
        roles: ["teacher", "admin"],
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
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        ),
      },
      {
        label: "Danh sách rule",
        href: "/points/rules",
        roles: ["student", "teacher", "admin"],
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
              d="M16.5 6.75h-9m9 5.25h-9m9 5.25h-9"
            />
          </svg>
        ),
      },
    ],
  },
];

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();

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
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-auto">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => item.roles.includes(role));

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-1">
              <p className="px-3 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {section.title}
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
            </div>
          );
        })}
      </nav>

      {/* User info at bottom */}
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-indigo-600">
              {(userName ?? "?").charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">
              {userName ?? "Người dùng"}
            </p>
            <span className={`badge text-xs ${badge.className}`}>{badge.label}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
