"use client";

import { useState } from "react";
import { createLitterAction, addPuppyAction, sellPuppyAction } from "./actions";
import { getWhelpingPrediction } from "./helpers";

interface Props {
  litters: any[];
  puppies: any[];
  potentialSires: any[];
  potentialDams: any[];
  activeLitterId: string | null;
}

export default function LittersClient({ litters, puppies, potentialSires, potentialDams, activeLitterId }: Props) {
  const [activeTab, setActiveTab] = useState<string>("directory");
  const [selectedLitterId, setSelectedLitterId] = useState<string | null>(activeLitterId || (litters[0]?.id || null));
  const [sireType, setSireType] = useState("");
  const [damType, setDamType] = useState("");

  const selectedLitter = litters.find((l) => l.id === selectedLitterId);
  const currentPuppies = puppies.filter((p) => p.litter_id === selectedLitterId);

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      
      {/* ALMENÜ NAVIGÁCIÓ */}
      <div className="flex border-b border-zinc-800 gap-2 overflow-x-auto">
        <button onClick={() => setActiveTab("directory")} className={`px-4 py-2 text-xs font-black uppercase border-b-2 transition ${activeTab === "directory" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>📂 Litters Directory</button>
        <button onClick={() => setActiveTab("planner")} className={`px-4 py-2 text-xs font-black uppercase border-b-2 transition ${activeTab === "planner" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>🎯 Mating Planner</button>
        {selectedLitter && (
          <button onClick={() => setActiveTab("litter-profile")} className={`px-4 py-2 text-xs font-black uppercase border-b-2 transition ${activeTab === "litter-profile" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>🐶 {selectedLitter.letter} Litter Manager</button>
        )}
      </div>

      {/* A FÜL: DIRECTORY */}
      {activeTab === "directory" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {litters.map((l) => {
            const pred = getWhelpingPrediction(l.birth_date);
            return (
              <button 
                key={l.id} 
                onClick={() => { setSelectedLitterId(l.id); setActiveTab("litter-profile"); }}
                className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl text-left hover:border-amber-500 transition"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black text-amber-400">"{l.letter}" Litter</h2>
                  <span className="text-[10px] font-mono bg-zinc-800 px-2 py-1 rounded border border-zinc-700 uppercase">{l.status}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">Apa: {l.sire_name || "Saját kan"} • Anya: {l.dam_name || "Saját szuka"}</p>
                <p className="text-[11px] text-zinc-500 mt-1 font-mono">Dátum / Ellés: {l.birth_date || "Tervezett"}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* B FÜL: MATING PLANNER FORMA */}
      {activeTab === "planner" && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-2xl">
          <h2 className="text-lg font-black uppercase text-amber-400 mb-4">Plan & Register New Mating / Litter</h2>
          <form action={createLitterAction} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-zinc-500 uppercase font-bold">Litter ID / Letter</label>
                <input name="letter" required placeholder="e.g., 'A' Litter" className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-500 uppercase font-bold">Mating / Birth Date</label>
                <input name="birth_date" type="date" className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-sm" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-blue-400 uppercase font-bold">Sire (Father)</label>
              <select name="sire_id" onChange={(e) => setSireType(e.target.value)} className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-sm">
                <option value="null">-- Select Sire --</option>
                {potentialSires.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                <option value="other">Other (External stud)...</option>
              </select>
              {sireType === "other" && <input name="sire_name" placeholder="Type external stud full name" className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg mt-1" />}
            </div>

            <div className="space-y-1">
              <label className="text-pink-400 uppercase font-bold">Dam (Mother)</label>
              <select name="dam_id" onChange={(e) => setDamType(e.target.value)} className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-sm">
                <option value="null">-- Select Dam --</option>
                {potentialDams.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                <option value="other">Other (External female)...</option>
              </select>
              {damType === "other" && <input name="dam_name" placeholder="Type external dam full name" className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg mt-1" />}
            </div>

            <div className="space-y-1">
              <label className="text-zinc-500 uppercase font-bold">Státusz</label>
              <select name="status" className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-sm">
                <option value="Planning">Planning (Tervezett párosítás)</option>
                <option value="Born">Born (Megszületett alom)</option>
              </select>
            </div>

            <button type="submit" className="w-full bg-amber-500 text-black font-black uppercase p-3 rounded-xl transition">Save Litter Specification</button>
          </form>
        </div>
      )}

      {/* C FÜL: LITTER PROFILE & PUPPIES & AUTOMATED INCOME */}
      {activeTab === "litter-profile" && selectedLitter && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-amber-400">Litter "{selectedLitter.letter}" Dashboard</h1>
              <p className="text-xs text-zinc-500 font-mono mt-1">Státusz: {selectedLitter.status}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* KISKUTYÁK LISTÁJA */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-black text-zinc-400 uppercase">Puppies in this litter ({currentPuppies.length})</h3>
              <div className="grid grid-cols-1 gap-2">
                {currentPuppies.map((p) => (
                  <div key={p.id} className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white block">🎀 Nyakörv: {p.collar_color} ({p.gender})</span>
                      <span className="text-[10px] text-zinc-500 block font-mono">Születési súly: {p.birth_weight}g</span>
                      {p.buyer_name && <span className="text-[10px] text-emerald-400 font-bold block mt-1">Gazdi: {p.buyer_name} ({p.sale_price} EUR)</span>}
                    </div>

                    {p.current_status !== "Sold" ? (
                      /* ELADÁSI FORMA GAZDIVAL, AMI FINANCE INCOME-OT GENERÁL */
                      <form action={sellPuppyAction.bind(null, p.id, selectedLitter.id)} className="flex gap-2 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                        <input name="buyer_name" required placeholder="Gazdi neve" className="p-1 bg-black rounded border border-zinc-800 text-[11px]" />
                        <input name="sale_price" type="number" required placeholder="Ár (EUR)" className="w-16 p-1 bg-black rounded border border-zinc-800 text-[11px]" />
                        <input type="hidden" name="collar_color" value={p.collar_color} />
                        <button type="submit" className="bg-emerald-500 text-black px-2 py-1 font-bold rounded text-[10px] uppercase">Sell & Link Finance</button>
                      </form>
                    ) : (
                      <span className="bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] px-2 py-1 rounded uppercase font-bold">SOLD & SYNCED</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ÚJ KISKUTYA REGISZTRÁLÁSA AZ ALOMBA */}
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl h-fit space-y-3">
              <h3 className="text-xs font-black uppercase text-zinc-400">Add Puppy to Litter</h3>
              <form action={addPuppyAction.bind(null, selectedLitter.id)} className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-500 uppercase block mb-1">Collar Color / Markings</label>
                  <input name="collar_color" required placeholder="e.g., Zöld nyakörves" className="w-full p-2 bg-black border border-zinc-800 rounded-lg" />
                </div>
                <div>
                  <label className="text-zinc-500 uppercase block mb-1">Gender</label>
                  <select name="gender" className="w-full p-2 bg-black border border-zinc-800 rounded-lg">
                    <option value="Male">Male (Kan)</option>
                    <option value="Female">Female (Szuka)</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-500 uppercase block mb-1">Birth Weight (g)</label>
                  <input name="birth_weight" type="number" placeholder="450" className="w-full p-2 bg-black border border-zinc-800 rounded-lg" />
                </div>
                <button type="submit" className="w-full bg-amber-500 text-black font-bold uppercase py-2 rounded-lg">Add Puppy</button>
              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
