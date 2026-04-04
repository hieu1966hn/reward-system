// app/(dashboard)/profile/page.tsx
// Trang hồ sơ điểm thưởng của học viên
// Server Component — đọc dữ liệu trực tiếp từ Supabase

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserRole, RewardCatalog } from "@/lib/types";
import RewardProgressBar from "@/components/RewardProgressBar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Hồ sơ điểm thưởng — RewardSystem",
  description: "Xem tổng điểm tích lũy và tiến độ đổi quà của bạn",
};


// Mapping category → màu sắc badge
const categoryBadge: Record<
  string,
  { label: string; barClass: string; bgClass: string }
> = {
  basic: {
    label: "Cơ bản",
    barClass: "bg-slate-400",
    bgClass: "bg-slate-50 text-slate-600",
  },
  standard: {
    label: "Tiêu chuẩn",
    barClass: "bg-indigo-500",
    bgClass: "bg-indigo-50 text-indigo-700",
  },
  premium: {
    label: "Cao cấp",
    barClass: "bg-violet-500",
    bgClass: "bg-violet-50 text-violet-700",
  },
  exclusive: {
    label: "Độc quyền",
    barClass: "bg-amber-500",
    bgClass: "bg-amber-50 text-amber-700",
  },
};

const roleLabel: Record<UserRole, string> = {
  student: "Học viên",
  teacher: "Giáo viên",
  admin: "Quản trị viên",
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch profile + campus
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role, campus_id, campuses(campus_name, region)")
    .eq("id", user.id)
    .maybeSingle();

  // Fetch student record (chỉ có nếu role = student)
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("student_code, class_name, total_points, enrollment_status")
    .eq("id", user.id)
    .maybeSingle();

  // Fetch reward catalog (chỉ lấy quà đang active, sắp xếp theo điểm tăng dần)
  const { data: rewards, error: rewardsError } = await supabase
    .from("reward_catalog")
    .select(
      "id, reward_name, reward_slug, points_required, category, description, image_url"
    )
    .eq("is_active", true)
    .order("points_required", { ascending: true });


  const role = (profile?.role ?? "student") as UserRole;
  const displayName =
    profile?.full_name ?? user.email?.split("@")[0] ?? "Bạn";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const campus = profile?.campuses as any;
  const campusName = campus?.campus_name ?? null;
  const campusRegion = campus?.region ?? null;

  const totalPoints = student?.total_points ?? 0;
  const className = student?.class_name ?? null;
  const studentCode = student?.student_code ?? null;

  const rewardList = (rewards ?? []) as RewardCatalog[];
  const shouldShowDebugPanel =
    process.env.NODE_ENV !== "production" &&
    (!!profileError || !!studentError || !!rewardsError || !student);

  // Tính mốc quà kế tiếp (quà đầu tiên mà points_required > totalPoints)
  const nextReward = rewardList.find((r) => r.points_required > totalPoints) ?? null;

  // Mốc trước đó (để tính % progress trong khoảng prevMilestone → nextReward)
  const prevReward =
    nextReward
      ? rewardList.filter((r) => r.points_required <= totalPoints).at(-1)
      : null;
  const prevMilestone = prevReward?.points_required ?? 0;

  // Số quà đã đủ điểm đổi
  const unlocked = rewardList.filter((r) => r.points_required <= totalPoints);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ── Hero Card: Thông tin học viên ─────────────────────── */}
      <div className="card relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-50/70 rounded-full -translate-y-36 translate-x-36 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-50/40 rounded-full translate-y-20 -translate-x-20 pointer-events-none" />

        <div className="relative flex items-start justify-between gap-4">
          {/* Avatar placeholder */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white text-2xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Hồ sơ học viên</p>
              <h1 className="text-2xl font-bold text-slate-900">{displayName}</h1>
              {studentCode && (
                <p className="text-xs text-slate-400 mt-0.5">#{studentCode}</p>
              )}
            </div>
          </div>

          {/* Role badge */}
          <span className="badge badge-indigo text-sm px-3 py-1 flex-shrink-0">
            {roleLabel[role]}
          </span>
        </div>

        {/* Info chips */}
        <div className="relative mt-5 flex flex-wrap gap-2">
          {className && (
            <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5">
              <span className="text-slate-400 text-sm">📚</span>
              <span className="text-sm text-slate-700 font-medium">{className}</span>
            </div>
          )}
          {campusName && (
            <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5">
              <span className="text-slate-400 text-sm">📍</span>
              <span className="text-sm text-slate-700 font-medium">
                {campusName}
                {campusRegion && (
                  <span className="text-slate-400 font-normal"> · {campusRegion}</span>
                )}
              </span>
            </div>
          )}
          {student?.enrollment_status && (
            <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-xl px-3 py-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-green-700 font-medium">Đang học</span>
            </div>
          )}
          {!student && role === "student" && (
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl px-3 py-1.5">
              <span className="text-amber-500 text-sm">⚠️</span>
              <span className="text-sm text-amber-700">Chưa có hồ sơ học viên</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Dev diagnostics ─────────────────────────────────────── */}
      {shouldShowDebugPanel && (
        <div className="card border border-amber-200 bg-amber-50/70">
          <h2 className="text-base font-semibold text-amber-900 mb-3">
            Chẩn đoán dữ liệu (dev only)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-white/80 border border-amber-100 px-4 py-3">
              <p className="text-amber-700 font-medium mb-2">Phiên đăng nhập</p>
              <p className="text-slate-700 break-all">
                <span className="font-medium">Email:</span> {user.email ?? "—"}
              </p>
              <p className="text-slate-700 break-all mt-1">
                <span className="font-medium">User ID:</span> {user.id}
              </p>
            </div>
            <div className="rounded-xl bg-white/80 border border-amber-100 px-4 py-3">
              <p className="text-amber-700 font-medium mb-2">Kết quả truy vấn</p>
              <p className="text-slate-700">
                <span className="font-medium">Profile:</span>{" "}
                {profile ? "OK" : "Không có dữ liệu"}
              </p>
              <p className="text-slate-700 mt-1">
                <span className="font-medium">Student:</span>{" "}
                {student ? "OK" : "Không có dữ liệu"}
              </p>
              <p className="text-slate-700 mt-1">
                <span className="font-medium">Rewards:</span>{" "}
                {rewardList.length} bản ghi
              </p>
            </div>
          </div>

          {(profileError || studentError || rewardsError) && (
            <div className="mt-3 rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-800 space-y-1">
              {profileError && (
                <p>
                  <span className="font-medium">Profile error:</span> {profileError.message}
                </p>
              )}
              {studentError && (
                <p>
                  <span className="font-medium">Student error:</span> {studentError.message}
                </p>
              )}
              {rewardsError && (
                <p>
                  <span className="font-medium">Rewards error:</span> {rewardsError.message}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Điểm tổng + Progress ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tổng điểm — card to nhất */}
        <div className="sm:col-span-1 card flex flex-col items-center justify-center text-center py-8 bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100">
          <p className="text-xs font-medium text-indigo-500 uppercase tracking-wider mb-2">
            Tổng điểm tích lũy
          </p>
          <p className="text-6xl font-extrabold text-indigo-700 tabular-nums leading-none">
            {totalPoints}
          </p>
          <p className="text-sm text-slate-500 mt-2">điểm MindX</p>
        </div>

        {/* Quà đã mở khóa */}
        <div className="card flex flex-col items-center justify-center text-center py-6">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
            <span className="text-lg">🎁</span>
          </div>
          <p className="text-3xl font-bold text-slate-800 tabular-nums">
            {unlocked.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Quà đã đủ điểm đổi</p>
        </div>

        {/* Còn lại đến mốc kế */}
        <div className="card flex flex-col items-center justify-center text-center py-6">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
            <span className="text-lg">🎯</span>
          </div>
          <p className="text-3xl font-bold text-slate-800 tabular-nums">
            {nextReward ? nextReward.points_required - totalPoints : 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">Điểm nữa để lên mốc tiếp</p>
        </div>
      </div>

      {/* ── Progress Bar ─────────────────────────────────────── */}
      <div className="card">
        <h2 className="text-base font-semibold text-slate-800 mb-5">
          Tiến độ đến phần quà kế tiếp
        </h2>
        <RewardProgressBar
          currentPoints={totalPoints}
          nextReward={nextReward}
          prevMilestone={prevMilestone}
        />
      </div>

      {/* ── Quà có thể đổi ngay ──────────────────────────────── */}
      {unlocked.length > 0 && (
        <div className="card">
          <h2 className="text-base font-semibold text-slate-800 mb-1">
            Quà bạn có thể đổi ngay
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Với {totalPoints} điểm hiện tại, bạn đủ điều kiện đổi {unlocked.length} phần quà sau:
          </p>
          <div className="space-y-2">
            {unlocked.map((reward) => {
              const cat = categoryBadge[reward.category] ?? categoryBadge.basic;
              return (
                <div
                  key={reward.id}
                  className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-50 hover:bg-indigo-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎁</span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {reward.reward_name}
                      </p>
                      {reward.description && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {reward.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.bgClass}`}>
                      {cat.label}
                    </span>
                    <span className="text-sm font-bold text-indigo-600">
                      {reward.points_required} đ
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Không phải học viên ──────────────────────────────── */}
      {role !== "student" && (
        <div className="card bg-slate-50 border-slate-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <p className="text-sm font-medium text-slate-700">
                Trang này dành cho học viên
              </p>
              <p className="text-sm text-slate-500">
                Tài khoản của bạn có quyền{" "}
                <strong>{roleLabel[role]}</strong>. Hồ sơ điểm chỉ áp dụng cho học viên có trong bảng students.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
