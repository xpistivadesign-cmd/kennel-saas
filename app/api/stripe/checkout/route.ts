import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { priceId, customerEmail } = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: customerEmail,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/finance?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/finance?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}