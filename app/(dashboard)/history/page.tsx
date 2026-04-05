import { getRedemptionHistory, getCampusesForFilter } from "@/app/actions/reports";
import HistoryFilter from "./HistoryFilter";

const STATUS_MAP = {
  pending: { text: "Chờ duyệt", color: "bg-amber-100 text-amber-700" },
  approved: { text: "Đã duyệt", color: "bg-emerald-100 text-emerald-700" },
  fulfilled: { text: "Đã giao quà", color: "bg-blue-100 text-blue-700" },
  rejected: { text: "Từ chối", color: "bg-rose-100 text-rose-700" },
  cancelled: { text: "Đã huỷ", color: "bg-slate-100 text-slate-600" },
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; campus?: string }>;
}) {
  const resolvedParams = await searchParams;
  const status = resolvedParams.status || "all";
  const campus = resolvedParams.campus || "all";

  const history = await getRedemptionHistory(status, campus);
  const campuses = await getCampusesForFilter();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lịch sử đổi quà</h1>
        <p className="text-slate-500 text-sm mt-1">Lịch sử giao dịch toàn hệ thống</p>
      </div>

      <HistoryFilter campuses={campuses} />

      <div className="bg-white border text-sm border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-16rem)]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">ID / Ngày</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Học viên</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Món quà</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right">Điểm</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Cơ sở</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Không tìm thấy dữ liệu nào.
                  </td>
                </tr>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                history.map((record: any) => {
                  const s = STATUS_MAP[record.status as keyof typeof STATUS_MAP] || { text: record.status, color: "bg-slate-100 text-slate-600" };
                  const studentData = Array.isArray(record.student?.students) ? record.student?.students[0] : record.student?.students;
                  const stCode = studentData?.student_code || "N/A";
                  const stClass = studentData?.class_name || "N/A";
                  const cName = Array.isArray(record.student?.campus) ? record.student?.campus[0]?.campus_name : record.student?.campus?.campus_name || "N/A";

                  const dateStr = new Intl.DateTimeFormat('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(record.created_at));

                  return (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 truncate w-24" title={record.id}>
                          {record.id.substring(0, 8)}...
                        </div>
                        <div className="text-xs text-slate-400">
                          {dateStr}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{record.student?.full_name || "Vô danh"}</div>
                        <div className="text-xs text-slate-500">{stCode} - {stClass}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{record.reward?.reward_name || "N/A"}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-slate-700">{record.points_cost}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {cName}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-lg ${s.color}`}>
                          {s.text}
                        </span>
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
