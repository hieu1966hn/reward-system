import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/lib/types";
import { awardPointsManualAction } from "@/app/actions/points";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Cộng điểm thủ công — RewardSystem",
  description:
    "Cộng điểm thủ công cho học viên theo rule đã cấu hình trong RewardSystem.",
};

type AddPageSearchParams = {
  ok?: string | string[];
  error?: string | string[];
  tx?: string | string[];
};

interface AddPointsPageProps {
  searchParams?: Promise<AddPageSearchParams>;
}

function getQueryValue(value?: string | string[]): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function AddPointsPage({ searchParams }: AddPointsPageProps) {
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

  if (!(["teacher", "admin"] as UserRole[]).includes(role)) {
    redirect("/points/history");
  }

  const { data: students, error: studentError } = await supabase
    .from("students")
    .select("id, student_code, class_name, total_points, enrollment_status")
    .order("created_at", { ascending: false });

  const { data: rules, error: ruleError } = await supabase
    .from("point_rules")
    .select("id, title, rule_code, category, points_awarded")
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("points_awarded", { ascending: false });

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const messageOk = getQueryValue(resolvedSearchParams?.ok);
  const messageError = getQueryValue(resolvedSearchParams?.error);
  const txId = getQueryValue(resolvedSearchParams?.tx);

  return (
    <section className="max-w-3xl mx-auto space-y-6">
      <header className="card">
        <h1 className="text-2xl font-bold text-slate-900">Cộng điểm thủ công</h1>
        <p className="text-sm text-slate-500 mt-1">
          Chọn học viên, chọn rule và nhập ghi chú để ghi nhận giao dịch điểm.
        </p>
      </header>

      {messageOk && (
        <div id="add-points-success" className="card border border-green-200 bg-green-50 text-green-800 text-sm">
          <p className="font-medium">{messageOk}</p>
          {txId && <p className="mt-1 text-xs break-all">Transaction ID: {txId}</p>}
        </div>
      )}

      {messageError && (
        <div id="add-points-error" className="card border border-red-200 bg-red-50 text-red-800 text-sm">
          {messageError}
        </div>
      )}

      {(studentError || ruleError) && (
        <div className="card border border-amber-200 bg-amber-50 text-amber-900 text-sm space-y-1">
          {studentError && <p>Không tải được danh sách học viên: {studentError.message}</p>}
          {ruleError && <p>Không tải được danh sách rule: {ruleError.message}</p>}
        </div>
      )}

      <div className="card space-y-5">
        <form action={awardPointsManualAction} className="space-y-4" id="manual-points-form">
          <div>
            <label htmlFor="student_id" className="label">
              Học viên
            </label>
            <select id="student_id" name="student_id" className="input" required>
              <option value="">-- Chọn học viên --</option>
              {(students ?? []).map((student) => {
                const code = student.student_code ?? student.id.slice(0, 8);
                const className = student.class_name || "Chưa có lớp";
                const status = student.enrollment_status === "active" ? "Đang học" : "Ngưng";

                return (
                  <option key={student.id} value={student.id}>
                    {code} · {className} · {student.total_points}đ · {status}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label htmlFor="rule_id" className="label">
              Rule cộng điểm
            </label>
            <select id="rule_id" name="rule_id" className="input" required>
              <option value="">-- Chọn rule --</option>
              {(rules ?? []).map((rule) => (
                <option key={rule.id} value={rule.id}>
                  {rule.rule_code} · {rule.title} (+{rule.points_awarded}đ)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="note" className="label">
              Ghi chú
            </label>
            <textarea
              id="note"
              name="note"
              className="input min-h-24"
              placeholder="Ví dụ: Thưởng thêm vì hỗ trợ bạn cùng lớp hoàn thành demo"
              required
            />
          </div>

          <div>
            <label htmlFor="event_key" className="label">
              Event key (tuỳ chọn)
            </label>
            <input
              id="event_key"
              name="event_key"
              className="input"
              placeholder="Để trống để hệ thống tự tạo"
            />
            <p className="text-xs text-slate-500 mt-1">
              Dùng event key cố định để test chống trùng giao dịch (idempotency).
            </p>
          </div>

          <button id="submit-manual-points" type="submit" className="btn-primary">
            Cộng điểm
          </button>
        </form>
      </div>
    </section>
  );
}
