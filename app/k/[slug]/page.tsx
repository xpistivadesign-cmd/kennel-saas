import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Next.js 15 aszinkron Params típus definíció
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicKennel({ params }: PageProps) {
  // 1. KÖTELEZŐ: megvárjuk a params feloldását, különben undefined lesz a slug!
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const supabase = createServerSupabase();

  // Kennel lekérése a slug alapján
  const { data: kennel } = await supabase
    .from("kennels")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!kennel) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-zinc-500">Kennel not found</h1>
          <p className="text-zinc-600">The requested public catalog does not exist.</p>
        </div>
      </div>
    );
  }

  // Publikus kutyák lekérése
  const { data: dogs } = await supabase
    .from("dogs")
    .select("*")
    .eq("user_id", kennel.user_id)
    .eq("is_public", true);

  // Eladó kutyák/kölykök lekérése
  const { data: forSale } = await supabase
    .from("dogs")
    .select("*")
    .eq("user_id", kennel.user_id)
    .eq("is_for_sale", true);

  return (
    <div className="min-h-screen bg-black text-white p-10 space-y-10">
      {/* Kennel Header */}
      <div className="flex items-center gap-6 border-b border-zinc-800 pb-8">
        {kennel.logo_url ? (
          <img src={kennel.logo_url} alt={kennel.name} className="w-24 h-24 rounded-2xl object-cover border border-zinc-700" />
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 font-bold text-xl">
            {kennel.name?.substring(0, 2).toUpperCase()}
          </div>
        )}

        <div>
          <h1 className="text-4xl font-extrabold text-amber-500">{kennel.name}</h1>
          <p className="text-zinc-400 mt-2 max-w-2xl">{kennel.description || "Welcome to our official kennel catalog."}</p>
        </div>
      </div>

      {/* Kétoszlopos katalógus elrendezés */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bal oszlop: Publikus kutyáink */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-zinc-200">Our Dogs</h2>
          {dogs && dogs.length > 0 ? (
            <div className="grid gap-3">
              {dogs.map((d: any) => (
                <div key={d.id} className="border border-zinc-800 bg-zinc-900/50 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-lg text-white">{d.name}</div>
                    <div className="text-sm text-zinc-400">{d.breed} • {d.sex}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-600 italic">No public dogs listed yet.</p>
          )}
        </div>

        {/* Jobb oszlop: Eladó kutyák / kölykök */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-amber-500">Available For Sale 🏷️</h2>
          {forSale && forSale.length > 0 ? (
            <div className="grid gap-3">
              {forSale.map((d: any) => (
                <div key={d.id} className="border border-amber-500/30 bg-amber-500/5 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-lg text-amber-400">{d.name}</div>
                    <div className="text-sm text-zinc-400">{d.breed}</div>
                  </div>
                  <span className="bg-amber-500 text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    Available
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-600 italic">No puppies or dogs for sale right now.</p>
          )}
        </div>
      </div>
    </div>
  );
}
