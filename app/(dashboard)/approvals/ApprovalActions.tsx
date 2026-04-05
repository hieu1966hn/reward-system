"use client";

import { useState, useTransition } from "react";
import {
  approveRedemptionRequest,
  rejectRedemptionRequest,
  fulfillRedemptionRequest,
} from "@/app/actions/approvals";

interface Props {
  redemptionId: string;
  campusId: string | null | undefined;
  status: string;
}

type ActionKind = "approve" | "reject" | "fulfill" | null;

const ACTION_COPY: Record<Exclude<ActionKind, null>, { title: string; body: string; confirm: string }> = {
  approve: {
    title: "Xác nhận duyệt yêu cầu",
    body: "Thao tác này sẽ trừ điểm học viên và trừ 1 đơn vị tồn kho tại cơ sở tương ứng.",
    confirm: "Duyệt yêu cầu",
  },
  reject: {
    title: "Xác nhận từ chối yêu cầu",
    body: "Thao tác này chỉ đổi trạng thái yêu cầu sang Từ chối và không tác động đến điểm hay tồn kho.",
    confirm: "Từ chối yêu cầu",
  },
  fulfill: {
    title: "Xác nhận đã giao quà",
    body: "Thao tác này đánh dấu yêu cầu là Đã giao quà. Hệ thống sẽ không hiển thị nút thao tác tiếp theo.",
    confirm: "Đã giao quà",
  },
};

function ActionModal({
  action,
  busy,
  errorMessage,
  onCancel,
  onConfirm,
}: {
  action: Exclude<ActionKind, null>;
  busy: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const copy = ACTION_COPY[action];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{copy.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{copy.body}</p>
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
              Huỷ
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
            >
              {busy ? "Đang xử lý..." : copy.confirm}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ApprovalActions({ redemptionId, campusId, status }: Props) {
  const [isPending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<ActionKind>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.";

  const closeModal = () => {
    if (isPending) return;
    setActiveAction(null);
    setErrorMessage(null);
  };

  const runAction = () => {
    if (!activeAction) return;

    if (activeAction === "approve" && !campusId) {
      setErrorMessage("Không xác định được campus của học viên để trừ kho.");
      return;
    }

    startTransition(async () => {
      try {
        setErrorMessage(null);

        if (activeAction === "approve" && campusId) {
          await approveRedemptionRequest(redemptionId, campusId);
        }

        if (activeAction === "reject") {
          await rejectRedemptionRequest(redemptionId);
        }

        if (activeAction === "fulfill") {
          await fulfillRedemptionRequest(redemptionId);
        }

        setActiveAction(null);
      } catch (err: unknown) {
        setErrorMessage(getErrorMessage(err));
      }
    });
  };

  return (
    <>
      {status === "pending" && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setErrorMessage(null);
              setActiveAction("approve");
            }}
            disabled={isPending}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
          >
            Duyệt
          </button>
          <button
            onClick={() => {
              setErrorMessage(null);
              setActiveAction("reject");
            }}
            disabled={isPending}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
          >
            Từ chối
          </button>
        </div>
      )}

      {status === "approved" && (
        <button
          onClick={() => {
            setErrorMessage(null);
            setActiveAction("fulfill");
          }}
          disabled={isPending}
          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-md transition-colors disabled:opacity-50 shadow-sm"
        >
          Xác nhận đã giao
        </button>
      )}

      {status !== "pending" && status !== "approved" && (
        <span className="text-slate-400 text-xs italic">Không khả dụng</span>
      )}

      {activeAction && (
        <ActionModal
          action={activeAction}
          busy={isPending}
          errorMessage={errorMessage}
          onCancel={closeModal}
          onConfirm={runAction}
        />
      )}
    </>
  );
}
