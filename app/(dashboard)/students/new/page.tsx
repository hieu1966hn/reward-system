import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AddStudentForm from "./AddStudentForm";

// Trang này chỉ Admin/Teacher mới thấy
export default async function NewStudentPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "teacher") {
    redirect("/dashboard");
  }

  // Lấy các Campuses để hiển thị trong mục Select
  const { data: campuses } = await supabase
    .from("campuses")
    .select("id, campus_name")
    .order("campus_name");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Thêm Học Viên Mới</h1>
        <p className="text-slate-500 text-sm mt-1">Cấp tài khoản và khởi tạo hồ sơ học viên trên hệ thống.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <AddStudentForm campuses={campuses || []} />
      </div>
    </div>
  );
}
