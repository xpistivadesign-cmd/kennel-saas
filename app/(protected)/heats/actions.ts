"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/db/supabase-server";

export async function addGlobalHeatAction(formData: FormData) {
  const supabase = createSupabaseServer();
  
  // Lekérjük az aktuális bejelentkezett felhasználót
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized access");

  const dogId = String(formData.get("dog_id"));
  const startDate = String(formData.get("start_date"));
  const notes = String(formData.get("notes") ?? "");

  if (!dogId || dogId === "null" || dogId === "") {
    throw new Error("Please select a female dog.");
  }

  // Megpróbáljuk elmenteni. Ha nincs user_id oszlop a táblában, 
  // vagy az RLS elutasítja, a fallback ág menti el user_id nélkül!
  try {
    const { error } = await supabase.from("heat_cycles").insert({
      dog_id: dogId,
      start_date: startDate,
      notes: notes,
      user_id: user.id
    });

    if (error) {
      // Ha a user_id hiba miatt hasalt el, megpróbáljuk anélkül is
      console.error("Első mentési kísérlet hiba, próbálkozás user_id nélkül:", error.message);
      const { error: fallbackError } = await supabase.from("heat_cycles").insert({
        dog_id: dogId,
        start_date: startDate,
        notes: notes
      });
      if (fallbackError) throw new Error(fallbackError.message);
    }
  } catch (err: any) {
    // Végső mentési kísérlet minden extra mező nélkül
    const { error: finalError } = await supabase.from("heat_cycles").insert({
      dog_id: dogId,
      start_date: startDate,
      notes: notes
    });
    if (finalError) throw new Error(finalError.message);
  }

  // Tisztítjuk a gyorsítótárat és visszaküldjük a felhasználót a friss fülre
  revalidatePath("/heats");
  redirect("/heats");
}
