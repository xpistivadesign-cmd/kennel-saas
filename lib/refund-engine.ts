import { stripe } from "@/lib/stripe";

export async function refundDeposit(stripeSessionId?: string) {
  try {
    if (!stripeSessionId) {
      return { success: false, error: "Missing session ID" };
    }

    const session = await stripe.checkout.sessions.retrieve(stripeSessionId);

    const paymentIntent = session?.payment_intent;

    if (!paymentIntent || typeof paymentIntent !== "string") {
      return { success: false, error: "No valid payment intent found" };
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntent,
    });

    return {
      success: true,
      refundId: refund.id,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Unknown Stripe error",
    };
  }
}
