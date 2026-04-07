"use client";

import { useTransition, useRef, useState } from "react";
import { createStudentAccount } from "@/app/actions/students";

export default function AddStudentForm({ campuses }: { campuses: { id: string; campus_name: string }[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await createStudentAccount(formData);
      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        setSuccess(res.message || "Tạo tài khoản học viên thành công!");
        formRef.current?.reset();
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-6">
      
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-start gap-3 text-sm">
          <span className="font-bold">Lỗi:</span>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-start gap-3 text-sm">
          <span className="font-bold">Thành công:</span>
          <p>{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="label">Họ và Tên</label>
          <input
            name="full_name"
            type="text"
            required
            placeholder="VD: Nguyễn Văn A"
            className="input"
          />
        </div>
        
        <div className="space-y-2">
          <label className="label">Mã Học Viên</label>
          <input
            name="student_code"
            type="text"
            required
            placeholder="VD: HS0001"
            className="input uppercase placeholder:normal-case"
          />
        </div>

        <div className="space-y-2">
          <label className="label">Tên Lớp</label>
          <input
            name="class_name"
            type="text"
            required
            placeholder="VD: Lập trình C1"
            className="input"
          />
        </div>

        <div className="space-y-2">
          <label className="label">Cơ sở đăng ký</label>
          <select
            name="campus_id"
            required
            className="input bg-white"
          >
            <option value="">-- Chọn cơ sở --</option>
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>{c.campus_name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="label">Email Đăng Nhập</label>
          <input
            name="email"
            type="email"
            required
            placeholder="student@example.com"
            className="input"
          />
        </div>

        <div className="space-y-2">
          <label className="label">Mật Khẩu Ban Đầu</label>
          <input
            name="password"
            type="text"
            required
            defaultValue="123456"
            className="input text-slate-600 font-mono"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary px-8"
        >
          {isPending ? "Đang xử lý..." : "Khởi tạo tài khoản"}
        </button>
      </div>

    </form>
  );
}
