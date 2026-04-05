"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createRedemptionRequest(rewardId: string) {
  const supabase = await createClient();

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Vui lòng đăng nhập lại." };
  }

  // 2. Determine Role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "student") {
    return { success: false, error: "Chỉ học viên mới có thể yêu cầu đổi quà." };
  }

  // 3. Fetch Reward Details
  const { data: reward } = await supabase
    .from("reward_catalog")
    .select("id, points_required, reward_name, is_active")
    .eq("id", rewardId)
    .single();

  if (!reward) {
    return { success: false, error: "Quà tặng không tồn tại." };
  }
  
  if (!reward.is_active) {
    return { success: false, error: "Quà tặng này hiện không có sẵn." };
  }

  // 4. Check Current Points (Backend Verification)
  const { data: student } = await supabase
    .from("students")
    .select("total_points")
    .eq("id", user.id)
    .single();

  const currentPoints = student?.total_points || 0;

  if (currentPoints < reward.points_required) {
    return { 
      success: false, 
      error: `Bạn còn thiếu ${reward.points_required - currentPoints} điểm để đổi ${reward.reward_name}.` 
    };
  }

  // 5. Insert Redemption Request (Pending status is default per DB schema)
  const { error: insertError } = await supabase
    .from("redemptions")
    .insert({
      student_id: user.id,
      reward_id: reward.id,
      points_cost: reward.points_required,
      status: "pending"
    });

  if (insertError) {
    console.error("Redemption insert error:", insertError.message);
    return { success: false, error: "Đã xảy ra lỗi khi tạo yêu cầu. Vui lòng thử lại sau." };
  }

  revalidatePath("/rewards");
  revalidatePath("/rewards/my-redemptions");
  
  return { success: true, message: `Yêu cầu đổi quà "${reward.reward_name}" đã được gửi thành công!` };
}

export async function cancelRedemptionRequest(redemptionId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("redemptions")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", redemptionId)
    .eq("status", "pending"); // Policy also checks this, but explicitly filter here too

  if (error) {
    console.error("Redemption cancel error:", error.message);
    return { success: false, error: "Không thể huỷ yêu cầu này." };
  }

  revalidatePath("/rewards/my-redemptions");
  return { success: true, message: "Đã huỷ yêu cầu đổi quà thành công." };
}
