import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: appointments } = await supabase
      .from("veterinary_appointments")
      .select("*")
      .eq("user_id", user.id)
      .order("start_at", { ascending: true });

    // ⚡ FIXED: descending helyett ascending: false-t használunk a csökkenő sorrendhez
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

    // IDŐPONT RÖGZÍTÉSE
    if (actionType === "create_appointment") {
      const payload = {
        user_id: user.id,
        dog_id: formData.get("dog_id")?.toString() || null,
        title: formData.get("title")?.toString() || "Orvosi vizsgálat",
        type: formData.get("type")?.toString() || "checkup",
        start_at: formData.get("start_at")?.toString(),
        vet_name: formData.get("vet_name")?.toString() || "",
        status: "planned"
      };
      const { error } = await supabase.from("veterinary_appointments").insert(payload);
      if (error) throw error;
    }

    // DOKUMENTUM ÉS RTG FELTÖLTÉSE
    if (actionType === "upload_document") {
      const dog_id = formData.get("dog_id")?.toString() || null;
      const title = formData.get("title")?.toString() || "Klinikai lelet";
      const category = formData.get("category")?.toString() || "other";
      const medicalFile = formData.get("medical_file") as File;

      if (medicalFile && medicalFile.size > 0) {
        const fileExt = medicalFile.name.split(".").pop();
        const fileName = `medical-${user.id}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("logos")
          .upload(fileName, medicalFile, { upsert: true });

        if (uploadData && !uploadErr) {
          const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(fileName);
          
          const { error: insErr } = await supabase.from("veterinary_documents").insert({
            user_id: user.id,
            dog_id,
            title,
            category,
            file_url: publicUrl,
            file_type: fileExt || "pdf"
          });
          if (insErr) throw insErr;
        }
      }
    }

    revalidatePath("/veterinary");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Veterinary API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
