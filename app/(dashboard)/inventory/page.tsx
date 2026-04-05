import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type InventoryRow = {
  id: string;
  stock_quantity: number;
  reward: {
    reward_name: string;
    points_required: number;
  } | null;
  campus: {
    campus_name: string;
  } | null;
};

export default async function InventoryPage() {
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

  // Fetch inventory joined with reward and campus
  const { data: inventories, error } = await supabase
    .from("inventory")
    .select(`
      id,
      stock_quantity,
      reward:reward_id ( reward_name, points_required ),
      campus:campus_id ( campus_name )
    `)
    .order("stock_quantity", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Quản lý kho quà (Inventory)</h1>
        <p className="text-sm text-slate-500">Giám sát số lượng phần thưởng còn lại tại các cơ sở.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-50 border-b border-red-100">
            Không thể tải dữ liệu kho quà: {error.message}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm string text-slate-500">
                <th className="font-medium p-4">Phần thưởng</th>
                <th className="font-medium p-4">Cơ sở</th>
                <th className="font-medium p-4">Giá (Điểm)</th>
                <th className="font-medium p-4 text-center">Tồn kho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {!error && inventories?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-slate-500">
                    Chưa có dữ liệu kho
                  </td>
                </tr>
              ) : (
                (inventories as InventoryRow[] | null)?.map((inv) => {
                  const isLowStock = inv.stock_quantity > 0 && inv.stock_quantity <= 5;
                  const isOutOfStock = inv.stock_quantity === 0;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-medium text-slate-800">{inv.reward?.reward_name ?? "N/A"}</td>
                      <td className="p-4 text-slate-600">{inv.campus?.campus_name ?? "N/A"}</td>
                      <td className="p-4 font-medium text-amber-500">{inv.reward?.points_required ?? "N/A"}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[3rem] px-2.5 py-1 rounded-full font-bold text-xs ${
                          isOutOfStock 
                            ? "bg-red-100 text-red-700" 
                            : isLowStock 
                              ? "bg-amber-100 text-amber-700" 
                              : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {inv.stock_quantity}
                        </span>
                        {isLowStock && <p className="text-[10px] text-amber-600 mt-1">Sắp hết</p>}
                        {isOutOfStock && <p className="text-[10px] text-red-600 mt-1">Hết hàng</p>}
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
