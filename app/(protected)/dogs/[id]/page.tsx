import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import DogBreedingSection from "./DogBreedingSection";

import {
  updateDogProfileAction,
  addMedicalRecordAction,
  addShowResultAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function DogProfilePage({
  params,
  searchParams,
}: any) {
  // NEXT 16 ASZINKRON PARAMS JAVÍTÁS
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const id = resolvedParams.id;
  const activeTab = resolvedSearchParams.tab || "overview";
  const isEditing = resolvedSearchParams.edit === "true";

  // NEXT 16 ASZINKRON COOKIES JAVÍTÁS
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // KUTYA ALAPADATOK LEKÉRÉSE ID ALAPJÁN
  const { data: dog } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", id)
    .single();

  if (!dog) {
    return (
      <div className="p-10 text-red-400 bg-black min-h-screen font-bold">
        Dog profile not found in database.
      </div>
    );
  }

  // ADATKAPCSOLATOK LEKÉRÉSE
  const { data: heatCycles } = await supabase
    .from("heat_cycles")
    .select("*")
    .eq("dog_id", id)
    .order("start_date", { ascending: false });

  const { data: progesterone } = await supabase
    .from("progesterone_tests")
    .select("*")
    .eq("dog_id", id);

  const { data: matings } = await supabase
    .from("matings")
    .select("*")
    .eq("female_id", id)
    .order("date", { ascending: false });

  const { data: dogEvents } = await supabase
    .from("dog_events")
    .select("*")
    .eq("dog_id", id)
    .order("date", { ascending: false });

  const { data: shows } = await supabase
    .from("dog_shows")
    .select("*")
    .eq("dog_id", id)
    .order("date", { ascending: false });

  const isFemale = dog.sex === "Female";

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      
      {/* KUTYA FEJLÉC */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">{dog.name || "Unnamed Dog"}</h1>
          <p className="text-zinc-400 text-sm mt-1">{dog.breed || "Presa Canario"}</p>
        </div>
        <div className="text-xs font-mono bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg text-zinc-300">
          Sex: {dog.sex || "Female"}
        </div>
      </div>

      {/* NAVIGÁCIÓS FÜLEK */}
      <div className="flex border-b border-zinc-800 gap-2 overflow-x-auto">
        <Link href={`/dogs/${id}?tab=overview`} className={`px-4 py-2 text-xs font-black uppercase border-b-2 transition ${activeTab === "overview" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>📋 Overview</Link>
        <Link href={`/dogs/${id}?tab=pedigree`} className={`px-4 py-2 text-xs font-black uppercase border-b-2 transition ${activeTab === "pedigree" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>🧬 Pedigree</Link>
        <Link href={`/dogs/${id}?tab=medical`} className={`px-4 py-2 text-xs font-black uppercase border-b-2 transition ${activeTab === "medical" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>🩺 Medical</Link>
        <Link href={`/dogs/${id}?tab=shows`} className={`px-4 py-2 text-xs font-black uppercase border-b-2 transition ${activeTab === "shows" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>🏆 Shows</Link>
        {isFemale && <Link href={`/dogs/${id}?tab=breeding`} className={`px-4 py-2 text-xs font-black uppercase border-b-2 transition ${activeTab === "breeding" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>🐾 Breeding Logs</Link>}
      </div>

      {/* OVERVIEW FÜL NÉZET + EDIT MECHANIZMUS */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            {isEditing ? (
              <Link href={`/dogs/${id}?tab=overview`} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold px-4 py-2 rounded-lg border border-zinc-700 transition">
                Cancel Edit
              </Link>
            ) : (
              <Link href={`/dogs/${id}?tab=overview&edit=true`} className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-black uppercase px-4 py-2 rounded-lg transition shadow-lg shadow-amber-500/5">
                📝 Edit Specifications
              </Link>
            )}
          </div>

          {isEditing ? (
            /* MODULÁRIS SZERKESZTŐ FORM */
            <form action={updateDogProfileAction.bind(null, id)} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Dog Name</label>
                <input name="name" defaultValue={dog.name || ""} required className="w-full p-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:border-amber-500 outline-none transition" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Breed</label>
                <input name="breed" defaultValue={dog.breed || ""} className="w-full p-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:border-amber-500 outline-none transition" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Color Markings</label>
                <input name="color" defaultValue={dog.color || dog.color_markings || ""} className="w-full p-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:border-amber-500 outline-none transition" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Birth Date</label>
                <input name="birth_date" type="date" defaultValue={dog.birth_date || ""} className="w-full p-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:border-amber-500 outline-none transition" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Microchip ID</label>
                <input name="microchip_number" defaultValue={dog.microchip_number || dog.microchip_id || ""} className="w-full p-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:border-amber-500 outline-none transition" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Passport Number</label>
                <input name="passport_number" defaultValue={dog.passport_number || ""} className="w-full p-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:border-amber-500 outline-none transition" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Pedigree / Törzskönyv Number</label>
                <input name="registration_number" defaultValue={dog.registration_number || dog.pedigree_number || ""} className="w-full p-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:border-amber-500 outline-none transition" />
              </div>
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase text-xs p-3.5 rounded-lg md:col-span-2 mt-2 transition shadow-lg shadow-emerald-500/5">
                Save Specifications & Sync Storage
              </button>
            </form>
          ) : (
            /* STATIKUS KIJELZŐ KÁRTYÁK */
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-black/40 border border-zinc-800 p-4 rounded-xl">
                  <div className="text-zinc-500 text-xs font-bold uppercase">Color Markings</div>
                  <div className="text-sm font-semibold mt-1 text-white">{dog.color || dog.color_markings || "brindle / no record"}</div>
                </div>
                <div className="bg-black/40 border border-zinc-800 p-4 rounded-xl">
                  <div className="text-zinc-500 text-xs font-bold uppercase">Microchip ID</div>
                  <div className="text-sm font-semibold mt-1 text-white">{dog.microchip_number || dog.microchip_id || "Not recorded"}</div>
                </div>
                <div className="bg-black/40 border border-zinc-800 p-4 rounded-xl">
                  <div className="text-zinc-500 text-xs font-bold uppercase">Passport Number</div>
                  <div className="text-sm font-semibold mt-1 text-white">{dog.passport_number || "Not recorded"}</div>
                </div>
                <div className="bg-black/40 border border-zinc-800 p-4 rounded-xl">
                  <div className="text-zinc-500 text-xs font-bold uppercase">Pedigree Registration</div>
                  <div className="text-sm font-semibold mt-1 text-white">{dog.registration_number || dog.pedigree_number || "Not recorded"}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PEDIGREE FÜL */}
      {activeTab === "pedigree" && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 mb-4">Lineage Family Tree</h3>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-black/40 p-4 rounded-xl border border-zinc-800">
              <span className="text-blue-400 font-bold uppercase block text-[10px]">Sire (Father)</span>
              <span className="text-white font-bold text-sm mt-1 block">{dog.sire_name || "Unknown Stud"}</span>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-zinc-800">
              <span className="text-pink-400 font-bold uppercase block text-[10px]">Dam (Mother)</span>
              <span className="text-white font-bold text-sm mt-1 block">{dog.dam_name || "Unknown Female"}</span>
            </div>
          </div>
        </div>
      )}

      {/* MEDICAL FÜL */}
      {activeTab === "medical" && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">Medical History & Events</h3>
          <div className="space-y-2">
            {dogEvents && dogEvents.length > 0 ? (
              dogEvents.map((event: any) => (
                <div key={event.id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-mono text-zinc-500">{event.date}</span> 
                    <span className="font-bold text-white uppercase ml-3 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{event.event_type || event.type}</span>
                  </div>
                  <div className="text-zinc-400">{event.notes || event.description}</div>
                </div>
              ))
            ) : (
              <p className="text-zinc-600 text-xs italic">No clinical transactions or events recorded for this profile.</p>
            )}
          </div>
        </div>
      )}

      {/* SHOWS FÜL */}
      {activeTab === "shows" && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">Show Results</h3>
          <div className="space-y-2">
            {shows && shows.length > 0 ? (
              shows.map((s: any) => (
                <div key={s.id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs flex justify-between items-center">
                  <div><span className="text-zinc-500 font-mono">{s.date}</span> — <span className="font-bold text-white ml-2">{s.show_name || s.title}</span></div>
                  <div className="text-amber-400 font-black">{s.placement || s.result}</div>
                </div>
              ))
            ) : (
              <p className="text-zinc-600 text-xs italic">No competition data found.</p>
            )}
          </div>
        </div>
      )}

      {/* BREEDING FÜL */}
      {activeTab === "breeding" && isFemale && (
        <DogBreedingSection 
          dogId={id} 
          heatCycles={heatCycles || []} 
          progesteroneTests={progesterone || []}
          matings={matings || []}
        />
      )}

    </div>
  );
}
