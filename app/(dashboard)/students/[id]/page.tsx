import { getStudentById } from "@/app/actions/students";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EditStudentForm from "./EditStudentForm";

export const metadata = {
  title: "Thông tin Học viên | Hệ thống Đổi quà",
};

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "teacher") {
    redirect("/dashboard");
  }

  const awaitedParams = await params;
  const studentId = awaitedParams.id;
  
  const studentData = await getStudentById(studentId);
  const { data: campuses } = await supabase.from("campuses").select("id, campus_name").order("campus_name");

  if (!studentData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Không tìm thấy học viên</h2>
        <p className="mt-2 text-gray-500">Dữ liệu học viên này không tồn tại hoặc đã bị xoá.</p>
      </div>
    );
  }

  // Supabase might return joined relation as an array if not explicitly marked one-to-one
  const details = Array.isArray(studentData.students) ? studentData.students[0] : studentData.students;
  // Patch initialData for the form
  const safeInitialData = {
    ...studentData,
    students: details
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Chỉnh sửa Học Viên</h1>
        <p className="text-sm text-gray-500 mt-1">Cập nhật thông tin lớp, cơ sở hoặc trạng thái học tập.</p>
      </div>

      {/* Mini Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Giới hạn Điểm</p>
            <p className="text-2xl font-bold text-gray-900">{details?.total_points || 0}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-yellow-50 flex items-center justify-center">
            <span className="text-yellow-600 text-lg">✨</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Loại tài khoản</p>
            <p className="text-lg font-bold text-gray-900 capitalize">Học sinh</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
            <span className="text-blue-600 text-lg">👩‍🎓</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Trạng thái</p>
            <p className="text-lg font-bold text-gray-900">
              {details?.enrollment_status === 'active' ? 'Đang hoạt động' : 'Vô hiệu hóa'}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center">
            <span className="text-gray-600 text-lg">📌</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
        <EditStudentForm 
          studentId={studentId} 
          initialData={safeInitialData} 
          campuses={campuses || []} 
        />
      </div>
    </div>
  );
}
