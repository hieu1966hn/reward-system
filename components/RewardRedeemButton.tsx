"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRedemptionRequest } from "@/app/actions/redemptions";
import { RewardCatalog } from "@/lib/types";

interface RewardRedeemButtonProps {
  reward: RewardCatalog;
  isEnough: boolean;
  currentPoints: number;
}

export default function RewardRedeemButton({ reward, isEnough, currentPoints }: RewardRedeemButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRedeem = () => {
    if (!isEnough) return;
    setError(null);
    setShowConfirm(true);
  };

  const confirmRedeem = () => {
    startTransition(async () => {
      setError(null);
      const res = await createRedemptionRequest(reward.id);
      
      if (res.success) {
        setShowConfirm(false);
        router.push("/rewards/my-redemptions?success=true");
      } else {
        setError(res.error || "Đã có lỗi xảy ra.");
      }
    });
  };

  return (
    <>
      <button
        onClick={handleRedeem}
        disabled={!isEnough || isPending}
        className={`w-full py-3 px-4 rounded-xl font-medium flex justify-center items-center gap-2 transition-colors ${
          !isEnough
            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
        }`}
      >
        {isPending ? (
          <svg className="w-5 h-5 animate-spin text-white/70" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21h-1.5v-6h3v6z" />
          </svg>
        )}
        {!isEnough ? "Chưa đủ điểm" : isPending ? "Đang xử lý..." : "Đổi quà ngay"}
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 10.5l3.75 3.75-3.75 3.75" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l3.75 3.75-3.75 3.75" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Xác nhận đổi quà</h3>
              <p className="text-slate-600 mb-6 flex flex-col gap-2 text-sm text-center items-start">
                <span>Bạn đang gửi yêu cầu đổi phần quà <strong>"{reward.reward_name}"</strong>.</span>
                <span className="bg-slate-50 border border-slate-200 rounded-lg p-3 w-full flex justify-between items-center text-left">
                  <span>Điểm hiện có</span>
                  <strong className="text-indigo-600 text-base">{currentPoints}</strong>
                </span>
                <span className="bg-slate-50 border border-slate-200 rounded-lg p-3 w-full flex justify-between items-center text-left">
                  <span>Điểm quà tặng</span>
                  <strong className="text-rose-500 text-base">-{reward.points_required}</strong>
                </span>
                <span className="mt-2 text-xs italic text-slate-500 text-left">
                  * Hệ thống sẽ tạo yêu cầu chờ duyệt. Bạn chưa bị trừ điểm ngay.
                </span>
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                >
                  Huỷ
                </button>
                <button
                  onClick={confirmRedeem}
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium transition-colors flex justify-center items-center gap-2"
                >
                  {isPending ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý
                    </>
                  ) : (
                    "Xác nhận đổi"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
