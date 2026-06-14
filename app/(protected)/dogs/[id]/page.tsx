import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import DogBreedingSection from "./DogBreedingSection";

import {
  updateDogProfileAction,
  uploadDogImageAction,
  addMedicalRecordAction,
  addShowResultAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function DogProfilePage({
  params,
  searchParams,
}: any) {
  // ✅ FIX 1: A params és a searchParams is ASZINKRON objektum (Next 16 Promise)
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const id = resolvedParams.id;
  const activeTab = resolvedSearchParams.tab || "overview";
  const isEditing = resolvedSearchParams.edit === "true";

  // ✅ FIX 2: cookies() IS NOW ASYNC (Next 16)
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

  // ÖSSZES VALÓS ADATKAPCSOLAT LEKÉRÉSE A SÉMÁD ALAPJÁN
  const { data: dog } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!dog) {
    return (
      <div className="p-10 text-red-400 bg-black min-h-screen font-bold">
        Dog not found. (ID vagy RLS hiba)
      </div>
    );
  }

  const { data: medical } = await supabase.from("medical_records").select("*").eq("dog_id", id).order("date", { ascending: false });
  const { data: shows } = await supabase.from("dog_shows").select("*").eq("dog_id", id).order("date", { ascending: false });
  const { data: heatCycles } = await supabase.from("heat_cycles").select("*").eq("dog_id", id).order("start_date", { ascending: false });
  const { data: progesterone } = await supabase.from("progesterone_tests").select("*").eq("dog_id", id);
  const { data: matings } = await supabase.from("matings").select("*").eq("female_id", id).order("date", { ascending: false });

  // 3 GENERÁCIÓS CSALÁDFA SZIMULÁCIÓ
  const fetchParent = async (parentId: string | null) => {
    if (!parentId) return null;
    const { data } = await supabase.from("dogs").select("id, name, registration_number, sire_id, dam_id").eq("id", parentId).maybeSingle();
    return data;
  };

  const sire = await fetchParent(dog.sire_id);
  const dam = await fetchParent(dog.dam_id);
  const sireSire = sire ? await fetchParent(sire.sire_id) : null;
  const sireDam = sire ? await fetchParent(sire.dam_id) : null;
  const damSire = dam ? await fetchParent(dam.sire_id) : null;
  const damDam = dam ? await fetchParent(dam.dam_id) : null;

  const isFemale = dog.sex === "Female";

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      
      {/* 1. KUTYA FEJLÉC PROFILKÉPPEL */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          {dog.image_url ? (
            <img src={dog.image_url} alt={dog.name} className="w-24 h-24 rounded-2xl object-cover border border-zinc-700 shadow-xl" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 text-[10px] font-black uppercase text-center p-2">No Photo</div>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-amber-400 tracking-tight">{dog.name}</h1>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${dog.sex === 'Male' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'}`}>{dog.sex}</span>
            </div>
            <p className="text-zinc-400 text-sm mt-1">{dog.breed || "No Breed Specified"}</p>
          </div>
        </div>

        {/* PROFILKÉP FELTÖLTŐ FORM */}
        <form action={uploadDogImageAction.bind(null, id)} className="bg-black/50 border border-zinc-800 p-4 rounded-xl flex items-center gap-4 w-full md:w-auto">
          <div>
            <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Update Avatar</label>
            <input type="file" name="file" accept="image/*" required className="text-xs text-zinc-400 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700" />
          </div>
          <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-black font-black uppercase text-xs px-4 py-2 rounded-lg transition mt-4">Upload</button>
        </form>
      </div>

      {/* 2. PRÉMIUM TAB NAVIGÁCIÓ */}
      <div className="flex border-b border-zinc-800 gap-1 overflow-x-auto">
        <Link href={`/dogs/${id}?tab=overview`} className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition ${activeTab === "overview" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>📋 Overview</Link>
        <Link href={`/dogs/${id}?tab=pedigree`} className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition ${activeTab === "pedigree" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>🧬 Pedigree</Link>
        <Link href={`/dogs/${id}?tab=medical`} className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition ${activeTab === "medical" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>🩺 Medical Mappa</Link>
        <Link href={`/dogs/${id}?tab=shows`} className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition ${activeTab === "shows" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>🏆 Shows</Link>
        {isFemale && <Link href={`/dogs/${id}?tab=breeding`} className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition ${activeTab === "breeding" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>🐾 Breeding Logs</Link>}
      </div>

      {/* 3. TABS TARTALMAK */}

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div>
          {isEditing ? (
            <form action={updateDogProfileAction.bind(null, id)} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-zinc-500">Name</label><input name="name" defaultValue={dog.name} required className="w-full p-2 bg-black border border-zinc-800 rounded-xl text-sm text-white" /></div>
              <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-zinc-500">Breed</label><input name="breed" defaultValue={dog.breed || ""} className="w-full p-2 bg-black border border-zinc-800 rounded-xl text-sm text-white" /></div>
              <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-zinc-500">Color Markings</label><input name="color" defaultValue={dog.color || dog.color_markings || ""} className="w-full p-2 bg-black border border-zinc-800 rounded-xl text-sm text-white" /></div>
              <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-zinc-500">Birth Date</label><input name="birth_date" type="date" defaultValue={dog.birth_date || ""} className="w-full p-2 bg-black border border-zinc-800 rounded-xl text-sm text-white" /></div>
              <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-zinc-500">Microchip ID</label><input name="microchip_number" defaultValue={dog.microchip_number || dog.microchip_id || ""} className="w
