import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import DogBreedingSection from "./DogBreedingSection";
import DogPedigreeSection from "./DogPedigreeSection";

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
  // NEXT 16 ASZINKRON PARAMS FELOLDÁS (SZERVEROLDALON)
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const id = resolvedParams.id;
  const activeTab = resolvedSearchParams.tab || "overview";
  const isEditing = resolvedSearchParams.edit === "true";

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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // KUTYA LEKÉRÉSE
  const { data: dog } = await supabase.from("dogs").select("*").eq("id", id).single();
  if (!dog) return <div className="p-10 text-red-400 bg-black min-h-screen">Profile not found.</div>;

  // POTENCIÁLIS SZÜLŐK LISTÁJA A LEÖRDÜLŐHÖZ
  const { data: allDogs } = await supabase.from("dogs").select("id, name, sex");
  const potentialSires = allDogs?.filter((d: any) => d.sex === "Male" && d.id !== id) || [];
  const potentialDams = allDogs?.filter((d: any) => d.sex === "Female" && d.id !== id) || [];

  // CSALÁDFA SZÖVEGES MEGJELENÍTÉSE
  const dbSire = dog.sire_id ? allDogs?.find((d: any) => d.id === dog.sire_id) : null;
  const dbDam = dog.dam_id ? allDogs?.find((d: any) => d.id === dog.dam_id) : null;

  const sireNameDisplay = dbSire?.name || dog.sire_name || dog.sire || "Unknown Stud";
  const damNameDisplay = dbDam?.name || dog.dam_name || dog.dam || "Unknown Female";

  // RENDERSZINTŰ ADATOK
  const { data: heatCycles } = await supabase.from("heat_cycles").select("*").eq("dog_id", id).order("start_date", { ascending: false });
  const { data: progesterone } = await supabase.from("progesterone_tests").select("*").eq("dog_id", id).order("date", { ascending: false });
  const { data: matings } = await supabase.from("matings").select("*").eq("female_id", id).order("date", { ascending: false });
  const { data: dogEvents } = await supabase.from("dog_events").select("*").eq("dog_id", id).order("date", { ascending: false });
  const { data: shows } = await supabase.from("dog_shows").select("*").eq("dog_id", id).order("date", { ascending: false });

  const isFemale = dog.sex === "Female";

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      
      {/* HEADER */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">{dog.name || "Unnamed Dog"}</h1>
          <p className="text-zinc-400 text-sm mt-1">{dog.breed || "Presa Canario"}</p>
        </div>
        <div className="text-xs font-mono bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg text-zinc-300">
          Sex: {dog.sex || "Female"}
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-zinc-800 gap-2 overflow-x-auto">
        <Link href={`/dogs/${id}?tab=overview`} className={`px-4 py-2 text-xs font-black uppercase border-b-2 transition ${activeTab === "overview" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>📋 Overview</Link>
        <Link href={`/dogs/${id}?tab=pedigree`} className={`px-4 py-2 text-xs font-black uppercase border-b-2 transition ${activeTab === "pedigree" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>🧬 Pedigree</Link>
        <Link href={`/dogs/${id}?tab=medical`} className={`px-4 py-2 text-xs font-black uppercase border-b-2 transition ${activeTab === "medical" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>🩺 Medical</Link>
        <Link href={`/dogs/${id}?tab=shows`} className={`px-4 py-2 text-xs font-black uppercase border-b-2 transition ${activeTab === "shows" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>🏆 Shows</Link>
        {isFemale && <Link href={`/dogs/${id}?tab=breeding`} className={`px-4 py-2 text-xs font-black uppercase border-b-2 transition ${activeTab === "breeding" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>🐾 Breeding Logs</Link>}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link href={isEditing ? `/dogs/${id}?tab=overview` : `/dogs/${id}?tab=overview&edit=true`} className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-black uppercase px-4 py-2 rounded-lg transition">
              {isEditing ? "Cancel Edit" : "📝 Edit Specifications"}
            </Link>
          </div>
          {isEditing ? (
            <form action={updateDogProfileAction.bind(null, id, "overview")} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-zinc-500">Dog Name</label><input name="name" defaultValue={dog.name || ""} required className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-sm text-white" /></div>
              <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-zinc-500">Breed</label><input name="breed" defaultValue={dog.breed || ""} className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-sm text-white" /></div>
              <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-zinc-500">Color</label><input name="color" defaultValue={dog.color || ""} className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-sm text-white" /></div>
              <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-zinc-500">Birth Date</label><input name="birth_date" type="date" defaultValue={dog.birth_date || ""} className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-sm text-white" /></div>
              <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-zinc-500">Microchip ID</label><input name="microchip_number" defaultValue={dog.microchip_number || ""} className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-sm text-white" /></div>
              <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-zinc-500">Passport Number</label><input name="passport_number" defaultValue={dog.passport_number || ""} className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-sm text-white" /></div>
              <div className="space-y-1 md:col-span-2"><label className="text-[10px] uppercase font-bold text-zinc-500">Pedigree Number</label><input name="registration_number" defaultValue={dog.registration_number || ""} className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-sm text-white" /></div>
              <button type="submit" className="bg-emerald-500 text-black font-black uppercase text-xs p-3 rounded-lg md:col-span-2 mt-2 transition">Save Profile Specs</button>
            </form>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl grid md:grid-cols-2 gap-4">
              <div className="bg-black/40 border border-zinc-800 p-4 rounded-xl"><div className="text-zinc-500 text-xs font-bold uppercase">Color Markings</div><div className="text-sm font-semibold mt-1 text-white">{dog.color || "brindle"}</div></div>
              <div className="bg-black/40 border border-zinc-800 p-4 rounded-xl"><div className="text-zinc-500 text-xs font-bold uppercase">Microchip ID</div><div className="text-sm font-semibold mt-1 text-white">{dog.microchip_number || "Not recorded"}</div></div>
              <div className="bg-black/40 border border-zinc-800 p-4 rounded-xl"><div className="text-zinc-500 text-xs font-bold uppercase">Passport Number</div><div className="text-sm font-semibold mt-1 text-white">{dog.passport_number || "Not recorded"}</div></div>
              <div className="bg-black/40 border border-zinc-800 p-4 rounded-xl"><div className="text-zinc-500 text-xs font-bold uppercase">Pedigree Registration</div><div className="text-sm font-semibold mt-1 text-white">{dog.registration_number || "Not recorded"}</div></div>
            </div>
          )}
        </div>
      )}

      {/* PEDIGREE TAB -> KISZERVEZVE A DINAMIKUS KLIENS KOMPONENSBE! */}
      {activeTab === "pedigree" && (
        <DogPedigreeSection
          dogId={id}
          isEditing={isEditing}
          sireNameDisplay={sireNameDisplay}
          damNameDisplay={damNameDisplay}
          potentialSires={potentialSires}
          potentialDams={potentialDams}
          currentSireId={dog.sire_id}
          currentDamId={dog.dam_id}
          currentSireName={dog.sire_name || dog.sire}
          currentDamName={dog.dam_name || dog.dam}
        />
      )}

      {/* MEDICAL TAB */}
      {activeTab === "medical" && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">🩺 Clinic & Medical Records</h3>
          <form action={addMedicalRecordAction.bind(null, id)} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-black/40 p-3 rounded-xl border border-zinc-900">
            <input name="date" type="date" required className="p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white" />
            <input name="type" placeholder="Type (Vaccine, Deworm)" required className="p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white" />
            <input name="notes" placeholder="Brand / Clinic log" className="p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white" />
            <button type="submit" className="bg-amber-500 text-black font-bold text-xs uppercase rounded-lg transition">Record Event</button>
          </form>
          <div className="space-y-2 mt-4">
            {dogEvents && dogEvents.length > 0 ? (
              dogEvents.map((m: any) => (
                <div key={m.id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs flex justify-between items-center">
                  <div><span className="font-mono text-zinc-500">{m.date}</span> — <span className="font-bold text-white uppercase ml-2 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">{m.event_type}</span></div>
                  <div className="text-zinc-400">{m.notes}</div>
                </div>
              ))
            ) : (
              <p className="text-zinc-600 text-xs italic">No clinical transactions recorded.</p>
            )}
          </div>
        </div>
      )}

      {/* SHOWS TAB */}
      {activeTab === "shows" && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">🏆 Cynology Show Performance</h3>
          <form action={addShowResultAction.bind(null, id)} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-black/40 p-3 rounded-xl border border-zinc-900">
            <input name="show_name" placeholder="Show Title" required className="p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white" />
            <input name="date" type="date" required className="p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white" />
            <input name="location" placeholder="Venue Location" className="p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white" />
            <input name="placement" placeholder="Result / Title" className="p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white" />
            <button type="submit" className="bg-amber-500 text-black font-bold text-xs uppercase rounded-lg transition">Add Show</button>
          </form>
          <div className="space-y-2 mt-4 text-xs">
            {shows && shows.length > 0 ? (
              shows.map((s: any) => (
                <div key={s.id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex justify-between items-center">
                  <div><span className="text-zinc-500 font-mono">{s.date}</span> — <span className="font-bold text-white ml-2">{s.show_name}</span> <span className="text-zinc-500">({s.location})</span></div>
                  <div className="text-amber-400 font-black">{s.placement}</div>
                </div>
              ))
            ) : (
              <p className="text-zinc-600 text-xs italic">No competition data found.</p>
            )}
          </div>
        </div>
      )}

      {/* BREEDING LOGS TAB */}
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
