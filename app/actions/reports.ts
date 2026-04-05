import { createClient } from "@/lib/supabase/server";

export async function getRedemptionHistory(statusFilter?: string, campusFilter?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("redemptions")
    .select(`
      *,
      reward:reward_catalog(*),
      student:profiles!redemptions_student_id_fkey(
        id,
        full_name,
        campus_id,
        campus:campuses(campus_name),
        students(student_code, class_name)
      )
    `)
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  // Not doing strict campus filter at the DB level easily because campus is nested in profiles.
  // Instead we fetch all (or pagination limiting) and filter JS side if it's small, 
  // OR we can do an inner join. For now, since it's a dev DB, we'll fetch then filter IF campus is needed.
  
  const { data, error } = await query;

  if (error) {
    console.error("Error fetching history:", error);
    return [];
  }

  let result = data;
  
  if (campusFilter && campusFilter !== "all") {
    result = result.filter(r => r.student?.campus_id === campusFilter);
  }

  return result || [];
}

export async function getCampusesForFilter() {
  const supabase = await createClient();
  const { data } = await supabase.from("campuses").select("id, campus_name").order("campus_name");
  return data || [];
}

export async function getReportStats() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("redemptions")
    .select(`
      *,
      reward:reward_catalog(reward_name),
      student:profiles!redemptions_student_id_fkey(
        campus_id,
        campus:campuses(campus_name)
      )
    `);

  if (error || !data) {
    return { summary: null, topRewards: [], topCampuses: [] };
  }

  const summary = {
    total: data.length,
    pending: data.filter((d) => d.status === "pending").length,
    approved: data.filter((d) => d.status === "approved").length,
    fulfilled: data.filter((d) => d.status === "fulfilled").length,
    rejected: data.filter((d) => d.status === "rejected").length,
    cancelled: data.filter((d) => d.status === "cancelled").length,
  };

  const rewardCounts: Record<string, { name: string; count: number }> = {};
  const campusCounts: Record<string, { name: string; count: number }> = {};

  data.forEach((r) => {
    // Reward aggregate
    const rewardName = r.reward?.reward_name || "Unknown Reward";
    if (!rewardCounts[rewardName]) {
      rewardCounts[rewardName] = { name: rewardName, count: 0 };
    }
    rewardCounts[rewardName].count++;

    // Campus aggregate
    const campusName = Array.isArray(r.student?.campus) 
      ? r.student.campus[0]?.campus_name 
      : r.student?.campus?.campus_name || "Unknown Campus";
      
    if (!campusCounts[campusName]) {
      campusCounts[campusName] = { name: campusName, count: 0 };
    }
    campusCounts[campusName].count++;
  });

  const topRewards = Object.values(rewardCounts).sort((a, b) => b.count - a.count).slice(0, 5);
  const topCampuses = Object.values(campusCounts).sort((a, b) => b.count - a.count);

  return { summary, topRewards, topCampuses };
}
