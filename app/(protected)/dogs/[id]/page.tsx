import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

interface DogPageProps {
  params: {
    id: string;
  };
}

export default async function DogDetailPage({ params }: DogPageProps) {
  const { id } = params;

  const supabase = await createClient();

  // 🐕 Kutya lekérése
  const { data: dog, error } = await supabase
    .from("dogs")
    .select("id, name, registration_number, birth_date, sex")
    .eq("id", id)
    .single();

  if (error || !dog) {
    return notFound();
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        🐕 {dog.name}
      </h1>

      <div className="bg-white shadow p-6 rounded-lg space-y-3 border">
        <p>
          <strong>Törzskönyv:</strong>{" "}
          {dog.registration_number ?? "-"}
        </p>

        <p>
          <strong>Született:</strong>{" "}
          {dog.birth_date
            ? new Date(dog.birth_date).toLocaleDateString("hu-HU")
            : "-"}
        </p>

        <p>
          <strong>Nem:</strong>{" "}
          {dog.sex === "female"
            ? "Szuka"
            : dog.sex === "male"
            ? "Kan"
            : "-"}
        </p>
      </div>
    </div>
  );
}