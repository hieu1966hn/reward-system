import { createClient } from "@/lib/supabase/server";
import { getAdminDashboardData, getStudentDashboardData } from "@/app/actions/dashboard";
import Link from "next/link";

async function AdminDashboard() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tổng quan hệ thống</h1>
        <p className="text-slate-500 text-sm mt-1">Xin chào, đây là các chỉ số hoạt động mới nhất.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-2">Tổng Học Viên</div>
          <div className="text-4xl font-bold text-slate-900">{data.studentCount}</div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-2">Yêu cầu Đổi quà rớt Pending</div>
          <div className="text-4xl font-bold text-amber-500">{data.pendingCount}</div>
          <Link href="/approvals" className="text-xs text-indigo-600 font-medium hover:underline mt-2 inline-block">
            Xử lý ngay &rarr;
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-2">Đơn đã giao thành công</div>
          <div className="text-4xl font-bold text-emerald-600">{data.fulfilledCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Kho hàng */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Cảnh báo Tồn Kho</h3>
            <Link href="/inventory" className="text-xs text-indigo-600 font-medium hover:underline">
              Xem tất cả
            </Link>
          </div>
          <ul className="divide-y divide-slate-100 px-6">
            {data.lowStock.length === 0 ? (
              <li className="py-6 text-center text-slate-500 text-sm">Kho hàng đang ổn định, không có món nào thiếu hụt.</li>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data.lowStock.map((item: any) => (
                <li key={item.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-800">{item.reward?.reward_name || "N/A"}</p>
                    <p className="text-xs text-slate-500">{item.campus?.campus_name || "N/A"}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${item.stock_quantity === 0 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                    Còn {item.stock_quantity}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

async function StudentDashboard({ userId }: { userId: string }) {
  const data = await getStudentDashboardData(userId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const studentStats = Array.isArray(data.profile?.students) ? data.profile?.students[0] : (data.profile?.students as any);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Chào, {data.profile?.full_name || "bạn"}!</h1>
          <p className="text-indigo-100 font-medium">{studentStats?.class_name || "Chưa có lớp"}</p>
          <div className="mt-8">
            <p className="text-indigo-100 text-sm font-medium mb-1">Hiện có (Điểm SP)</p>
            <p className="text-5xl font-black">{studentStats?.total_points || 0}</p>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl font-bold" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Lịch sử điểm gần đây</h3>
          <Link href="/points/history" className="text-xs text-indigo-600 font-medium hover:underline">
            Chi tiết
          </Link>
        </div>
        <ul className="divide-y divide-slate-100">
          {data.recentTransactions.length === 0 ? (
            <li className="py-8 text-center text-slate-500 text-sm">Bạn chưa có lịch sử nhận/đổi điểm nào.</li>
          ) : (
            data.recentTransactions.map((tx) => (
              <li key={tx.id} className="py-4 px-6 flex justify-between items-center hover:bg-slate-50">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-slate-800">{tx.note || (tx.source_type === "redemption" ? "Đổi quà" : "Nhận điểm")}</span>
                  <span className="text-xs text-slate-400">
                    {new Intl.DateTimeFormat('vi-VN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(tx.created_at))}
                  </span>
                </div>
                <div className={`font-bold ${tx.points_delta > 0 ? "text-emerald-500" : "text-slate-600"}`}>
                  {tx.points_delta > 0 ? "+" : ""}{tx.points_delta}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-8">Vui lòng đăng nhập.</div>;
  }

  // Get user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role || "student";

  return (
    <div className="max-w-5xl mx-auto">
      {role === "student" ? (
        <StudentDashboard userId={user.id} />
      ) : (
        <AdminDashboard />
      )}
    </div>
  );
}
