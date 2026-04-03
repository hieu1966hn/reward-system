import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/lib/types";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile (role + name)
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role ?? "student") as UserRole;
  const userName = profile?.full_name ?? user.email ?? null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar — fixed left panel */}
      <Sidebar role={role} userName={userName} />

      {/* Main content area — offset by sidebar width */}
      <div className="flex-1 flex flex-col ml-60 min-h-screen">
        {/* Header */}
        <Header pageName="Dashboard" userEmail={user.email ?? null} />

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
