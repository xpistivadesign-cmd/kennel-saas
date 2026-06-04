import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

interface ContractPageProps {
  params: Promise<{
    puppyId: string;
  }>;
}

export default async function PuppyContractPage({ params }: ContractPageProps) {
  const { puppyId } = await params;
  const supabase = await createClient();

  const { data: puppy, error } = await supabase
    .from("puppies")
    .select(`
      id,
      name,
      sex,
      color,
      sale_price,
      created_at
    `)
    .eq("id", puppyId)
    .single();

  if (error || !puppy) {
    return notFound();
  }

  const formattedDate = new Date().toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 print:bg-white print:p-0">
      
      {/* 100% Server-safe CSS alapú nyomtatás trükk: a böngésző natív print ablakát hívjuk meg kliensJS nélkül */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <span className="text-sm text-gray-500">Adásvételi Szerződés Előnézet</span>
        <span className="text-xs text-gray-400 font-sans">Nyomtatáshoz használd a Ctrl + P billentyűkombinációt</span>
      </div>

      <div className="max-w-4xl mx-auto bg-white shadow-md rounded p-8 sm:p-12 border border-gray-200 print:shadow-none print:border-none print:p-0 text-gray-950 font-serif leading-relaxed text-sm">
        
        <h1 className="text-2xl font-bold text-center uppercase tracking-wide mb-8 border-b-2 border-black pb-2">
          Kiskutya Adásvételi Szerződés
        </h1>

        <p className="mb-6 text-justify">
          Amely létrejött a mai napon, mint alulírott helyen és időben, egyrészről a Tenyésztő, másrészről a Vevő között az alábbi feltételek szerint:
        </p>

        <section className="mb-6">
          <h2 className="font-bold uppercase text-base mb-2 border-b border-gray-300">1. Szerződő Felek</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-bold text-gray-700 mb-1">Eladó (Tenyésztő):</p>
              <p className="h-6 border-b border-gray-200 italic text-gray-400 text-xs">Név / Kennel név</p>
              <p className="h-6 border-b border-gray-200 italic text-gray-400 text-xs mt-2">Cím / Székhely</p>
            </div>
            <div>
              <p className="font-bold text-gray-700 mb-1">Vevő:</p>
              <p className="h-6 border-b border-gray-200 italic text-gray-400 text-xs">Vevő teljes neve</p>
              <p className="h-6 border-b border-gray-200 italic text-gray-400 text-xs mt-2">Vevő lakcíme</p>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="font-bold uppercase text-base mb-2 border-b border-gray-300">2. A Szerződés Tárgya (Kiskutya adatai)</h2>
          <p className="mb-3 text-justify">
            Az Eladó eladja, a Vevő pedig megvásárolja az Eladó tulajdonát képező, az alábbi egyedi adatokkal rendelkező kiskutyát:
          </p>
          <table className="w-full border-collapse border border-gray-400 my-2">
            <tbody>
              <tr>
                <td className="border border-gray-400 p-2 font-bold w-1/3 bg-gray-50">Hívónév:</td>
                <td className="border border-gray-400 p-2">{puppy.name}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-bold bg-gray-50">Neme:</td>
                <td className="border border-gray-400 p-2">{puppy.sex === "female" ? "Szuka" : "Kan"}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-bold bg-gray-50">Szín / Jegyek:</td>
                <td className="border border-gray-400 p-2">{puppy.color || "Nincs megadva"}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-bold bg-gray-50">Azonosító ID:</td>
                <td className="border border-gray-400 p-2 text-xs font-mono">{puppy.id}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="mb-6">
          <h2 className="font-bold uppercase text-base mb-2 border-b border-gray-300">3. Vételár és Pénzügyi Feltételek</h2>
          <p className="text-justify mb-2">
            A kiskutya teljes, kölcsönösen kialakított vételára: <strong className="text-base">{puppy.sale_price ? `${puppy.sale_price} EUR` : "Egyedi megállapodás"}</strong>.
          </p>
          <p className="text-justify">
            A felek rögzítik, hogy a kiskutya a vételár teljes összegének kifizetéséig az Eladó kizárólagos tulajdonát képezi. Vevő a kiskutya átvételekor köteles a teljes hátralékot hiánytalanul rendezni.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-bold uppercase text-base mb-2 border-b border-gray-300">4. Egészségügyi Garancia és Átvétel</h2>
          <p className="text-justify mb-2">
            Eladó szavatolja, hogy a kiskutya a korának megfelelő oltásokkal, parazitamentesítve, egészséges állapotban kerül átadásra. Az átvétel pillanatától a kiskutyával kapcsolatos minden tartási költség és kockázat a Vevőt terheli.
          </p>
        </section>

        <div className="mt-12">
          <p className="mb-12 text-right">Kelt: ......................................., {formattedDate}</p>
          
          <div className="grid grid-cols-2 gap-12 text-center mt-8">
            <div className="border-t border-black pt-2">
              <p className="font-bold">Eladó (Tenyésztő)</p>
            </div>
            <div className="border-t border-black pt-2">
              <p className="font-bold">Vevő</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}