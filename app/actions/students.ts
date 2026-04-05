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

export async function getStudentsList(searchParams?: { search?: string, campus?: string, status?: string }) {
  const supabase = await createServerClient();
  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  let query = supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      role,
      campus_id,
      campuses ( campus_name ),
      students ( student_code, class_name, total_points, enrollment_status )
    `)
    .eq("role", "student")
    .order("created_at", { ascending: false });

  if (searchParams?.campus) {
    query = query.eq("campus_id", searchParams.campus);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Manual filtering for relation fields
  let filteredData = data;
  
  if (searchParams?.status) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filteredData = filteredData.filter(d => (d.students as any)?.enrollment_status === searchParams.status);
  }

  if (searchParams?.search) {
    const q = searchParams.search.toLowerCase();
    filteredData = filteredData.filter(d => 
      d.full_name?.toLowerCase().includes(q) || 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (d.students as any)?.student_code?.toLowerCase().includes(q)
    );
  }

  return filteredData;
}

export async function getStudentById(id: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      campus_id,
      campuses ( campus_name ),
      students ( student_code, class_name, total_points, enrollment_status )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateStudent(id: string, formData: FormData) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    return { error: "Thiếu cấu hình hệ thống: SUPABASE_SERVICE_ROLE_KEY" };
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const normalSupabase = await createServerClient();
  const { data: { user } } = await normalSupabase.auth.getUser();
  if (!user) return { error: "Vui lòng đăng nhập" };

  const { data: profile } = await normalSupabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && profile?.role !== "teacher") {
    return { error: "Bạn không có quyền thực hiện thao tác này" };
  }

  const fullName = formData.get("full_name")?.toString().trim();
  const className = formData.get("class_name")?.toString().trim();
  const campusId = formData.get("campus_id")?.toString();
  const status = formData.get("enrollment_status")?.toString();

  if (!fullName || !className || !campusId || !status) {
    return { error: "Vui lòng điền đầy đủ thông tin" };
  }

  const { error: pErr } = await supabaseAdmin
    .from("profiles")
    .update({ full_name: fullName, campus_id: campusId })
    .eq("id", id);
    
  if (pErr) return { error: "Lỗi cập nhật profile: " + pErr.message };

  const { error: sErr } = await supabaseAdmin
    .from("students")
    .update({ class_name: className, enrollment_status: status })
    .eq("id", id);

  if (sErr) return { error: "Lỗi cập nhật student: " + sErr.message };

  return { success: true };
}
