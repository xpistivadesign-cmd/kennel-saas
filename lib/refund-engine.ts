import { stripe } from "@/lib/stripe";

type RefundResult =
  | { success: true; refundId: string }
  | { success: false; error: string };

export async function refundDeposit(
  stripeSessionId: string
): Promise<RefundResult> {
  try {
    // 1. Validáció – gyors fail
    if (!stripeSessionId || typeof stripeSessionId !== "string") {
      console.error("[REFUND_ENGINE] ❌ Missing or invalid sessionId");
      return { success: false, error: "Hiányzó vagy hibás session ID" };
    }

    // 2. Session lekérés Stripe-tól
    const session = await stripe.checkout.sessions.retrieve(stripeSessionId);

    if (!session) {
      console.error("[REFUND_ENGINE] ❌ Session not found:", stripeSessionId);
      return { success: false, error: "Session nem található" };
    }

    // 3. Payment intent ellenőrzés
    const paymentIntent = session.payment_intent;

    if (!paymentIntent || typeof paymentIntent !== "string") {
      console.error(
        "[REFUND_ENGINE] ❌ Missing payment_intent for session:",
        stripeSessionId
      );
      return { success: false, error: "Nincs befejezett fizetés (payment_intent hiányzik)" };
    }

    // 4. Refund létrehozása
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntent,
    });

    if (!refund || !refund.id) {
      console.error("[REFUND_ENGINE] ❌ Refund failed for:", stripeSessionId);
      return { success: false, error: "Refund sikertelen" };
    }

    // 5. Siker log
    console.log(
      "[REFUND_ENGINE] ✅ Refund successful:",
      refund.id,
      "session:",
      stripeSessionId
    );

    return {
      success: true,
      refundId: refund.id,
    };
  } catch (error: any) {
    // 6. Global error catch (Stripe / network / runtime)
    console.error("[REFUND_ENGINE] 💥 Unexpected error:", error);

    return {
      success: false,
      error: error?.message || "Ismeretlen hiba történt",
    };
  }
}