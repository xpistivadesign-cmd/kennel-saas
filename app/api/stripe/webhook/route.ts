import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature")!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 💳 SUCCESSFUL PAYMENT
  if (event.type === "checkout.session.completed") {
    const session: any = event.data.object;

    const dogId = session.metadata?.dogId;
    const type = session.metadata?.type;

    if (type === "deposit") {
      await supabase.from("deposits").insert({
        dog_id: dogId,
        buyer_email: session.customer_email,
        amount: session.amount_total / 100,
        status: "paid",
        stripe_session_id: session.id,
      });
    }

    if (type === "payment") {
      await supabase.from("payments").insert({
        dog_id: dogId,
        amount: session.amount_total / 100,
        status: "paid",
        stripe_session_id: session.id,
      });
    }
  }

  return new Response("ok");
}