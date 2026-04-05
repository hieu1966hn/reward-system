"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function HistoryFilter({ campuses }: { campuses: { id: string; campus_name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") || "all";
  const currentCampus = searchParams.get("campus") || "all";

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex flex-col gap-1 w-full sm:w-48">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</label>
        <select
          value={currentStatus}
          onChange={(e) => updateFilters("status", e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="fulfilled">Đã giao quà</option>
          <option value="rejected">Từ chối</option>
          <option value="cancelled">Đã huỷ</option>
        </select>
      </div>

      <div className="flex flex-col gap-1 w-full sm:w-48">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cơ sở</label>
        <select
          value={currentCampus}
          onChange={(e) => updateFilters("campus", e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
        >
          <option value="all">Tất cả cơ sở</option>
          {campuses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.campus_name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
