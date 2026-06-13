import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractPage({ params }: PageProps) {
  // Megvárjuk az aszinkron paramétereket a Next.js 15/16 szabályai szerint
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Alom és kiskutyák lekérése a szerver oldalon az RLS-en keresztül
  const { data: litter } = await supabase
    .from("litters")
    .select("*, puppies(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!litter) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-500 flex items-center justify-center">
        Litter Record Not Found
      </div>
    );
  }

  const puppy = litter.puppies?.[0];

  return (
    <div className="min-h-screen bg-zinc-900 p-4 md:p-10 print:bg-white print:p-0">
      {/* A nyomtatható szerződés papírja */}
      <div className="bg-white text-black p-8 md:p-12 max-w-4xl mx-auto rounded-2xl shadow-2xl print:shadow-none print:rounded-none">
        
        <h1 className="text-3xl font-black text-center uppercase tracking-wide border-b-2 border-black pb-4">
          Puppy Sales Contract & Health Guarantee
        </h1>

        <div className="mt-8 space-y-6 text-sm leading-relaxed">
          <p className="italic text-zinc-700">
            This official agreement is entered into by and between the Breeder (Kennel Owner) and the Buyer for the sale and transfer of the purebred canine described below.
          </p>

          {/* Kiskutya adatai */}
          <div className="border border-zinc-300 p-4 rounded-xl bg-zinc-50">
            <h2 className="font-bold text-base border-b border-zinc-200 pb-1 mb-2 uppercase tracking-wider text-zinc-800">Puppy Information</h2>
            <div className="grid grid-cols-2 gap-2">
              <p><span className="font-semibold text-zinc-600">Temporary Name / Band:</span> {puppy?.name || "__________________"}</p>
              <p><span className="font-semibold text-zinc-600">Breed:</span> {litter.breed || "N/A"}</p>
              <p><span className="font-semibold text-zinc-600">Date of Birth:</span> {litter.birth_date || "__________________"}</p>
              <p><span className="font-semibold text-zinc-600">Microchip / ID:</span> {puppy?.microchip_id || "__________________"}</p>
            </div>
          </div>

          {/* Szülők */}
          <div className="border border-zinc-300 p-4 rounded-xl bg-zinc-50">
            <h2 className="font-bold text-base border-b border-zinc-200 pb-1 mb-2 uppercase tracking-wider text-zinc-800">Lineage (Parents)</h2>
            <div className="grid grid-cols-2 gap-2">
              <p><span className="font-semibold text-zinc-600">Sire (Father):</span> {litter.sire_name || "Registered Stud"}</p>
              <p><span className="font-semibold text-zinc-600">Dam (Mother):</span> {litter.dam_name || "Registered Female"}</p>
            </div>
          </div>

          {/* Vevő adatai */}
          <div className="border border-zinc-300 p-4 rounded-xl bg-zinc-50">
            <h2 className="font-bold text-base border-b border-zinc-200 pb-1 mb-2 uppercase tracking-wider text-zinc-800">Buyer Information</h2>
            <div className="space-y-3 mt-2">
              <p><span className="font-semibold text-zinc-600">Full Name:</span> ___________________________________________________________</p>
              <p><span className="font-semibold text-zinc-600">Physical Address:</span> ___________________________________________________________</p>
              <p><span className="font-semibold text-zinc-600">Phone & Email:</span> ___________________________________________________________</p>
            </div>
          </div>

          {/* Garancia szöveg */}
          <div className="border border-zinc-300 p-4 rounded-xl bg-zinc-50">
            <h2 className="font-bold text-base border-b border-zinc-200 pb-1 mb-2 uppercase tracking-wider text-zinc-800">Terms of Sale & Health Guarantee</h2>
            <p className="text-xs text-zinc-700 mt-1">
              1. The Breeder guarantees that the puppy is in good health, has received age-appropriate vaccinations, and has been dewormed up to the date of transfer.<br />
              2. The Buyer agrees to maintain the puppy in a safe, healthy environment and provide regular veterinary care.<br />
              3. Genetic health guarantees apply strictly according to the official kennel policies attached to this document.
            </p>
          </div>

          {/* Aláírás sávok */}
          <div className="grid grid-cols-2 gap-8 pt-12">
            <div className="text-center">
              <div className="border-b border-black w-full h-8"></div>
              <p className="text-xs font-bold mt-2 uppercase">Breeder Signature & Date</p>
            </div>
            <div className="text-center">
              <div className="border-b border-black w-full h-8"></div>
              <p className="text-xs font-bold mt-2 uppercase">Buyer Signature & Date</p>
            </div>
          </div>
        </div>

        {/* GOLYÓÁLLÓ NYOMTATÁS TRÜKK: HTML alapú link, ami nem igényel 'use client'-ot a fájl tetején! */}
        <div className="mt-12 flex justify-end print:hidden border-t border-zinc-200 pt-6">
          <a
            href="javascript:window.print()"
            className="bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-wider px-6 py-3 rounded-xl transition shadow-lg shadow-amber-500/20 text-center text-sm"
          >
            🖨️ Print Document
          </a>
        </div>

      </div>
    </div>
  );
}
