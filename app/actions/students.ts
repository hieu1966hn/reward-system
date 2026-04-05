"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function createStudentAccount(formData: FormData) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    return { error: "Thiếu cấu hình hệ thống: SUPABASE_SERVICE_ROLE_KEY" };
  }

  // Khởi tạo Supabase client với quyền admin
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const normalSupabase = await createServerClient();
  // Check role người gọi API
  const { data: { user } } = await normalSupabase.auth.getUser();
  if (!user) return { error: "Vui lòng đăng nhập" };

  const { data: profile } = await normalSupabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && profile?.role !== "teacher") {
    return { error: "Bạn không có quyền thực hiện thao tác này" };
  }

  // Parse Form Data
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString().trim();
  const studentCode = formData.get("student_code")?.toString().trim();
  const className = formData.get("class_name")?.toString().trim();
  const campusId = formData.get("campus_id")?.toString();

  if (!email || !password || !fullName || !studentCode || !className || !campusId) {
    return { error: "Vui lòng điền đầy đủ các trường bắt buộc." };
  }

  // 1. Validate: Không cho phép trùng Mã học viên (tránh race condition sau này)
  const { count } = await supabaseAdmin
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("student_code", studentCode);

  if (count && count > 0) {
    return { error: "Đã tồn tại mã học viên này trong hệ thống." };
  }

  // 2. Tạo User trong Auth. Trả về tự động confirmed email
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    // Có thể lỗi là do Email trùng
    if (authError?.message?.toLowerCase().includes("email")) {
      return { error: "Email này đã được sử dụng." };
    }
    return { error: `Lỗi khởi tạo tài khoản: ${authError?.message}` };
  }

  const newUserId = authData.user.id;

  // Điểm quan trọng: Trigger của Supabase có thể đã tự tạo 1 dòng ở public.profiles.
  // Ta dùng Upsert để đè dữ liệu đàng hoàng, hoặc Update vì id đã tồn tại.
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .upsert({
      id: newUserId,
      full_name: fullName,
      role: "student", // Ép role student
      campus_id: campusId,
    }, { onConflict: "id" });

  if (profileError) {
    console.error("Lỗi khi tạo profile", profileError);
    return { error: "Lỗi tạo thông tin người dùng. Vui lòng báo kĩ thuật viên." };
  }

  // 4. Khởi tạo quỹ điểm trong bảng Students
  const { error: studentError } = await supabaseAdmin
    .from("students")
    .upsert({
      id: newUserId,
      student_code: studentCode,
      class_name: className,
      enrollment_status: "active",
      total_points: 0,
    }, { onConflict: "id" });

  if (studentError) {
    console.error("Lỗi khi tạo row students", studentError);
    return { error: "Tài khoản đã tạo nhưng lỗi kết nối vào bảng Điểm Học Viên." };
  }

  return { success: true, message: "Thêm học viên thành công!" };
}
