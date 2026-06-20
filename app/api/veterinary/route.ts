import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: appointments } = await supabase
      .from("vet_visits")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });

    const { data: documents } = await supabase
      .from("veterinary_documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ appointments: appointments || [], documents: documents || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const actionType = formData.get("action_type")?.toString();

    // 1. ÚJ IDŐPONT RÖGZÍTÉSE (A korábbi addVetVisit kiterjesztett változata)
    if (actionType === "create_appointment") {
      const payload = {
        user_id: user.id,
        dog_id: formData.get("dog_id")?.toString() || null,
        date: formData.get("start_at")?.toString(),
        purpose: formData.get("title")?.toString() || "Vizsgálat",
        type: formData.get("type")?.toString() || "checkup",
        cost: Number(formData.get("cost") || 0),
        vet_name: formData.get("vet_name")?.toString() || "",
        status: "planned"
      };
      const { error } = await supabase.from("vet_visits").insert(payload);
      if (error) throw error;
    }

    // 2. IDŐPONT LEZÁRÁSA + AUTO FINANCE AUTOMATIKUS KÖNYVELÉS (A te korábbi markDone funkciód!)
    if (actionType === "mark_done") {
      const visitId = formData.get("visit_id")?.toString();
      const cost = Number(formData.get("cost") || 0);

      const { error: updateErr } = await supabase
        .from("vet_visits")
        .update({ status: "done" })
        .eq("id", visitId)
        .eq("user_id", user.id);

      if (updateErr) throw updateErr;

      // 🔥 AUTO FINANCE IMPACT (A te bevált logikád megtartása)
      await supabase.from("payments").insert({
        user_id: user.id,
        amount: cost,
        type: "expense",
        category: "Veterinary"
      });
    }

    // 3. DOKUMENTUM FELTÖLTÉSE
    if (actionType === "upload_document") {
      const dog_id = formData.get("dog_id")?.toString() || null;
      const title = formData.get("title")?.toString() || "Klinikai lelet";
      const category = formData.get("category")?.toString() || "other";
      const medicalFile = formData.get("medical_file") as File;

      if (medicalFile && medicalFile.size > 0) {
        const fileExt = medicalFile.name.split(".").pop();
        const fileName = `medical-${user.id}-${Date.now()}.${fileExt}`;
        const { data: uploadData } = await supabase.storage.from("logos").upload(fileName, medicalFile, { upsert: true });

        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(fileName);
          await supabase.from("veterinary_documents").insert({
            user_id: user.id,
            dog_id,
            title,
            category,
            file_url: publicUrl,
            file_type: fileExt || "pdf"
          });
        }
      }
    }

    revalidatePath("/veterinary");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
