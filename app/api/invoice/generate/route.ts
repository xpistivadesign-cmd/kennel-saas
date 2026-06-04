import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { customer, amount } = await req.json();

  const invoiceHtml = `
    <html>
      <body>
        <h1>Számla</h1>
        <p>Ügyfél: ${customer}</p>
        <p>Összeg: ${amount} HUF</p>
      </body>
    </html>
  `;

  return new NextResponse(invoiceHtml, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}