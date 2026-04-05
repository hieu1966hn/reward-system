import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RedemptionStatus } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import CancelRedemptionButton from "./CancelRedemptionButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Yêu cầu của tôi — RewardSystem",
  description: "Trang danh sách yêu cầu đổi quà của học viên.",
};

const STATUS_MAP: Record<RedemptionStatus, { label: string; color: string }> = {
  pending: { label: "Đang chờ duyệt", color: "bg-amber-100 text-amber-700 border-amber-200" },
  approved: { label: "Đã duyệt", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  fulfilled: { label: "Đã phát quà", color: "bg-blue-100 text-blue-700 border-blue-200" },
  rejected: { label: "Đã từ chối", color: "bg-rose-100 text-rose-700 border-rose-200" },
  cancelled: { label: "Đã huỷ", color: "bg-slate-100 text-slate-700 border-slate-200" },
};

export default async function MyRedemptionsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch redemptions with joined reward details
  const { data: redemptions, error } = await supabase
    .from("redemptions")
    .select(`
      *,
      reward:reward_id (
        reward_name,
        image_url,
        category
      )
    `)
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="card text-red-600 bg-red-50 border border-red-200">
        Không thể tải yêu cầu: {error.message}
      </div>
    );
  }

  return (
    <section className="max-w-5xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 card">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Yêu cầu đổi quà của tôi</h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi tiến trình các món quà bạn đã yêu cầu.
          </p>
        </div>
      </header>

      {redemptions.length === 0 ? (
        <div className="card text-center text-slate-500 py-16">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex flex-col items-center justify-center mb-4">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          Chưa có yêu cầu đổi quà nào.
          <div className="mt-4">
            <Link href="/rewards" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
              Khám phá danh mục
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4 font-semibold">Món quà</th>
                  <th className="px-6 py-4 font-semibold">Điểm dùng</th>
                  <th className="px-6 py-4 font-semibold">Ngày yêu cầu</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {redemptions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.reward?.image_url ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden relative border border-slate-200 bg-white">
                            <Image src={item.reward.image_url} alt={item.reward.reward_name} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-400 flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21h-1.5v-6h3v6z" />
                            </svg>
                          </div>
                        )}
                        <span className="font-medium text-slate-800">{item.reward?.reward_name || "Quà không xác định"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-rose-500">
                      -{item.points_cost}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(item.created_at).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_MAP[item.status as RedemptionStatus].color}`}>
                        {STATUS_MAP[item.status as RedemptionStatus].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.status === 'pending' ? (
                        <CancelRedemptionButton redemptionId={item.id} />
                      ) : (
                        <span className="text-slate-400 italic text-xs">Không khả dụng</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
