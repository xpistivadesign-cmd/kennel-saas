import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { dogId, email, amount } = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: email,

    line_items: [
      {
        price_data: {
          currency: "huf",
          product_data: {
            name: `Kölyök foglalás - Dog ${dogId}`,
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],

    metadata: {
      dogId,
      type: "deposit",
    },

    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dogs/${dogId}?deposit=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dogs/${dogId}?deposit=cancel`,
  });

  return NextResponse.json({ url: session.url });
}