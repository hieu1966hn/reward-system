import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Danh sách rule điểm — RewardSystem",
  description: "Xem danh sách rule cộng điểm đang áp dụng trong RewardSystem.",
};

const categoryLabel: Record<string, string> = {
  attendance: "Chuyên cần",
  checkpoint: "Checkpoint",
  homework: "Bài tập về nhà",
  demo: "Demo / Triển lãm",
  extracurricular: "Ngoại khóa",
};

const categoryBadgeClass: Record<string, string> = {
  attendance: "badge-indigo",
  checkpoint: "badge-green",
  homework: "badge-amber",
  demo: "badge-red",
  extracurricular: "badge-gray",
};

export default async function PointRulesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: rules, error } = await supabase
    .from("point_rules")
    .select("id, rule_code, title, category, condition_summary, points_awarded, is_active")
    .order("category", { ascending: true })
    .order("points_awarded", { ascending: false });

  const grouped = (rules ?? []).reduce<Record<string, typeof rules>>((acc, rule) => {
    const key = rule.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(rule);
    return acc;
  }, {});

  const categories = Object.keys(grouped);

  return (
    <section className="max-w-5xl mx-auto space-y-6">
      <header className="card">
        <h1 className="text-2xl font-bold text-slate-900">Danh sách rule điểm</h1>
        <p className="text-sm text-slate-500 mt-1">
          Các rule hiện được cấu hình read-only trong hệ thống. Tổng cộng: {rules?.length ?? 0} rule.
        </p>
      </header>

      {error && (
        <div className="card border border-red-200 bg-red-50 text-red-800 text-sm">
          Không thể tải danh sách rule: {error.message}
        </div>
      )}

      {!error && categories.length === 0 && (
        <div className="card text-sm text-slate-500">Chưa có rule nào trong hệ thống.</div>
      )}

      {!error &&
        categories.map((category) => {
          const rulesInCategory = grouped[category] ?? [];
          const label = categoryLabel[category] ?? category;
          const badgeClass = categoryBadgeClass[category] ?? "badge-gray";

          return (
            <article key={category} className="card space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-800">{label}</h2>
                <span className={`badge ${badgeClass}`}>{rulesInCategory.length} rules</span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wide">
                      <th className="text-left py-3 pr-4">Rule code</th>
                      <th className="text-left py-3 pr-4">Tiêu đề</th>
                      <th className="text-left py-3 pr-4">Điều kiện</th>
                      <th className="text-left py-3 pr-4">Điểm</th>
                      <th className="text-left py-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rulesInCategory.map((rule) => (
                      <tr key={rule.id} className="border-b border-slate-50 align-top">
                        <td className="py-3 pr-4 font-mono text-xs text-slate-600">{rule.rule_code}</td>
                        <td className="py-3 pr-4 font-medium text-slate-800">{rule.title}</td>
                        <td className="py-3 pr-4 text-slate-600">{rule.condition_summary}</td>
                        <td className="py-3 pr-4 font-semibold text-indigo-700">+{rule.points_awarded}</td>
                        <td className="py-3">
                          <span className={rule.is_active ? "badge badge-green" : "badge badge-gray"}>
                            {rule.is_active ? "Đang áp dụng" : "Tạm dừng"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          );
        })}
    </section>
  );
}
