"use client";

type ContractClientProps = {
  puppy: {
    id: string;
    name: string;
    sex: string;
    color: string;
    sale_price: number | null;
  };

  buyer?: {
    full_name?: string;
    phone?: string;
    address?: string;
  } | null;

  breeder?: {
    kennel_name?: string;
    full_name?: string;
    address?: string;
  } | null;

  litter?: {
    litter_letter?: string;
    created_at?: string;
  } | null;
};

export default function ContractClient({
  puppy,
  buyer,
  breeder,
  litter,
}: ContractClientProps) {
  const today = new Date().toLocaleDateString("hu-HU");

  return (
    <div className="max-w-4xl mx-auto bg-white p-10 text-black print:p-0">
      <h1 className="text-2xl font-bold text-center mb-8">
        KISKUTYA ADÁSVÉTELI SZERZŐDÉS
      </h1>

      {/* 🧑 ELADÓ */}
      <section className="mb-6">
        <h2 className="font-bold mb-2">Eladó (Tenyésztő)</h2>
        <p>{breeder?.kennel_name ?? "—"}</p>
        <p>{breeder?.full_name ?? "—"}</p>
        <p>{breeder?.address ?? "—"}</p>
      </section>

      {/* 🧑 VEVŐ */}
      <section className="mb-6">
        <h2 className="font-bold mb-2">Vevő</h2>
        <p>{buyer?.full_name ?? "—"}</p>
        <p>{buyer?.phone ?? "—"}</p>
        <p>{buyer?.address ?? "—"}</p>
      </section>

      <hr className="my-4" />

      {/* 🐕 KUTYA */}
      <section className="mb-6">
        <h2 className="font-bold mb-2">Kutya adatai</h2>

        <p>Név: {puppy?.name}</p>
        <p>Neme: {puppy?.sex === "female" ? "Szuka" : "Kan"}</p>
        <p>Szín: {puppy?.color}</p>

        {/* 🔥 FIX: litter_letter NEM puppy-ból jön */}
        <p>Alom betű: {litter?.litter_letter ?? "—"}</p>

        {/* 🔥 FIX: safe access + fallback */}
        <p>Vételár: {puppy?.sale_price ?? "Egyedi megállapodás"} €</p>
      </section>

      <hr className="my-6" />

      {/* ✍️ SIGN */}
      <div className="mt-10 flex justify-between">
        <div className="text-center">
          <div className="border-t pt-2 w-48">Eladó</div>
        </div>

        <div className="text-center">
          <div className="border-t pt-2 w-48">Vevő</div>
        </div>
      </div>

      {/* 🔥 FIX: today deklarálva */}
      <p className="text-right mt-10 text-sm text-gray-500">
        Kelt: {today}
      </p>

      {/* 🖨️ PRINT BUTTON */}
      <button
        onClick={() => window.print()}
        className="mt-6 px-4 py-2 bg-black text-white print:hidden"
      >
        Nyomtatás
      </button>
    </div>
  );
}