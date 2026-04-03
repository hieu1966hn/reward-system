import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/lib/types";

// Role display mapping
const roleInfo: Record<UserRole, { label: string; badgeClass: string; greeting: string }> = {
  student: {
    label: "Học viên",
    badgeClass: "badge-indigo",
    greeting: "Chào mừng bạn đến với RewardSystem! Kiếm điểm và đổi những phần quà xứng đáng.",
  },
  teacher: {
    label: "Giáo viên",
    badgeClass: "badge-green",
    greeting: "Chào mừng trở lại! Bạn có thể cộng điểm cho học viên và theo dõi tiến trình của lớp.",
  },
  admin: {
    label: "Quản trị viên",
    badgeClass: "badge-amber",
    greeting: "Chào mừng trở lại! Hệ thống RewardSystem đang sẵn sàng vận hành.",
  },
};

// Coming soon items — placeholder for future rounds
const upcomingFeatures = [
  { icon: "⭐", label: "Hồ sơ điểm học viên", round: "Vòng 2" },
  { icon: "📋", label: "Lịch sử tích điểm", round: "Vòng 3" },
  { icon: "🎁", label: "Danh mục quà tặng", round: "Vòng 4" },
  { icon: "🔄", label: "Đổi quà", round: "Vòng 5" },
  { icon: "✅", label: "Duyệt yêu cầu đổi quà", round: "Vòng 6" },
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch profile with campus info
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, campus_id, campuses(campus_name)")
    .eq("id", user!.id)
    .single();

  const role = (profile?.role ?? "student") as UserRole;
  const displayName =
    profile?.full_name ?? user?.email?.split("@")[0] ?? "Bạn";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const campusName = (profile?.campuses as any)?.campus_name ?? null;
  const info = roleInfo[role];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome hero card */}
      <div className="card relative overflow-hidden">
        {/* Accent decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/60 rounded-full -translate-y-32 translate-x-32 pointer-events-none" />
        <div className="absolute bottom-0 right-16 w-32 h-32 bg-violet-50/50 rounded-full translate-y-16 pointer-events-none" />

        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Xin chào 👋</p>
              <h2 className="text-2xl font-bold text-slate-900">
                {displayName}
              </h2>
            </div>
            <div className="flex-shrink-0">
              <span className={`badge ${info.badgeClass} text-sm px-3 py-1`}>
                {info.label}
              </span>
            </div>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            {info.greeting}
          </p>

          {/* Campus info */}
          {campusName && (
            <div className="inline-flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-9.5 11.25S.5 17.642.5 10.5a9 9 0 0 1 18 0Z"
                />
              </svg>
              <span className="text-sm text-slate-600 font-medium">
                {campusName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* System status card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-500">Trạng thái hệ thống</p>
            <p className="text-sm font-semibold text-slate-800">Đang hoạt động</p>
          </div>
        </div>

        <div className="card-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-500">Vòng phát triển</p>
            <p className="text-sm font-semibold text-slate-800">Vòng 1 / 8</p>
          </div>
        </div>

        <div className="card-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-violet-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-500">Phiên bản</p>
            <p className="text-sm font-semibold text-slate-800">MVP Alpha</p>
          </div>
        </div>
      </div>

      {/* Coming soon features */}
      <div className="card">
        <h3 className="text-base font-semibold text-slate-800 mb-1">
          Tính năng sắp ra mắt
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Hệ thống đang trong giai đoạn xây dựng. Các tính năng sẽ được ra mắt
          theo từng vòng.
        </p>

        <div className="space-y-2">
          {upcomingFeatures.map((feature) => (
            <div
              key={feature.label}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{feature.icon}</span>
                <span className="text-sm text-slate-700 font-medium">
                  {feature.label}
                </span>
              </div>
              <span className="badge badge-gray">{feature.round}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
