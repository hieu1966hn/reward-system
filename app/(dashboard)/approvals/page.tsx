import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ApprovalActions } from "./ApprovalActions";

export const dynamic = "force-dynamic";

type ApprovalRow = {
  id: string;
  student_id: string;
  points_cost: number;
  status: string;
  created_at: string;
  reward: {
    reward_name: string;
  } | null;
};

type RawApprovalRow = {
  id: string;
  student_id: string;
  points_cost: number;
  status: string;
  created_at: string;
  reward: { reward_name: string }[] | null;
};

export default async function ApprovalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role;
  
  if (role !== "admin" && role !== "teacher") {
    redirect("/dashboard");
  }

  // Tạm fetch tất cả cho MVP. Thực tế có thể thêm `eq('campus_id', admin_campus)`
  const { data: requests, error } = await supabase
    .from("redemptions")
    .select(`
      id,
      student_id,
      points_cost,
      status,
      created_at,
      reward:reward_id(reward_name)
    `)
    .order("created_at", { ascending: false });

  const approvalRows: ApprovalRow[] = ((requests ?? []) as RawApprovalRow[]).map((item) => ({
    id: item.id,
    student_id: item.student_id,
    points_cost: item.points_cost,
    status: item.status,
    created_at: item.created_at,
    reward: item.reward?.[0]
      ? {
          reward_name: item.reward[0].reward_name,
        }
      : null,
  }));

  const studentIds = Array.from(
    new Set(approvalRows.map((item) => item.student_id))
  );

  const studentMetaMap = new Map<string, { student_code: string | null; class_name: string }>();
  const profileMap = new Map<
    string,
    { full_name: string | null; campus_id: string | null }
  >();
  const campusMap = new Map<string, string>();

  if (studentIds.length > 0) {
    const { data: students } = await supabase
      .from("students")
      .select("id, student_code, class_name")
      .in("id", studentIds);

    (students ?? []).forEach((item) => {
      studentMetaMap.set(item.id, {
        student_code: item.student_code,
        class_name: item.class_name,
      });
    });

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, campus_id")
      .in("id", studentIds);

    (profiles ?? []).forEach((item) => {
      profileMap.set(item.id, {
        full_name: item.full_name,
        campus_id: item.campus_id,
      });
    });
  }

  const campusIds = Array.from(
    new Set(
      studentIds
        .map((studentId) => profileMap.get(studentId)?.campus_id)
        .filter((campusId): campusId is string => Boolean(campusId))
    )
  );

  if (campusIds.length > 0) {
    const { data: campuses } = await supabase
      .from("campuses")
      .select("id, campus_name")
      .in("id", campusIds);

    (campuses ?? []).forEach((item) => {
      campusMap.set(item.id, item.campus_name);
    });
  }

  // Helper for Status UI (giống My Redemptions)
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-semibold">Chờ duyệt</span>;
      case "approved":
        return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-semibold">Đã duyệt</span>;
      case "fulfilled":
        return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">Đã giao quà</span>;
      case "rejected":
        return <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded-full text-xs font-semibold">Từ chối</span>;
      case "cancelled":
        return <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-semibold">Đã huỷ</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Duyệt Yêu cầu Đổi Quà</h1>
        <p className="text-sm text-slate-500">Giám sát và phê duyệt các giao dịch trừ điểm/trừ kho của học viên.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-50 border-b border-red-100">
            Không thể tải danh sách duyệt đổi quà: {error.message}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                <th className="p-4">Ngày tạo</th>
                <th className="p-4">Học viên</th>
                <th className="p-4">Cơ sở</th>
                <th className="p-4">Phần thưởng</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {!error && approvalRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500">
                    Chưa có yêu cầu nào
                  </td>
                </tr>
              ) : (
                approvalRows.map((req) => {
                  const studentMeta = studentMetaMap.get(req.student_id);
                  const studentProfile = profileMap.get(req.student_id);
                  const campusName = studentProfile?.campus_id
                    ? campusMap.get(studentProfile.campus_id) ?? "N/A"
                    : "N/A";
                  const studentName =
                    studentProfile?.full_name ??
                    studentMeta?.student_code ??
                    req.student_id.slice(0, 8);

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-slate-500">
                        {new Date(req.created_at).toLocaleDateString("vi-VN")} <br/>
                        <span className="text-xs">{new Date(req.created_at).toLocaleTimeString("vi-VN")}</span>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-800">{studentName}</div>
                        <div className="text-xs text-slate-500">
                          {studentMeta?.class_name || "Chưa có lớp"}
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">{campusName}</td>
                      <td className="p-4">
                        <div className="font-medium text-slate-800">{req.reward?.reward_name}</div>
                        <div className="text-xs text-amber-500 font-semibold">{req.points_cost} điểm</div>
                      </td>
                      <td className="p-4 text-center">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="p-4 text-right">
                        <ApprovalActions 
                          redemptionId={req.id} 
                          campusId={studentProfile?.campus_id ?? null} 
                          status={req.status} 
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
