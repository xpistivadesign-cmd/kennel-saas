import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function DogProfilePage({
  params,
}: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: dog, error } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!dog) {
    notFound();
  }

  const { data: sire } = dog.sire_id
    ? await supabase
        .from("dogs")
        .select("id,name")
        .eq("id", dog.sire_id)
        .maybeSingle()
    : { data: null };

  const { data: dam } = dog.dam_id
    ? await supabase
        .from("dogs")
        .select("id,name")
        .eq("id", dog.dam_id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">{dog.name}</h1>
          <p className="text-zinc-400">
            Champion Dog Profile
          </p>
        </div>

        <Link
          href="/dogs"
          className="rounded-lg border border-zinc-700 px-4 py-2 hover:bg-zinc-800"
        >
          Back to Dogs
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 font-semibold text-amber-400">
            Basic Information
          </h2>

          <div className="space-y-2 text-sm">
            <p>
              <span className="text-zinc-500">Breed:</span>{" "}
              {dog.breed || "-"}
            </p>

            <p>
              <span className="text-zinc-500">Sex:</span>{" "}
              {dog.sex || "-"}
            </p>

            <p>
              <span className="text-zinc-500">
                Birth Date:
              </span>{" "}
              {dog.birth_date || "-"}
            </p>

            <p>
              <span className="text-zinc-500">
                Microchip:
              </span>{" "}
              {dog.microchip_id || "-"}
            </p>

            <p>
              <span className="text-zinc-500">
                Registration:
              </span>{" "}
              {dog.reg_number || "-"}
            </p>

            <p>
              <span className="text-zinc-500">
                Pedigree:
              </span>{" "}
              {dog.pedigree_number || "-"}
            </p>

            <p>
              <span className="text-zinc-500">
                Status:
              </span>{" "}
              {dog.status || "-"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 font-semibold text-amber-400">
            Pedigree
          </h2>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-zinc-500">Sire</p>
              <p>{sire?.name || "-"}</p>
            </div>

            <div>
              <p className="text-xs text-zinc-500">Dam</p>
              <p>{dam?.name || "-"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 font-semibold text-amber-400">
            Additional Data
          </h2>

          <div className="space-y-2 text-sm">
            <p>
              <span className="text-zinc-500">
                Passport:
              </span>{" "}
              {dog.passport_number || "-"}
            </p>

            <p>
              <span className="text-zinc-500">
                Color:
              </span>{" "}
              {dog.color_markings || "-"}
            </p>

            <p>
              <span className="text-zinc-500">
                Public Profile:
              </span>{" "}
              {dog.is_public ? "Yes" : "No"}
            </p>

            <p>
              <span className="text-zinc-500">
                For Sale:
              </span>{" "}
              {dog.is_for_sale ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 font-semibold text-amber-400">
          Notes
        </h2>

        <p className="text-zinc-300 whitespace-pre-wrap">
          {dog.notes || "No notes available."}
        </p>
      </div>
    </div>
  );
}
