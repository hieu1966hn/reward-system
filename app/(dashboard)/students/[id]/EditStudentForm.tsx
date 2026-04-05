"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { updateStudent } from "@/app/actions/students";

export default function EditStudentForm({ 
  studentId, 
  initialData, 
  campuses 
}: { 
  studentId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  campuses: any[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const res = await updateStudent(studentId, formData);
        if (res?.error) {
          setErrorMsg(res.error);
        } else if (res?.success) {
          setSuccessMsg("Cập nhật thông tin học viên thành công!");
          router.refresh();
          // Clear success message after 3 seconds
          setTimeout(() => setSuccessMsg(""), 3000);
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setErrorMsg(err.message || "Đã xảy ra lỗi không xác định");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="rounded-xl bg-red-50 p-4 border border-red-100">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Lỗi</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{errorMsg}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl bg-green-50 p-4 border border-green-100">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Thành công</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{successMsg}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
        <div className="sm:col-span-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Email đăng nhập không được lấy từ bảng <code>profiles</code>. Nếu cần hiển thị email ở màn này,
          nên đọc từ <code>auth.users</code> bằng service role hoặc RPC riêng.
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="student_code" className="block text-sm font-medium leading-6 text-gray-900">
            Mã Học Viên (Chỉ định, không sửa)
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="student_code"
              id="student_code"
              readOnly
              disabled
              defaultValue={initialData?.students?.student_code}
              className="block w-full rounded-xl border-0 py-3 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-200 bg-gray-50 focus:ring-2 focus:ring-inset focus:ring-violet-600 sm:text-sm sm:leading-6 cursor-not-allowed uppercase"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="full_name" className="block text-sm font-medium leading-6 text-gray-900">
            Họ và Tên
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="full_name"
              id="full_name"
              required
              defaultValue={initialData?.full_name}
              className="block w-full rounded-xl border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-violet-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div className="sm:col-span-1">
          <label htmlFor="class_name" className="block text-sm font-medium leading-6 text-gray-900">
            Tên Lớp (Có thể sửa đổi khi chuyển lớp)
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="class_name"
              id="class_name"
              required
              defaultValue={initialData?.students?.class_name}
              className="block w-full rounded-xl border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-violet-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div className="sm:col-span-1">
          <label htmlFor="campus_id" className="block text-sm font-medium leading-6 text-gray-900">
            Cơ sở đăng ký
          </label>
          <div className="mt-2">
            <select
              id="campus_id"
              name="campus_id"
              required
              defaultValue={initialData?.campus_id}
              className="block w-full rounded-xl border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-violet-600 sm:text-sm sm:leading-6"
            >
              <option value="">-- Chọn cơ sở --</option>
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>{c.campus_name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="sm:col-span-2">
          <label htmlFor="enrollment_status" className="block text-sm font-medium leading-6 text-gray-900">
            Trạng thái hoạt động (Deactivation)
          </label>
          <p className="text-xs text-gray-500 mb-2">Thay vì xoá học viên (ảnh hưởng dữ liệu điểm số cũ), hãy đổi trạng thái sang Đã nghỉ.</p>
          <div className="mt-2">
            <select
              id="enrollment_status"
              name="enrollment_status"
              required
              defaultValue={initialData?.students?.enrollment_status}
              className="block w-full rounded-xl border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-violet-600 sm:text-sm sm:leading-6"
            >
              <option value="active">Active - Đang học</option>
              <option value="inactive">Inactive - Đã nghỉ</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.push('/students')}
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
        >
          Quay lại danh sách
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Đang lưu...
            </>
          ) : (
            "Lưu thay đổi"
          )}
        </button>
      </div>
    </form>
  );
}
