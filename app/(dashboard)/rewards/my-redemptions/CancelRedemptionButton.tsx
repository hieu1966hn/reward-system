"use client";

import { useState, useTransition } from "react";
import { cancelRedemptionRequest } from "@/app/actions/redemptions";

function CancelModal({
  busy,
  errorMessage,
  onCancel,
  onConfirm,
}: {
  busy: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Xác nhận huỷ yêu cầu</h3>
            <p className="mt-2 text-sm text-slate-600">
              Yêu cầu đang ở trạng thái chờ duyệt. Thao tác này sẽ chuyển trạng thái sang Đã huỷ.
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 disabled:opacity-50"
            >
              {busy ? "Đang huỷ..." : "Huỷ yêu cầu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CancelRedemptionButton({ redemptionId }: { redemptionId: string }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCancel = () => {
    startTransition(async () => {
      const res = await cancelRedemptionRequest(redemptionId);
      if (!res.success) {
        setErrorMessage(res.error ?? "Không thể huỷ yêu cầu này.");
        return;
      }

      setOpen(false);
      setErrorMessage(null);
    });
  };

  return (
    <>
      <button
        onClick={() => {
          setErrorMessage(null);
          setOpen(true);
        }}
        disabled={isPending}
        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
          isPending
            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
            : "bg-white text-rose-600 border-rose-200 hover:bg-rose-50"
        }`}
      >
        {isPending ? "Đang huỷ..." : "Huỷ yêu cầu"}
      </button>

      {open && (
        <CancelModal
          busy={isPending}
          errorMessage={errorMessage}
          onCancel={() => {
            if (isPending) return;
            setOpen(false);
            setErrorMessage(null);
          }}
          onConfirm={handleCancel}
        />
      )}
    </>
  );
}
