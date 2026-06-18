import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import FinanceClient from "./FinanceClient";

export const dynamic = "force-dynamic";

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

  const payload = { user_id: user?.id || null, amount, type, category, date, description: notesText, litter_id };

  if (id) {
    await supabase.from("payments").update(payload).eq("id", id);
  } else {
    await supabase.from("payments").insert(payload);
  }
  revalidatePath("/finance");
}

async function deleteTransactionAction(formData: FormData) {
  "use server";
  const supabase = createServerSupabase();
  const id = String(formData.get("id"));
  await supabase.from("payments").delete().eq("id", id);
  revalidatePath("/finance");
}

export default async function FinancePage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const resolvedParams = await searchParams;
  const editId = resolvedParams.edit || null;

  try {
    const { data: paymentsData, error: pErr } = await supabase.from("payments").select("*").eq("user_id", user.id).order("date", { ascending: false });
    if (pErr) throw new Error(pErr.message);

    const { data: littersData, error: lErr } = await supabase.from("litters").select("id, letter").eq("user_id", user.id);
    if (lErr) throw new Error(lErr.message);

    return (
      <FinanceClient 
        payments={paymentsData || []} 
        litters={littersData || []} 
        editId={editId}
        saveTransactionAction={saveTransactionAction}
        deleteTransactionAction={deleteTransactionAction}
      />
    );
  } catch (err: any) {
    return (
      <div className="p-8 bg-zinc-950 border border-red-900 rounded-xl max-w-2xl mx-auto my-10 space-y-4 text-white text-xs">
        <h1 className="text-red-500 text-xl font-bold">⚠️ Adatbázis szinkronizációs hiba történt</h1>
        <pre className="bg-black p-4 rounded border border-zinc-800 text-red-400 font-mono overflow-auto whitespace-pre-wrap">{err.message || String(err)}</pre>
      </div>
    );
  }
}
