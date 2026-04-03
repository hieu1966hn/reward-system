"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface HeaderProps {
  pageName: string;
  userEmail: string | null;
}

export default function Header({ pageName, userEmail }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
      {/* Page title */}
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{pageName}</h1>
      </div>

      {/* Right side: user email + logout */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500 hidden sm:block">
          {userEmail}
        </span>

        <button
          id="logout-button"
          onClick={handleLogout}
          className="btn-secondary text-sm gap-1.5"
          aria-label="Đăng xuất"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
            />
          </svg>
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
