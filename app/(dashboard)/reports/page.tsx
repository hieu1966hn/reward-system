import { getReportStats } from "@/app/actions/reports";

function StatCard({ title, value, className = "" }: { title: string; value: number | string; className?: string }) {
  return (
    <div className={`p-5 bg-white border border-slate-200 rounded-2xl shadow-sm ${className}`}>
      <div className="text-sm font-medium text-slate-500 mb-1">{title}</div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

export default async function ReportsPage() {
  const { summary, topRewards, topCampuses } = await getReportStats();

  if (!summary) {
    return <div className="p-8 text-center text-rose-500">Lỗi khi tải dữ liệu báo cáo.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Báo cáo & Thống kê</h1>
        <p className="text-slate-500 text-sm mt-1">Tổng quan các chỉ số đổi quà tự động</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Tổng yêu cầu" value={summary.total} className="col-span-2 lg:col-span-1 border-rose-100 bg-rose-50/50" />
        <StatCard title="Đang chờ" value={summary.pending} />
        <StatCard title="Đã duyệt" value={summary.approved} />
        <StatCard title="Đã giao" value={summary.fulfilled} />
        <StatCard title="Từ chối" value={summary.rejected} />
        <StatCard title="Đã huỷ" value={summary.cancelled} />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Top Campuses */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-800">Thống kê theo Cơ sở</h3>
          </div>
          <ul className="divide-y divide-slate-100 px-5">
            {topCampuses.length === 0 ? (
              <li className="py-4 text-center text-slate-500 text-sm">Chưa có dữ liệu</li>
            ) : (
              topCampuses.map((c, i) => (
                <li key={i} className="flex justify-between items-center py-3">
                  <span className="font-medium text-slate-700">{c.name}</span>
                  <span className="text-sm font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">{c.count} yêu cầu</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Top Rewards */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-800">Top Quà tặng phổ biến</h3>
          </div>
          <ul className="divide-y divide-slate-100 px-5">
            {topRewards.length === 0 ? (
              <li className="py-4 text-center text-slate-500 text-sm">Chưa có dữ liệu</li>
            ) : (
              topRewards.map((r, i) => (
                <li key={i} className="flex justify-between items-center py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    <span className="font-medium text-slate-700">{r.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">{r.count} yêu cầu</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
      
      <div className="text-center text-xs text-slate-400 mt-8 pt-8 border-t border-slate-100">
        Reports layer provided by MindX Reward System (Read-only operations view).
      </div>
    </div>
  );
}
