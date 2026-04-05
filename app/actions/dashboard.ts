import { createClient } from "@/lib/supabase/server";

export async function getAdminDashboardData() {
  const supabase = await createClient();

  // Đếm học viên
  const { count: studentCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "student");

  // Đếm Redemptions Pending
  const { count: pendingCount } = await supabase
    .from("redemptions")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  // Đếm tổng lượng quà đã đổi (Fulfilled) - Ví dụ cho "Doanh thu"
  const { count: fulfilledCount } = await supabase
    .from("redemptions")
    .select("*", { count: "exact", head: true })
    .eq("status", "fulfilled");

  // Lấy cảnh báo Low Stock <= 5
  const { data: lowStock } = await supabase
    .from("inventory")
    .select(`
      id, 
      stock_quantity, 
      reward:reward_catalog(reward_name),
      campus:campuses(campus_name)
    `)
    .lte("stock_quantity", 5)
    .order("stock_quantity", { ascending: true })
    .limit(5);

  return {
    studentCount: studentCount || 0,
    pendingCount: pendingCount || 0,
    fulfilledCount: fulfilledCount || 0,
    lowStock: lowStock || [],
  };
}

export async function getStudentDashboardData(userId: string) {
  const supabase = await createClient();

  // Lấy Profile và Student
  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      full_name,
      students!profiles_id_fkey(total_points, class_name)
    `)
    .eq("id", userId)
    .single();

  // Lọc 5 giao dịch gần nhất
  const { data: recentTransactions } = await supabase
    .from("point_transactions")
    .select("id, points_delta, source_type, created_at, note")
    .eq("student_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    profile: profile || null,
    recentTransactions: recentTransactions || [],
  };
}
