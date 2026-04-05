import { getStudentsList } from "@/app/actions/students";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import StudentsFilter from "./StudentsFilter";

export const metadata = {
  title: "Quản lý Học viên | Hệ thống Đổi quà",
};

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; campus?: string; status?: string }>;
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

  const awaitedSearchParams = await searchParams;
  const students = await getStudentsList(awaitedSearchParams);

  // Fetch campuses for the filter
  const { data: campuses } = await supabase.from("campuses").select("id, campus_name").order("campus_name");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý Học viên</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách tổng quan toàn bộ học viên trong hệ thống.</p>
        </div>
        <Link
          href="/students/new"
          className="inline-flex items-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 transition-colors shrink-0"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Thêm học viên
        </Link>
      </div>

      <StudentsFilter campuses={campuses || []} searchParams={awaitedSearchParams} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Học viên</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thông tin Lớp</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Điểm</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {students && students.length > 0 ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                students.map((student: any) => {
                  const studentData = student.students || {};
                  return (
                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 shrink-0 rounded-full bg-violet-100 flex items-center justify-center">
                            <span className="text-violet-600 font-medium text-sm">
                              {student.full_name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                            <div className="text-sm text-gray-500">{studentData.student_code || 'Chưa cập nhật mã'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{studentData.class_name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{student.campuses?.campus_name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          studentData.enrollment_status === 'active' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {studentData.enrollment_status === 'active' ? 'Đang học' : 'Đã nghỉ'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {studentData.total_points || 0} điểm
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/students/${student.id}`} className="text-violet-600 hover:text-violet-900">
                          Xem / Sửa
                        </Link>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                    Không tìm thấy học viên nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
