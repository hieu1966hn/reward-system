"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getSingleValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function makeRedirectWithMessage(
  type: "ok" | "error",
  message: string,
  txId?: string
): never {
  const params = new URLSearchParams();
  params.set(type, message);

  if (txId) {
    params.set("tx", txId);
  }

  redirect(`/points/add?${params.toString()}`);
}

export async function awardPointsManualAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !["admin", "teacher"].includes(profile.role)) {
    makeRedirectWithMessage("error", "Bạn không có quyền cộng điểm thủ công.");
  }

  const studentId = getSingleValue(formData, "student_id");
  const ruleId = getSingleValue(formData, "rule_id");
  const note = getSingleValue(formData, "note");
  const providedEventKey = getSingleValue(formData, "event_key");

  if (!studentId || !ruleId || !note) {
    makeRedirectWithMessage("error", "Vui lòng chọn học viên, rule và nhập ghi chú.");
  }

  const generatedEventKey = `manual:${studentId}:${ruleId}:${Date.now()}`;
  const eventKey = providedEventKey || generatedEventKey;

  const { data, error } = await supabase.rpc("award_points_manual", {
    p_student_id: studentId,
    p_rule_id: ruleId,
    p_note: note,
    p_event_key: eventKey,
  });

  if (error) {
    makeRedirectWithMessage("error", error.message);
  }

  revalidatePath("/profile");
  revalidatePath("/points/history");
  revalidatePath("/points/add");

  makeRedirectWithMessage("ok", "Cộng điểm thành công.", String(data));
}
