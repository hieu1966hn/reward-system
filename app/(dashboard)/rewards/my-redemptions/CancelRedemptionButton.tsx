"use client";

import { useTransition } from "react";
import { cancelRedemptionRequest } from "@/app/actions/redemptions";

export default function CancelRedemptionButton({ redemptionId }: { redemptionId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    if (!confirm("Bạn có chắc chắn muốn huỷ yêu cầu đổi quà này không?")) return;
    
    startTransition(async () => {
      const res = await cancelRedemptionRequest(redemptionId);
      if (!res.success) {
        alert(res.error);
      }
    });
  };

  return (
    <button
      onClick={handleCancel}
      disabled={isPending}
      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
        isPending 
        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" 
        : "bg-white text-rose-600 border-rose-200 hover:bg-rose-50"
      }`}
    >
      {isPending ? "Đang huỷ..." : "Huỷ yêu cầu"}
    </button>
  );
}
