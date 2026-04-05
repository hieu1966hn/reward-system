import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RewardCatalog, UserRole } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Danh mục quà tặng — RewardSystem",
  description: "Trang danh mục quà tặng để học viên đổi điểm.",
};

const CATEGORIES = [
  { value: "all", label: "Tất cả" },
  { value: "basic", label: "Basic" },
  { value: "standard", label: "Standard" },
  { value: "premium", label: "Premium" },
  { value: "exclusive", label: "Exclusive" },
];

export default async function RewardsCatalogPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const currentCategory = (searchParams.category as string) || "all";

  const supabase = await createClient();

  // 1. Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 2. Fetch role and points if student
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

  // 3. Fetch rewards catalog
  let query = supabase
    .from("reward_catalog")
    .select("*")
    .eq("is_active", true)
    .order("points_required", { ascending: true });

  if (currentCategory !== "all") {
    query = query.eq("category", currentCategory);
  }

  const { data: rewards, error } = await query;
  const rewardList = (rewards ?? []) as RewardCatalog[];

  return (
    <section className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 card">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh mục quà tặng</h1>
          <p className="text-sm text-slate-500 mt-1">
            Mở khóa phần thưởng bằng số điểm bạn đã tích lũy.
          </p>
        </div>

        {role === "student" && (
          <div className="flex flex-col items-end">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
              Điểm hiện tại của bạn
            </span>
            <div className="text-2xl font-bold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-xl border border-indigo-100">
              {currentPoints} <span className="text-sm text-indigo-400">điểm</span>
            </div>
          </div>
        )}
      </header>

      {error && (
        <div className="card text-red-600 bg-red-50 border border-red-200">
          Không thể tải danh mục: {error.message}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={`/rewards${cat.value !== "all" ? `?category=${cat.value}` : ""}`}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors whitespace-nowrap ${
              currentCategory === cat.value
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {rewardList.length === 0 && !error && (
        <div className="card text-center text-slate-500 py-12">
          Không tìm thấy quà nào phù hợp.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rewardList.map((reward) => {
          const isEnough = currentPoints >= reward.points_required;
          const remaining = Math.max(0, reward.points_required - currentPoints);

          return (
            <Link href={`/rewards/${reward.id}`} key={reward.id} className="group outline-none">
              <div className="bg-white border text-left border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full ring-2 ring-transparent group-focus-visible:ring-indigo-500 cursor-pointer">
                <div className="aspect-[4/3] bg-slate-50 relative border-b border-slate-100 p-6 flex flex-col items-center justify-center">
                  {/* Badge Category */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm capitalize">
                    {reward.category}
                  </div>

                  {/* Placeholder Image / Icon */}
                  {reward.image_url ? (
                    <Image
                      src={reward.image_url}
                      alt={reward.reward_name}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21h-1.5v-6h3v6z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-slate-800 text-lg mb-1 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                    {reward.reward_name}
                  </h3>
                  <div className="text-xl font-bold text-indigo-600 flex items-baseline gap-1 mt-auto pt-3">
                    {reward.points_required}
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      điểm
                    </span>
                  </div>

                  {/* Condition Badge (for student) */}
                  {role === "student" && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      {isEnough ? (
                        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg text-sm font-medium border border-emerald-100">
                          <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                          </svg>
                          Bạn đã đủ điểm
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-2 rounded-lg text-sm border border-slate-200">
                          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Còn thiếu <span className="font-semibold text-slate-700">{remaining}</span> điểm
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
