import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

// 1. Tranzakció hozzáadása vagy frissítése
async function saveTransactionAction(formData: FormData) {
  "use server";

  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const id = formData.get("id") ? String(formData.get("id")) : null;
  const amount = Number(formData.get("amount"));
  const type = String(formData.get("type"));
  const category = String(formData.get("category"));
  const date = String(formData.get("date"));
  const notesText = String(formData.get("notes") || "");
  const litter_id = formData.get("litter_id") === "none" ? null : String(formData.get("litter_id"));

  const payload = {
    user_id: user?.id || null,
    amount,
    type,
    category,
    date,
    description: notesText,
    litter_id,
  };

  if (id) {
    const { error } = await supabase.from("payments").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("payments").insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/finance");
}

// 2. Tranzakció törlése Action
async function deleteTransactionAction(formData: FormData) {
  "use server";

  const supabase = createServerSupabase();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/finance");
}

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  try {
    const supabase = createServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const resolvedParams = await searchParams;
    const editId = resolvedParams.edit || null;

    // 1. Összes tranzakció lekérése
    const { data: paymentsData, error: paymentsError } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (paymentsError) throw new Error(`Payments hiba: ${paymentsError.message}`);

    const payments = paymentsData || [];
    const editingTransaction = editId ? payments.find((p) => p.id === editId) : null;

    // 2. Alom lekérés
    const { data: littersData, error: littersError } = await supabase
      .from("litters")
      .select("id, letter") 
      .eq("user_id", user.id);

    if (littersError) throw new Error(`Litters hiba: ${littersError.message}`);

    const litters = littersData || [];

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("hu-HU", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
    };

    // Globális Összesítők
    const income = payments.filter((p) => p.type === "income").reduce((sum, p) => sum + Number(p.amount), 0);
    const expense = payments.filter((p) => p.type === "expense").reduce((sum, p) => sum + Number(p.amount), 0);
    const net = income - expense;

    // Kiadások kategóriánkénti eloszlása
    const expenseCategories: { [key: string]: number } = {};
    payments.filter((p) => p.type === "expense").forEach((p) => {
      const cat = p.category || "Egyéb";
      expenseCategories[cat] = (expenseCategories[cat] || 0) + Number(p.amount);
    });

    // Alomszintű megtérülés (Litter ROI)
    const litterStats = litters.map((l) => {
      const lIncome = payments.filter((p) => p.litter_id === l.id && p.type === "income").reduce((sum, p) => sum + Number(p.amount), 0);
      const lExpense = payments.filter((p) => p.litter_id === l.id && p.type === "expense").reduce((sum, p) => sum + Number(p.amount), 0);
      return {
        id: l.id,
        letter: l.letter,
        income: lIncome,
        expense: lExpense,
        profit: lIncome - lExpense,
      };
    });

    return (
      <div className="space-y-10 text-white text-xs">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white font-sans">Finance & Analytics</h1>
            <p className="text-zinc-500 text-xs mt-1">A kennel bevételeinek, kiadásainak módosítása, törlése és elemzése.</p>
          </div>
          {editId && (
            <a href="/finance" className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg font-bold text-zinc-200 transition-colors">
              ❌ Szerkesztési mód bezárása
            </a>
          )}
        </div>

        {/* METRIKÁK KÁRTYÁK */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-5 space-y-1">
            <div className="text-emerald-500 font-medium uppercase tracking-wider text-[10px]">Total Income</div>
            <div className="text-2xl font-black font-mono text-white">{formatCurrency(income)}</div>
          </div>

          <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-5 space-y-1">
            <div className="text-red-500 font-medium uppercase tracking-wider text-[10px]">Total Expense</div>
            <div className="text-2xl font-black font-mono text-white">{formatCurrency(expense)}</div>
          </div>

          <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-5 space-y-1">
            <div className="text-blue-500 font-medium uppercase tracking-wider text-[10px]">Net Profit</div>
            <div className="text-2xl font-black font-mono text-white">{formatCurrency(net)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            
            {/* KIADÁSI KATEGÓRIÁK VIZUÁLIS ELOSZLÁSA */}
            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-zinc-300">📊 Kiadások kategóriák szerint elosztva</h3>
              <div className="space-y-3">
                {Object.entries(expenseCategories).map(([cat, amt]) => {
                  const percentage = expense > 0 ? (amt / expense) * 100 : 0;
                  return (
                    <div key={cat} className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-400 font-medium">{cat}</span>
                        <span className="text-zinc-300 font-mono font-bold">{formatCurrency(amt)} <span className="text-zinc-500 font-normal">({percentage.toFixed(0)}%)</span></span>
                      </div>
                      <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800/40">
                        <div className="bg-red-500 h-full transition-all" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
                {Object.keys(expenseCategories).length === 0 && (
                  <p className="text-zinc-600 italic">Nincs még rögzített kiadás a statisztikához.</p>
                )}
              </div>
            </div>

            {/* ALOMSZINTŰ MEGTÉRÜLÉS (LITTER ROI) */}
            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-zinc-300">🐶 Alomszintű Megtérülés (Litter ROI)</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-4 text-zinc-500 font-bold uppercase tracking-wider text-[10px] border-b border-zinc-900 pb-2">
                  <span>Alom</span>
                  <span className="text-right">Bevétel</span>
                  <span className="text-right">Kiadás</span>
                  <span className="text-right">Tiszta Haszon</span>
                </div>
                {litterStats.map((l) => (
                  <div key={l.id} className="grid grid-cols-4 items-center py-2.5 border-b border-zinc-900/60 font-mono">
                    <span className="font-sans font-bold text-amber-400">"{l.letter}" alom</span>
                    <span className="text-right text-zinc-300">{formatCurrency(l.income)}</span>
                    <span className="text-right text-zinc-500">{formatCurrency(l.expense)}</span>
                    <span className={`text-right font-bold ${l.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {formatCurrency(l.profit)}
                    </span>
                  </div>
                ))}
                {litterStats.length === 0 && (
                  <p className="text-zinc-600 italic py-2">Nincsenek még rögzített almok.</p>
                )}
              </div>
            </div>

            {/* UTOLSÓ TRANZAKCIÓK LISTÁJA */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">📜 Legutóbbi Tranzakciók</h3>
              <div className="space-y-2">
                {payments.map((p) => {
                  const associatedLitter = litters.find((l) => l.id === p.litter_id);
                  return (
                    <div 
                      key={p.id} 
                      className={`rounded-xl border p-4 flex justify-between items-center transition-all ${
                        editId === p.id ? "border-amber-500 bg-amber-950/10" : "border-zinc-800 bg-zinc-950"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-zinc-200 text-sm flex items-center gap-2">
                          {p.category}
                          {p.litter_id && associatedLitter && (
                            <span className="text-[10px] bg-amber-950/40 text-amber-400 border border-amber-900/50 px-1.5 py-0.5 rounded font-sans">
                              "{associatedLitter.letter}" alom
                            </span>
                          )}
                        </div>
                        <div className="text-zinc-500 font-mono text-[11px]">
                          {p.type === "income" ? "🟢 Bevétel" : "🔴 Kiadás"} • {p.date}
                        </div>
                        {p.description && <p className="text-zinc-400 italic text-[11px] font-sans">💬 {p.description}</p>}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className={`text-sm font-mono font-black ${p.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                          {p.type === "income" ? "+" : "-"} {formatCurrency(p.amount)}
                        </div>

                        <div className="flex items-center gap-1.5 border-l border-zinc-800 pl-3">
                          <a 
                            href={`/finance?edit=${p.id}`}
                            className="p-1.5 hover:bg-zinc-900 rounded text-zinc-400 hover:text-amber-400 transition-colors"
                            title="Szerkesztés"
                          >
                            ✏️
                          </a>
                          
                          <form action={deleteTransactionAction}>
                            <input type="hidden" name="id" value={p.id} />
                            <button 
                              type="submit" 
                              className="p-1.5 hover:bg-zinc-900 rounded text-zinc-400 hover:text-red-500 transition-colors"
                              title="Törlés"
                              onClick={(e) => {
                                if (!confirm("Biztosan törölni szeretnéd ezt a tranzakciót?")) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              🗑️
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {payments.length === 0 && <p className="text-zinc-600 italic">Nincsenek még könyvelt tranzakciók.</p>}
              </div>
            </div>

          </div>

          {/* DINAMIKUS ÚJ / SZERKESZTŐŰRLAP */}
          <div className={`border p-5 rounded-xl space-y-4 transition-all ${
            editingTransaction ? "border-amber-500 bg-amber-950/5" : "border-zinc-800 bg-zinc-950"
          }`}>
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-900 pb-2">
              {editingTransaction ? "✏️ Edit Transaction" : "Log Transaction"}
            </h3>
            <form action={saveTransactionAction} className="space-y-3.5">
              {editingTransaction && (
                <input type="hidden" name="id" value={editingTransaction.id} />
              )}

              <div>
                <label className="text-zinc-500 block mb-1">Összeg (EUR)</label>
                <input
                  name="amount"
                  type="number"
                  required
                  placeholder="Pl. 2500"
                  defaultValue={editingTransaction ? editingTransaction.amount : ""}
                  className="w-full rounded-lg bg-black border border-zinc-800 p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-500 block mb-1">Tranzakció Típusa</label>
                <select
                  name="type"
                  defaultValue={editingTransaction ? editingTransaction.type : "income"}
                  className="w-full rounded-lg bg-black border border-zinc-800 p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors font-bold"
                >
                  <option value="income">🟢 Income (Bevétel)</option>
                  <option value="expense">🔴 Expense (Kiadás)</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-500 block mb-1">Kategória</label>
                <select
                  name="category"
                  defaultValue={editingTransaction ? editingTransaction.category : "Puppy Sale"}
                  className="w-full rounded-lg bg-black border border-zinc-800 p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="Puppy Sale">Puppy Sale (Kölyök eladás)</option>
                  <option value="Stud Fee">Stud Fee (Fedeztetési díj)</option>
                  <option value="Medical & Vaccine">Medical & Vaccine (Orvosi & Oltás)</option>
                  <option value="Dog Food">Dog Food & Supps (Kutyatáp & Vitamin)</option>
                  <option value="Show Entry">Show Entry (Kiállítási nevezés)</option>
                  <option value="Equipment">Equipment (Felszerelés)</option>
                  <option value="Other">Other (Egyéb bejegyzés)</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-500 block mb-1">Hozzárendelés Alomhoz (Opcionális)</label>
                <select
                  name="litter_id"
                  defaultValue={editingTransaction?.litter_id ? editingTransaction.litter_id : "none"}
                  className="w-full rounded-lg bg-black border border-zinc-800 p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="none">-- Nem tartozik alomhoz --</option>
                  {litters.map((l) => (
                    <option key={l.id} value={l.id}>"{l.letter}" alom</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-500 block mb-1">Dátum</label>
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={editingTransaction ? editingTransaction.date : new Date().toISOString().split("T")[0]}
                  className="w-full rounded-lg bg-black border border-zinc-800 p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-500 block mb-1">Megjegyzés / Részletek</label>
                <textarea
                  name="notes"
                  placeholder="Pl. Oltási költségek az egész alomnak..."
                  defaultValue={editingTransaction ? editingTransaction.description : ""}
                  className="w-full rounded-lg bg-black border border-zinc-800 p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors h-16 resize-none"
                />
              </div>

              <button 
                type="submit" 
                className={`w-full rounded-lg py-2.5 font-bold text-black uppercase tracking-wider transition-colors ${
                  editingTransaction ? "bg-amber-500 hover:bg-amber-400" : "bg-emerald-500 hover:bg-emerald-400"
                }`}
              >
                {editingTransaction ? "Frissítés mentése" : "Log Transaction"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  } catch (err: any) {
    return (
      <div className="p-8 bg-zinc-950 border border-red-900 rounded-xl max-w-2xl mx-auto my-10 space-y-4">
        <h1 className="text-red-500 text-xl font-bold font-sans">⚠️ Adatbázis szinkronizációs hiba történt</h1>
        <p className="text-zinc-400 text-xs">A Next.js nem omlott össze, de a Supabase visszautasította a kérést az alábbi okból:</p>
        <pre className="bg-black p-4 rounded border border-zinc-800 text-red-400 text-xs font-mono overflow-auto whitespace-pre-wrap">
          {err.message || String(err)}
        </pre>
        <p className="text-zinc-500 text-[11px]">
          Tipp: Ha azt írja, hogy egy oszlop hiányzik (pl. <code className="text-zinc-300">description</code> vagy <code className="text-zinc-300">type</code>), add hozzá a Supabase Table Editorban, majd kattints a Project Settings → API → "Reload PostgREST Schema" gombra!
        </p>
      </div>
    );
  }
}
