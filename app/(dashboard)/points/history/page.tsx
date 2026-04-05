import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PointRule, PointTransaction, UserRole } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Lịch sử điểm — RewardSystem",
  description: "Theo dõi lịch sử cộng và trừ điểm trong hệ thống RewardSystem.",
};

const sourceBadge: Record<string, { label: string; className: string }> = {
  rule: { label: "Rule", className: "badge-indigo" },
  manual: { label: "Manual", className: "badge-amber" },
  redemption: { label: "Redemption", className: "badge-gray" },
};

function getHistoryErrorMessage(message: string): string {
  if (message.includes("Could not find the table 'public.point_transactions'")) {
    return "Thiếu migration Round 3 cho bảng point_transactions. Hãy apply file supabase/migrations/004_point_transactions_round3.sql lên Supabase rồi tải lại trang.";
  }

  return message;
}

function formatDateTime(input: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(input));
}

export default async function PointHistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role ?? "student") as UserRole;

  const transactionQuery = supabase
    .from("point_transactions")
    .select(
      "id, student_id, rule_id, points_delta, source_type, event_key, note, created_by, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: transactions, error: transactionError } =
    role === "student"
      ? await transactionQuery.eq("student_id", user.id)
      : await transactionQuery;

  const { data: rules } = await supabase
    .from("point_rules")
    .select("id, title, rule_code, points_awarded");

  const ruleMap = new Map<string, PointRule>();
  (rules ?? []).forEach((rule) => {
    ruleMap.set(rule.id, rule as PointRule);
  });

  const txList = (transactions ?? []) as PointTransaction[];

  const profileIds = Array.from(
    new Set(txList.flatMap((tx) => [tx.student_id, tx.created_by]))
  );

  const profileMap = new Map<string, { full_name: string | null }>();

  if (profileIds.length > 0) {
    const { data: profileRows } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", profileIds);

    (profileRows ?? []).forEach((item) => {
      profileMap.set(item.id, { full_name: item.full_name });
    });
  }

  const studentIds = Array.from(new Set(txList.map((tx) => tx.student_id)));
  const studentMap = new Map<string, { student_code: string | null; class_name: string }>();

  if (studentIds.length > 0) {
    const { data: students } = await supabase
      .from("students")
      .select("id, student_code, class_name")
      .in("id", studentIds);

    (students ?? []).forEach((item) => {
      studentMap.set(item.id, {
        student_code: item.student_code,
        class_name: item.class_name,
      });
    });
  }

  return (
    <section className="max-w-6xl mx-auto space-y-6">
      <header className="card">
        <h1 className="text-2xl font-bold text-slate-900">Lịch sử giao dịch điểm</h1>
        <p className="text-sm text-slate-500 mt-1">
          {role === "student"
            ? "Bạn đang xem các giao dịch điểm của chính mình."
            : "Theo dõi các giao dịch cộng/trừ điểm mới nhất trong hệ thống."}
        </p>
      </header>

      {transactionError && (
        <div className="card border border-red-200 bg-red-50 text-red-800 text-sm">
          Không thể tải lịch sử điểm: {getHistoryErrorMessage(transactionError.message)}
        </div>
      )}

      {!transactionError && txList.length === 0 && (
        <div className="card text-sm text-slate-500">Chưa có giao dịch điểm nào.</div>
      )}

      {!transactionError && txList.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="text-left py-3 pr-4">Thời gian</th>
                  <th className="text-left py-3 pr-4">Học viên</th>
                  <th className="text-left py-3 pr-4">Rule</th>
                  <th className="text-left py-3 pr-4">Nguồn</th>
                  <th className="text-left py-3 pr-4">Điểm</th>
                  <th className="text-left py-3 pr-4">Ghi chú</th>
                  <th className="text-left py-3">Event key</th>
                </tr>
              </thead>
              <tbody>
                {txList.map((tx) => {
                  const rule = tx.rule_id ? ruleMap.get(tx.rule_id) : null;
                  const source = sourceBadge[tx.source_type] ?? {
                    label: tx.source_type,
                    className: "badge-gray",
                  };

                  const studentMeta = studentMap.get(tx.student_id);
                  const studentName =
                    role === "student"
                      ? "Bạn"
                      : profileMap.get(tx.student_id)?.full_name ??
                        studentMeta?.student_code ??
                        tx.student_id.slice(0, 8);

                  const deltaClass =
                    tx.points_delta > 0 ? "text-green-600" : "text-red-600";
                  const deltaPrefix = tx.points_delta > 0 ? "+" : "";

                  return (
                    <tr key={tx.id} className="border-b border-slate-50 align-top">
                      <td className="py-3 pr-4 text-slate-600 whitespace-nowrap">
                        {formatDateTime(tx.created_at)}
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-800">{studentName}</p>
                        {studentMeta?.class_name && role !== "student" && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {studentMeta.class_name}
                          </p>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {rule ? (
                          <div>
                            <p className="font-medium text-slate-800">{rule.title}</p>
                            <p className="text-xs text-slate-500">{rule.rule_code}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`badge ${source.className}`}>{source.label}</span>
                      </td>
                      <td className={`py-3 pr-4 font-semibold tabular-nums ${deltaClass}`}>
                        {deltaPrefix}
                        {tx.points_delta}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {tx.note ? tx.note : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="py-3 text-xs text-slate-500 font-mono">{tx.event_key}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
