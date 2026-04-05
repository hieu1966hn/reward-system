import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RewardCatalog, UserRole } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return {
    title: `Chi tiết quà - ${params.id}`,
  };
}

export default async function RewardDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const rewardId = params.id;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role: UserRole = (profile?.role as UserRole) || "student";
  let currentPoints = 0;

  if (role === "student") {
    const { data: student } = await supabase
      .from("students")
      .select("total_points")
      .eq("id", user.id)
      .maybeSingle();
    currentPoints = student?.total_points || 0;
  }

  const { data: reward, error } = await supabase
    .from("reward_catalog")
    .select("*")
    .eq("id", rewardId)
    .maybeSingle();

  if (error || !reward) {
    notFound();
  }

  const r = reward as RewardCatalog;
  const isEnough = currentPoints >= r.points_required;
  const remaining = Math.max(0, r.points_required - currentPoints);
  const progressPercent = Math.min(100, Math.round((currentPoints / r.points_required) * 100));

  return (
    <section className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/rewards"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Quay lại danh sách
      </Link>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Image */}
        <div className="md:w-1/2 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 p-8 flex flex-col items-center justify-center min-h-[300px] relative">
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full capitalize shadow-sm z-10">
            {r.category}
          </div>

          {r.image_url ? (
            <Image
              src={r.image_url}
              alt={r.reward_name}
              fill
              className="object-contain p-8"
            />
          ) : (
            <div className="w-32 h-32 rounded-3xl bg-indigo-100 text-indigo-400 flex items-center justify-center shadow-inner">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21h-1.5v-6h3v6z" />
              </svg>
            </div>
          )}
        </div>

        {/* Right Side: Details & Actions */}
        <div className="md:w-1/2 p-8 flex flex-col">
          <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2">
            {r.reward_name}
          </h1>

          <div className="text-3xl font-extrabold text-indigo-600 flex items-baseline gap-1 mt-2">
            {r.points_required}
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              điểm
            </span>
          </div>

          <div className="mt-6 prose prose-sm text-slate-600">
            {r.description ? (
              <p>{r.description}</p>
            ) : (
              <p className="italic text-slate-400">Không có mô tả chi tiết.</p>
            )}
          </div>

          <div className="mt-auto pt-8">
            {role === "student" && (
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-slate-600">Tiến độ của bạn</span>
                    <span className="text-slate-900">{currentPoints} / {r.points_required}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isEnough ? "bg-emerald-500" : "bg-indigo-500"
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="mt-3 text-sm">
                    {isEnough ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                        Tuyệt vời! Bạn đã đủ điểm đổi. (Tính năng đổi quà sắp ra mắt)
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Bạn cần tích lũy thêm <strong className="text-slate-700">{remaining} điểm</strong>
                      </span>
                    )}
                  </div>
                </div>

                <button
                  disabled
                  className="w-full py-3 px-4 bg-slate-900 text-white rounded-xl font-medium cursor-not-allowed opacity-50 flex justify-center items-center gap-2"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Tính năng đổi quà sắp mở ở Vòng 5
                </button>
              </div>
            )}

            {role !== "student" && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm">
                <strong>Chế độ Admin/Teacher:</strong> Chức năng đổi quà chỉ hiển thị và khả dụng đối với học viên.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
