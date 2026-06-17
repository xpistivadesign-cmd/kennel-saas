"use client";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

import DogBreedingSection from "./DogBreedingSection";

import {
  updateDogProfileAction,
  addMedicalRecordAction,
  addShowResultAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default function DogProfilePage({
  params,
  searchParams,
}: any) {
  // Állapotok a dinamikus "Other" opció kezeléséhez
  const [sireSelection, setSireSelection] = useState<string>("null");
  const [damSelection, setDamSelection] = useState<string>("null");
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Next 16 Aszinkron adatok feloldása kliens környezetben wrapperként szimulálva
  const [id, setId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [dog, setDog] = useState<any>(null);
  const [potentialSires, setPotentialSires] = useState<any[]>([]);
  const [potentialDams, setPotentialDams] = useState<any[]>([]);
  const [sireNameDisplay, setSireNameDisplay] = useState("Unknown Stud");
  const [damNameDisplay, setDamNameDisplay] = useState("Unknown Female");
  const [heatCycles, setHeatCycles] = useState<any[]>([]);
  const [progesterone, setProgesterone] = useState<any[]>([]);
  const [matings, setMatings] = useState<any[]>([]);
  const [dogEvents, setDogEvents] = useState<any[]>([]);
  const [shows, setShows] = useState<any[]>([]);
  const [isFemale, setIsFemale] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const resolvedParams = await params;
      const resolvedSearchParams = await searchParams;
      
      const currentId = resolvedParams.id;
      setId(currentId);
      setActiveTab(resolvedSearchParams.tab || "overview");
      setIsEditing(resolvedSearchParams.edit === "true");

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return []; }, setAll() {} } }
      );

      const { data: currentDog } = await supabase.from("dogs").select("*").eq("id", currentId).single();
      if (!currentDog) {
        setLoading(false);
        return;
      }
      setDog(currentDog);
      setIsFemale(currentDog.sex === "Female");

      // Set initial selection logic
      if (currentDog.sire_id) setSireSelection(currentDog.sire_id);
      else if (currentDog.sire_name || currentDog.sire) setSireSelection("other");

      if (currentDog.dam_id) setDamSelection(currentDog.dam_id);
      else if (currentDog.dam_name || currentDog.dam) setDamSelection("other");

      const { data: allDogs } = await supabase.from("dogs").select("id, name, sex");
      setPotentialSires(allDogs?.filter((d: any) => d.sex === "Male" && d.id !== currentId) || []);
      setPotentialDams(allDogs?.filter((d: any) => d.sex === "Female" && d.id !== currentId) || []);

      const dbSire = currentDog.sire_id ? allDogs?.find((d: any) => d.id === currentDog.sire_id) : null;
      const dbDam = currentDog.dam_id ? allDogs?.find((d: any) => d.id === currentDog.dam_id) : null;

      setSireNameDisplay(dbSire?.name || currentDog.sire_name || currentDog.sire || "Unknown Stud");
      setDamNameDisplay(dbDam?.name || currentDog.dam_name || currentDog.dam || "Unknown Female");

      const { data: hc } = await supabase.from("heat_cycles").select("*").eq("dog_id", currentId).order("start_date", { ascending: false });
      const { data: pt } = await supabase.from("progesterone_tests").select("*").eq("dog_id", currentId).order("date", { ascending: false });
      const { data: mt } = await supabase.from("matings").select("*").eq("female_id", currentId).order("date", { ascending: false });
      const { data: de } = await supabase.from("dog_events").select("*").eq("dog_id", currentId).order("date", { ascending: false });
      const { data: sh } = await supabase.from("dog_shows").select("*").eq("dog_id", currentId).order("date", { ascending: false });

      setHeatCycles(hc || []);
      setProgesterone(pt || []);
      setMatings(mt || []);
      setDogEvents(de || []);
      setShows(sh || []);
      setLoading(false);
    }
    init();
  }, [params, searchParams]);

  if (loading) return <div className="p-10 text-zinc-500 bg-black min-h-screen font-mono text-xs">Syncing Kennel Core Data Layer...</div>;
  if (!dog) return <div className="p-10 text-red-400 bg-black min-h-screen font-bold">Profile not found.</div>;

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

      {/* PEDIGREE TAB + INTELLIGENS HYBRID SZŰRŐ */}
      {activeTab === "pedigree" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link href={isEditing ? `/dogs/${id}?tab=pedigree` : `/dogs/${id}?tab=pedigree&edit=true`} className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-black uppercase px-4 py-2 rounded-lg transition">
              {isEditing ? "Cancel Edit" : "📝 Edit Pedigree"}
            </Link>
          </div>

          {isEditing ? (
            <form action={updateDogProfileAction.bind(null, id, "pedigree")} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* SIRE SECTION */}
                <div className="space-y-2 bg-black/30 border border-zinc-800 p-4 rounded-xl">
                  <label className="text-[10px] uppercase font-black text-blue-400 tracking-wider block">Sire (Father) Selection</label>
                  <select 
                    name="sire_id" 
                    value={sireSelection}
                    onChange={(e) => setSireSelection(e.target.value)}
                    className="w-full p-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white outline-none focus:border-blue-500 transition"
                  >
                    <option value="null">-- Unknown / Not Recorded --</option>
                    {potentialSires.map((s: any) => (
                      <option key={s.id} value={s.id}>🐾 {s.name}</option>
                    ))}
                    <option value="other">➕ Other (Type manually)...</option>
                  </select>

                  {/* Dinamikus Manuális Mező - Csak akkor ugrik fel, ha az "Other"-re kattintott! */}
                  {sireSelection === "other" && (
                    <div className="pt-2 animate-fadeIn">
                      <label className="text-[9px] text-zinc-400 uppercase font-bold">Type External Stud's Complete Name:</label>
                      <input 
                        name="sire_name" 
                        defaultValue={dog.sire_id ? "" : (dog.sire_name || dog.sire || "")} 
                        required
                        placeholder="e.g., El Toro Grande of Kennel" 
                        className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white mt-1 outline-none focus:border-amber-400"
                      />
                    </div>
                  )}
                </div>

                {/* DAM SECTION */}
                <div className="space-y-2 bg-black/30 border border-zinc-800 p-4 rounded-xl">
                  <label className="text-[10px] uppercase font-black text-pink-400 tracking-wider block">Dam (Mother) Selection</label>
                  <select 
                    name="dam_id" 
                    value={damSelection}
                    onChange={(e) => setDamSelection(e.target.value)}
                    className="w-full p-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white outline-none focus:border-pink-500 transition"
                  >
                    <option value="null">-- Unknown / Not Recorded --</option>
                    {potentialDams.map((d: any) => (
                      <option key={d.id} value={d.id}>🐾 {d.name}</option>
                    ))}
                    <option value="other">➕ Other (Type manually)...</option>
                  </select>

                  {/* Dinamikus Manuális Mező - Csak akkor ugrik fel, ha az "Other"-re kattintott! */}
                  {damSelection === "other" && (
                    <div className="pt-2 animate-fadeIn">
                      <label className="text-[9px] text-zinc-400 uppercase font-bold">Type External Female's Complete Name:</label>
                      <input 
                        name="dam_name" 
                        defaultValue={dog.dam_id ? "" : (dog.dam_name || dog.dam || "")} 
                        required
                        placeholder="e.g., Bella Donna of Spain" 
                        className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white mt-1 outline-none focus:border-amber-400"
                      />
                    </div>
                  )}
                </div>

              </div>
              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase text-xs p-3.5 rounded-lg transition mt-2 shadow-lg shadow-emerald-500/5">
                Save Lineage Connection & Sync Pedigree
              </button>
            </form>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 mb-4">Lineage Family Tree</h3>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-black/40 p-4 rounded-xl border border-zinc-800">
                  <span className="text-blue-400 font-bold block text-[10px]">Sire (Father)</span>
                  <span className="text-white font-bold text-sm mt-1 block">{sireNameDisplay}</span>
                </div>
                <div className="bg-black/40 p-4 rounded-xl border border-zinc-800">
                  <span className="text-pink-400 font-bold block text-[10px]">Dam (Mother)</span>
                  <span className="text-white font-bold text-sm mt-1 block">{damNameDisplay}</span>
                </div>
              </div>
            </div>
          )}
        </div>
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
