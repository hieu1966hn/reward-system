// RewardProgressBar.tsx
// Hiển thị progress bar từ điểm hiện tại đến mốc quà kế tiếp
// Pure display component — không có state, không có side effects

import { RewardCatalog } from "@/lib/types";

interface RewardProgressBarProps {
  currentPoints: number;
  nextReward: RewardCatalog | null; // null nếu đã vượt hết tất cả mốc
  prevMilestone?: number; // điểm của mốc quà trước đó (default 0)
}

// Mapping category → màu sắc badge
const categoryStyle: Record<string, { label: string; badgeClass: string }> = {
  basic: { label: "Cơ bản", badgeClass: "bg-slate-100 text-slate-600" },
  standard: { label: "Tiêu chuẩn", badgeClass: "bg-indigo-100 text-indigo-700" },
  premium: { label: "Cao cấp", badgeClass: "bg-violet-100 text-violet-700" },
  exclusive: { label: "Độc quyền", badgeClass: "bg-amber-100 text-amber-700" },
};

export default function RewardProgressBar({
  currentPoints,
  nextReward,
  prevMilestone = 0,
}: RewardProgressBarProps) {
  // Nếu không còn mốc nào → hiển thị "đã đạt tất cả mốc"
  if (!nextReward) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 font-medium">Tiến độ tích điểm</span>
          <span className="text-green-600 font-semibold">
            🏆 Đã đạt tất cả mốc quà!
          </span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" />
        </div>
        <p className="text-xs text-slate-500">
          Bạn đã vượt qua tất cả mốc quà hiện có. Tiếp tục tích điểm để đổi
          những phần quà đặc biệt hơn!
        </p>
      </div>
    );
  }

  // Tính tỷ lệ progress trong đoạn từ prevMilestone → nextReward.points_required
  const range = nextReward.points_required - prevMilestone;
  const earned = Math.max(0, currentPoints - prevMilestone);
  const percent = range > 0 ? Math.min(100, Math.round((earned / range) * 100)) : 100;
  const pointsLeft = nextReward.points_required - currentPoints;

  const cat = categoryStyle[nextReward.category] ?? categoryStyle.basic;

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Quà tiếp theo</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.badgeClass}`}>
          {cat.label}
        </span>
      </div>

      {/* Reward name */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-lg">🎁</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {nextReward.reward_name}
          </p>
          <p className="text-xs text-slate-500">
            Cần {nextReward.points_required} điểm
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-indigo-600">{percent}%</p>
          <p className="text-xs text-slate-400">đã đạt</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Labels */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{prevMilestone} điểm</span>
          <span className="text-indigo-600 font-medium">
            {pointsLeft > 0 ? `Còn ${pointsLeft} điểm` : "Đủ điểm rồi! 🎉"}
          </span>
          <span>{nextReward.points_required} điểm</span>
        </div>
      </div>

      {/* Description */}
      {nextReward.description && (
        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
          {nextReward.description}
        </p>
      )}
    </div>
  );
}
