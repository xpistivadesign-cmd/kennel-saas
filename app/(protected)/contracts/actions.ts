"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

export async function saveAndSendContractAction(data: {
  buyer_id: string;
  buyer_name: string;
  buyer_email: string;
  puppy_name: string;
  price_amount: number;
  price_currency: string;
  contract_date: string;
  breeder_email: string;
}) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Nincs bejelentkezve felhasználó.");

    // 1. Elmentjük a szerződés metaadatait az adatbázisba
    const { data: newContract, error: dbError } = await supabase
      .from("contracts")
      .insert({
        user_id: user.id,
        buyer_id: data.buyer_id,
        buyer_name: data.buyer_name,
        buyer_email: data.buyer_email || null,
        puppy_name: data.puppy_name,
        price_amount: data.price_amount,
        price_currency: data.price_currency,
        contract_date: data.contract_date,
      })
      .select()
      .single();

    if (dbError) throw new Error("Adatbázis hiba: " + dbError.message);

    // 2. AUTOMATIKUS E-MAIL KÜLDÉS NATÍV FETCH-EL (Így nincs szükség külső csomagra!)
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && data.buyer_email) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from: "Kennel SaaS <noreply@yourkennelapp.com>",
            to: [data.buyer_email, data.breeder_email],
            subject: `Adásvételi Szerződés - ${data.puppy_name}`,
            html: `
              <h3>Tisztelt ${data.buyer_name}!</h3>
              <p>Mellékelten küldjük a(z) <strong>${data.puppy_name}</strong> nevű kiskutya adásvételi szerződését.</p>
              <p>A szerződés sikeresen iktatásra került a rendszerünkben.</p>
              <br/>
              <p>Üdvözlettel,<br/>${user.email}</p>
            `,
          }),
        });
      } catch (emailErr) {
        console.error("Nem sikerült elküldeni az e-mailt:", emailErr);
        // Az e-mail hiba nem rontja el a sikeres adatbázis mentést
      }
    }

    revalidatePath("/buyers");
    return { success: true, contract: newContract };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
