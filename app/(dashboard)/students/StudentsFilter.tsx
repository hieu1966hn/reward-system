"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useState } from "react";

export default function StudentsFilter({
  campuses,
  searchParams
}: {
  campuses: { id: string; campus_name: string }[];
  searchParams: { search?: string; campus?: string; status?: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.search || "");

  const createQueryString = useCallback(
    (name: string, value: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params = new URLSearchParams(searchParams as any);
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(pathname + "?" + createQueryString("search", searchTerm));
  };

  const handleSelectChange = (name: string, value: string) => {
    router.push(pathname + "?" + createQueryString(name, value));
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
      <form onSubmit={handleSearch} className="flex-1">
        <label htmlFor="search" className="sr-only">Tìm kiếm học viên</label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            name="search"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-xl border-0 py-2.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-violet-600 sm:text-sm sm:leading-6"
            placeholder="Tìm theo tên, email, mã học viên... (Enter để tìm)"
          />
        </div>
      </form>

      <div className="flex gap-4">
        <select
          value={searchParams.campus || ""}
          onChange={(e) => handleSelectChange("campus", e.target.value)}
          className="block w-full sm:w-48 rounded-xl border-0 py-2.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-violet-600 sm:text-sm sm:leading-6"
        >
          <option value="">Tất cả cơ sở</option>
          {campuses.map((c) => (
            <option key={c.id} value={c.id}>{c.campus_name}</option>
          ))}
        </select>

        <select
          value={searchParams.status || ""}
          onChange={(e) => handleSelectChange("status", e.target.value)}
          className="block w-full sm:w-40 rounded-xl border-0 py-2.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-violet-600 sm:text-sm sm:leading-6"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang học</option>
          <option value="inactive">Đã nghỉ (Inactive)</option>
        </select>
      </div>
    </div>
  );
}
