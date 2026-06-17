"use client";

import { useState } from "react";
import { addDogAction } from "./actions";

interface Props {
  potentialSires: any[];
  potentialDams: any[];
}

export default function AddDogForm({ potentialSires, potentialDams }: Props) {
  const [sireSelection, setSireSelection] = useState<string>("null");
  const [damSelection, setDamSelection] = useState<string>("null");

  return (
    <form action={addDogAction} className="space-y-4 text-xs">
      
      {/* Name & Breed */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-zinc-500">Name</label>
          <input name="name" required className="w-full p-2 bg-black border border-zinc-800 rounded-xl text-sm text-white focus:border-amber-500 outline-none transition" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-zinc-500">Breed</label>
          <input name="breed" placeholder="e.g., Presa Canario" className="w-full p-2 bg-black border border-zinc-800 rounded-xl text-sm text-white focus:border-amber-500 outline-none transition" />
        </div>
      </div>

      {/* Sex & Birth Date */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-zinc-500">Sex</label>
          <select name="sex" className="w-full p-2 bg-black border border-zinc-800 rounded-xl text-sm text-white focus:border-amber-500 outline-none transition">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-zinc-500">Birth Date</label>
          <input name="birth_date" type="date" className="w-full p-2 bg-black border border-zinc-800 rounded-xl text-sm text-white focus:border-amber-500 outline-none transition" />
        </div>
      </div>

      {/* Microchip & Passport */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-zinc-500">Microchip ID</label>
          <input name="microchip_number" className="w-full p-2 bg-black border border-zinc-800 rounded-xl text-sm text-white focus:border-amber-500 outline-none transition" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-zinc-500">Passport Number</label>
          <input name="passport_number" className="w-full p-2 bg-black border border-zinc-800 rounded-xl text-sm text-white focus:border-amber-500 outline-none transition" />
        </div>
      </div>

      {/* Color Markings */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-zinc-500">Color Markings</label>
        <input name="color" className="w-full p-2 bg-black border border-zinc-800 rounded-xl text-sm text-white focus:border-amber-500 outline-none transition" />
      </div>

      {/* HYBRID SIRE (APA) */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-blue-400">Sire (Father)</label>
        <select 
          name="sire_id" 
          value={sireSelection}
          onChange={(e) => setSireSelection(e.target.value)}
          className="w-full p-2 bg-black border border-zinc-800 rounded-xl text-sm text-white focus:border-blue-500 outline-none transition"
        >
          <option value="null">None</option>
          {potentialSires.map((s: any) => (
            <option key={s.id} value={s.id}>🐾 {s.name}</option>
          ))}
          <option value="other">Other (Type manually)...</option>
        </select>
        {sireSelection === "other" && (
          <input 
            name="sire_name" 
            required
            placeholder="Type external father full name" 
            className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white mt-1 outline-none focus:border-amber-400 animate-fadeIn"
          />
        )}
      </div>

      {/* HYBRID DAM (ANYA) */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-pink-400">Dam (Mother)</label>
        <select 
          name="dam_id" 
          value={damSelection}
          onChange={(e) => setDamSelection(e.target.value)}
          className="w-full p-2 bg-black border border-zinc-800 rounded-xl text-sm text-white focus:border-pink-500 outline-none transition"
        >
          <option value="null">None</option>
          {potentialDams.map((d: any) => (
            <option key={d.id} value={d.id}>🐾 {d.name}</option>
          ))}
          <option value="other">Other (Type manually)...</option>
        </select>
        {damSelection === "other" && (
          <input 
            name="dam_name" 
            required
            placeholder="Type external mother full name" 
            className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white mt-1 outline-none focus:border-amber-400 animate-fadeIn"
          />
        )}
      </div>

      {/* Submit Button */}
      <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black uppercase text-xs p-3 rounded-xl transition mt-4 shadow-lg shadow-amber-500/5">
        Add Dog
      </button>
    </form>
  );
}
