import { generatePuppyContract } from "@/app/actions/finance";

export default async function ContractPage({
  params,
}: {
  params: { puppyId: string };
}) {
  const contract = await generatePuppyContract(
    params.puppyId
  );

  if (!contract) {
    return (
      <div className="p-6 text-gray-500">
        Nincs szerződés adat.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white border rounded-xl space-y-4">
      <h1 className="text-2xl font-bold">
        Kiskutya Adásvételi Szerződés
      </h1>

      <p>Kiskutya: {contract.puppyName}</p>
      <p>Alom: {contract.litter}</p>

      <hr />

      <p>Vevő: {contract.buyerName}</p>
      <p>Telefon: {contract.buyerPhone}</p>

      <hr />

      <p>Ár: {contract.price} €</p>
      <p>Foglaló: {contract.deposit} €</p>
      <p>
        Hátralék:{" "}
        <b>{contract.remaining} €</b>
      </p>

      <p className="text-sm text-gray-500">
        Dátum: {contract.date}
      </p>

      <button
        onClick={() => window.print()}
        className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded"
      >
        Nyomtatás
      </button>
    </div>
  );
}