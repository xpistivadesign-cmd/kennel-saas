import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function ContractPage({
  params,
}: {
  params: { puppyId: string };
}) {
  const supabase = createClient();

  const { data: puppy, error } = await supabase
    .from("puppies")
    .select(
      `
      id,
      name,
      sex,
      color,
      sale_price,
      created_at
    `
    )
    .eq("id", params.puppyId)
    .single();

  if (error || !puppy) return notFound();

  const formattedDate = new Date().toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded p-8 border print:shadow-none print:border-none print:p-0">
        <h1 className="text-2xl font-bold text-center mb-8">
          Kiskutya Adásvételi Szerződés
        </h1>

        <table className="w-full border border-gray-300">
          <tbody>
            <tr>
              <td className="border p-2 font-bold">Hívónév</td>
              <td className="border p-2">{puppy.name}</td>
            </tr>
            <tr>
              <td className="border p-2 font-bold">Neme</td>
              <td className="border p-2">
                {puppy.sex === "female" ? "Szuka" : "Kan"}
              </td>
            </tr>
            <tr>
              <td className="border p-2 font-bold">Vételár</td>
              <td className="border p-2">
                {puppy.sale_price ?? "Egyedi megállapodás"}
              </td>
            </tr>
          </tbody>
        </table>

        <p className="mt-8 text-right">Kelt: {formattedDate}</p>

        <div className="mt-12 grid grid-cols-2 gap-8 text-center">
          <div className="border-t pt-2">Eladó</div>
          <div className="border-t pt-2">Vevő</div>
        </div>
      </div>
    </div>
  );
}