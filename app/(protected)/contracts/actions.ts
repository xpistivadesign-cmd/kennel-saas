"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

// Megjegyzés: Az e-mail küldéshez a Resend könyvtárat (npm i resend) ajánlom, 
// de sima fetch-el is megvalósítható a végpontjukon keresztül.
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function saveAndSendContractAction(data: {
  buyer_id: string;
  buyer_name: string;
  buyer_email: string;
  puppy_name: string;
  price_amount: number;
  price_currency: string;
  contract_date: string;
  breeder_email: string;
  breeder_signature_url?: string; // Opcionális kép az aláírásról
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

    // 2. AUTOMATIKUS E-MAIL KÜLDÉS (Ha be van állítva a Resend API)
    if (resend && data.buyer_email) {
      await resend.emails.send({
        from: "Kennel SaaS <noreply@yourkennelapp.com>",
        to: [data.buyer_email, data.breeder_email], // Mind a kettőjüknek elmegy
        subject: `Adásvételi Szerződés - ${data.puppy_name}`,
        html: `
          <h3>Tisztelt ${data.buyer_name}!</h3>
          <p>Mellékelten küldjük a(z) <strong>${data.puppy_name}</strong> nevű kiskutya adásvételi szerződését.</p>
          <p>A szerződés sikeresen iktatásra került a rendszerünkben.</p>
          <br/>
          <p>Üdvözlettel,<br/>${user.email}</p>
        `,
        // Itt opcionálisan generálható és csatolható a valós PDF buffer is,
        // vagy a levélbe rakható egy biztonságos letöltési link az appból!
      });
    }

    revalidatePath("/buyers");
    return { success: true, contract: newContract };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
