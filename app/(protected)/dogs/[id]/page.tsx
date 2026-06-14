import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DogBreedingSection from "./DogBreedingSection";
import { updateDogProfileAction } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; edit?: string }>;
};

export default async function DogProfilePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { tab, edit } = await searchParams;

  const activeTab = tab || "overview";
  const isEditing = edit === "true";

  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Kutya adatok lekérése az RLS-en keresztül
  const { data: dog } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!dog) {
    return <div className="p-10 text-red-400 bg-black min-h-screen">Dog not found</div>;
  }

  // Tüzelési előzmények lekérése a szuka breeding füléhez
  const { data: heats } = await supabase
    .from("heats")
    .select("*")
    .eq("dog_id", id)
    .order("start_date", { ascending: false });

  const isFemale = dog.sex === "Female";

  return (
    <div className="min-h-screen bg-black text-white p-10 space-y-6">
      {/* KUTYA ALAP FEJLÉC */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">{dog.name}</h1>
          <p className="text-zinc-400 text-sm mt-1">{dog.breed || "Unknown Breed"}</p>
        </div>
        <div className="text-xs font-mono bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg text-zinc-400">
          ID: {dog.id}
        </div>
      </div>

      {/* FÜLEK (TABS) NAVIGÁCIÓ */}
      <div className="flex border-b border-zinc-800 gap-2">
        <Link
          href={`/dogs/${id}?tab=overview`}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition ${
            activeTab === "overview" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"
          }`}
        >
          📋 Overview
        </Link>
        
        {isFemale && (
          <Link
            href={`/dogs/${id}?tab=breeding`}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition ${
              activeTab === "breeding" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"
            }`}
          >
            🐾 Breeding Logs
          </Link>
        )}
      </div>

      {/* OVERVIEW FÜL TARTALMA */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {isEditing ? (
            /* FIX: Itt a .bind(null, id) ami miatt elhasalt a Vercel build! */
            <form action={updateDogProfileAction.bind(null, id)} className="grid gap-4 bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 mb-2">Edit Specifications</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Dog Name</label>
                  <input name="name" defaultValue={dog.name} required className="w-full p-2 bg-black border border-zinc-700 rounded-lg text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Breed</label>
                  <input name="breed" defaultValue={dog.breed || ""} className="w-full p-2 bg-black border border-zinc-700 rounded-lg text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Color Markings</label>
                  <input name="color" defaultValue={dog.color || ""} className="w-full p-2 bg-black border border-zinc-700 rounded-lg text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Birth Date</label>
                  <input name="birth_date" type="date" defaultValue={dog.birth_date || ""} className="w-full p-2 bg-black border border-zinc-700 rounded-lg text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Microchip Number</label>
                  <input name="microchip_number" defaultValue={dog.microchip_number || ""} className="w-full p-2 bg-black border border-zinc-700 rounded-lg text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Passport Number</label>
                  <input name="passport_number" defaultValue={dog.passport_number || ""} className="w-full p-2 bg-black border border-zinc-700 rounded-lg text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Registration / Törzskönyv Number</label>
                  <input name="registration_number" defaultValue={dog.registration_number || ""} className="w-full p-2 bg-black border border-zinc-700 rounded-lg text-sm" />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                  <input type="checkbox" name="is_public" defaultChecked={dog.is_public} className="rounded border-zinc-700 bg-black text-amber-500" />
                  Public Catalog Visibility
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                  <input type="checkbox" name="is_for_sale" defaultChecked={dog.is_for_sale} className="rounded border-zinc-700 bg-black text-amber-500" />
                  Available For Sale
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase text-xs tracking-wider px-4 py-2 rounded-xl transition">
