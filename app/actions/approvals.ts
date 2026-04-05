"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Phê duyệt đơn đổi quà (Atomic)
 * Gọi hàm RPC để trừ kho, trừ điểm cứng và ghi lại report âm
 */
export async function approveRedemptionRequest(redemptionId: string, campusId: string) {
  const supabase = await createClient();

  // Gọi RPC
  const { error } = await supabase.rpc("approve_redemption", {
    p_redemption_id: redemptionId,
    p_campus_id: campusId,
  });

  if (error) {
    console.error("Approve Redemption RPC Error:", error);
    throw new Error("Lỗi khi duyệt yêu cầu: " + error.message);
  }

  revalidatePath("/approvals");
  revalidatePath("/inventory");
}

/**
 * Từ chối đơn đổi quà
 * Chỉ UPDATE trạng thái, không tác động kho hay điểm
 */
export async function rejectRedemptionRequest(redemptionId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("redemptions")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", redemptionId)
    .eq("status", "pending");

  if (error) {
    console.error("Reject Redemption Error:", error);
    throw new Error("Lỗi khi từ chối yêu cầu: " + error.message);
  }

  revalidatePath("/approvals");
}

/**
 * Xác nhận đã phát quà thành công
 */
export async function fulfillRedemptionRequest(redemptionId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("redemptions")
    .update({ status: "fulfilled", updated_at: new Date().toISOString() })
    .eq("id", redemptionId)
    .eq("status", "approved");

  if (error) {
    console.error("Fulfill Redemption Error:", error);
    throw new Error("Lỗi khi xác nhận phát quà: " + error.message);
  }

  revalidatePath("/approvals");
}
