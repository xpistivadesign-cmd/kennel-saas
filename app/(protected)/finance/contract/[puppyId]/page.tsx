import { generatePuppyContract } from "@/app/actions/finance";

export default async function ContractPage({
  params,
}: {
  params: { puppyId: string };
}) {
  const contract = await generatePuppyContract(params.puppyId);

  if (!contract) {
    return (
      <div className="p-6 text-red-500">
        Nem található szerződés adat.
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen p-10 print:p-0 print:m-0">
      {/* PRINT BUTTON */}
      <div className="no-print flex justify-end mb-6">
        <button
          onClick={() => window.print()}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Nyomtatás
        </button>
      </div>

      {/* CONTRACT */}
      <div className="max-w-3xl mx-auto border p-10 print:border-none print:p-0">
        <h1 className="text-2xl font-bold text-center mb-8">
          KISKUTYA ADÁSVÉTELI SZERZŐDÉS
        </h1>

        <div className="space-y-4 text-sm leading-6">
          <p><b>Kutya neve:</b> {contract.puppyName}</p>
          <p><b>Alom:</b> {contract.litter}</p>

          <hr />

          <p><b>Vevő neve:</b> {contract.buyerName}</p>
          <p><b>Telefonszám:</b> {contract.buyerPhone}</p>
          <p><b>Cím:</b> {contract.buyerAddress}</p>

          <hr />

          <p><b>Vételár:</b> {contract.price} €</p>
          <p><b>Foglaló:</b> {contract.deposit} €</p>
          <p>
            <b>Hátralék:</b> {contract.remaining} €
          </p>

          <hr />

          <p className="text-right text-gray-500">
            Dátum: {contract.date}
          </p>
        </div>

        {/* SIGNATURE AREA */}
        <div className="mt-16 grid grid-cols-2 gap-10 text-sm">
          <div>
            _______________________<br />
            Eladó aláírása
          </div>

          <div>
            _______________________<br />
            Vevő aláírása
          </div>
        </div>
      </div>

      {/* PRINT STYLES */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}