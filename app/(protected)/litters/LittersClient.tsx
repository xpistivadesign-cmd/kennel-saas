"use client";

import { useState, useEffect } from "react";
import { createLitterAction, addPuppyAction, sellPuppyAction, markLitterAsBornAction, deleteLitterAction } from "./actions";

export default function LittersClient({ litters, puppies, potentialSires, potentialDams, activeLitterId }: any) {
  const [activeTab, setActiveTab] = useState("directory");
  const [selectedLitterId, setSelectedLitterId] = useState<string | null>(activeLitterId || litters[0]?.id || null);
  const [sireType, setSireType] = useState("");
  const [damType, setDamType] = useState("");
  const [dbError, setDbError] = useState<string | null>(null);

  const [localPuppies, setLocalPuppies] = useState<any[]>(puppies);
  const [formCollar, setFormCollar] = useState("");
  const [formGender, setFormGender] = useState("Male");
  const [formWeightUnit, setFormWeightUnit] = useState("g");
  const [formBirthWeight, setFormBirthWeight] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { setLocalPuppies(puppies); }, [puppies]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("error")) setDbError(decodeURIComponent(p.get("error")!));
      if (p.get("id")) { setSelectedLitterId(p.get("id")); setActiveTab("litter-profile"); }
    }
  }, [litters]);

  const selectedLitter = litters.find((l: any) => l.id === selectedLitterId);
  const currentPuppies = localPuppies.filter((p) => p.litter_id === selectedLitterId);

  const handleMarkAsBorn = async (id: string) => {
    const d = prompt("Ellés dátuma (ÉÉÉÉ-HH-NN):", new Date().toISOString().split("T")[0]);
    if (d) { await markLitterAsBornAction(id, d); alert("Frissítve! 🎉"); }
  };

  const handleDeleteLitter = async (id: string, name: string) => {
    if (confirm(`Törlöd a(z) "${name}" almot?`)) { await deleteLitterAction(id); setSelectedLitterId(null); setActiveTab("directory"); }
  };

  const handleAddPuppyForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLitterId || !formCollar.trim()) return;
    setLoading(true);

    const puppyData = {
      litter_id: selectedLitterId,
      collar_color: formCollar.trim(),
      gender: formGender,
      weight_unit: formWeightUnit,
      birth_weight: parseInt(formBirthWeight || "0", 10)
    };

    // Azonnali helyi frissítés a képernyőn
    const tempObj = { ...puppyData, id: "temp-" + Date.now(), status: "Elérhető" };
    setLocalPuppies((prev) => [...prev, tempObj]);

    try {
      await addPuppyAction(puppyData);
      setFormCollar("");
      setFormBirthWeight("");
    } catch (err: any) {
      setDbError(err.message || "Hiba a mentés során.");
      setLocalPuppies((prev) => prev.filter((p) => p.id !== tempObj.id));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      <div className="flex border-b border-zinc-800 gap-2">
        <button type="button" onClick={() => setActiveTab("directory")} className={`px-4 py-2 text-xs font-black uppercase border-b-2 ${activeTab === "directory" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>📂 Directory</button>
        <button type="button" onClick={() => setActiveTab("planner")} className={`px-4 py-2 text-xs font-black uppercase border-b-2 ${activeTab === "planner" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>🎯 Planner</button>
        {selectedLitter && <button type="button" onClick={() => setActiveTab("litter-profile")} className={`px-4 py-2 text-xs font-black uppercase border-b-2 ${activeTab === "litter-profile" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>🐶 "{selectedLitter.letter}" Manager</button>}
      </div>

      {dbError && <div className="bg-red-950 border border-red-800 p-4 rounded-xl text-xs text-red-300">⚠️ {dbError}</div>}

      {activeTab === "directory" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {litters.map((l: any) => (
            <div key={l.id} className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl flex flex-col justify-between">
              <button type="button" onClick={() => { setSelectedLitterId(l.id); setActiveTab("litter-profile"); }} className="text-left w-full block">
                <div className="flex justify-between items-center"><h2 className="text-xl font-black text-amber-400">"{l.letter}" Litter</h2><span className="text-[10px] px-2 py-1 rounded bg-zinc-800 text-zinc-400">{l.status}</span></div>
                <p className="text-xs text-zinc-400 mt-2">Apa: {l.sire_name || "Saját"} • Anya: {l.dam_name || "Saját"}</p>
                <p className="text-xs text-zinc-500 font-mono mt-1">Dátum: {l.birth_date || "Nincs megadva"}</p>
              </button>
              <div className="flex gap-2 mt-4 justify-end">
                {(l.status === "Tervezett" || l.status === "Planning") && <button type="button" onClick={() => handleMarkAsBorn(l.id)} className="px-3 py-1.5 text-[10px] font-black bg-emerald-600 rounded-lg">🎉 Megszületett</button>}
                <button type="button" onClick={() => handleDeleteLitter(l.id, l.letter)} className="px-3 py-1.5 text-[10px] font-black bg-zinc-800 text-red-400 rounded-lg">🗑️ Törlés</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "planner" && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-2xl">
          <h2 className="text-lg font-black uppercase text-amber-400 mb-4">Plan New Litter</h2>
          <form action={createLitterAction} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-zinc-500 uppercase font-bold block mb-1">Litter Letter</label><input name="letter" required placeholder="e.g., A" className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-white" /></div>
              <div><label className="text-zinc-500 uppercase font-bold block mb-1">Date</label><input name="birth_date" type="date" className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-white" /></div>
            </div>
            <div>
              <label className="text-blue-400 font-bold block mb-1">Sire (Father)</label>
              <select name="sire_id" onChange={(e) => setSireType(e.target.value)} className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-white">
                <option value="null">-- Select --</option>
                {potentialSires.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                <option value="other">Other...</option>
              </select>
              {sireType === "other" && <input name="sire_name" placeholder="External sire name" className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg mt-1 text-white" />}
            </div>
            <div>
              <label className="text-pink-400 font-bold block mb-1">Dam (Mother)</label>
              <select name="dam_id" onChange={(e) => setDamType(e.target.value)} className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-white">
                <option value="null">-- Select --</option>
                {potentialDams.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                <option value="other">Other...</option>
              </select>
              {damType === "other" && <input name="dam_name" placeholder="External dam name" className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg mt-1 text-white" />}
            </div>
            <div><label className="text-zinc-500 font-bold block mb-1">Státusz</label><select name="status" className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-white"><option value="Tervezett">Planning (Tervezett)</option><option value="Ellés">Born (Megszületett)</option></select></div>
            <button type="submit" className="w-full bg-amber-500 text-black font-black uppercase p-3 rounded-xl">Save Litter</button>
          </form>
        </div>
      )}

      {activeTab === "litter-profile" && selectedLitter && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h1 className="text-2xl font-black text-amber-400">"{selectedLitter.letter}" Litter Manager</h1>
            <div className="space-y-2">
              {currentPuppies.map((p) => (
                <div key={p.id} className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white block">🎀 {p.collar_color} ({p.gender === "Male" ? "Kan" : "Szuka"})</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Súly: {p.birth_weight}{p.weight_unit}</span>
                  </div>
                  {p.status !== "Sold" ? (
                    <form action={sellPuppyAction.bind(null, p.id, selectedLitter.id)} className="flex gap-2">
                      <input name="buyer_name" required placeholder="Gazdi" className="p-1 bg-black rounded border border-zinc-800 text-[11px] w-24" />
                      <input name="sale_price" type="number" required placeholder="EUR" className="w-16 p-1 bg-black rounded border border-zinc-800 text-[11px]" />
                      <button type="submit" className="bg-emerald-500 text-black px-2 py-1 font-bold rounded text-[10px]">SELL</button>
                    </form>
                  ) : <span className="text-zinc-500 font-bold uppercase text-[10px]">SOLD</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl h-fit space-y-3">
            <h3 className="text-xs font-black uppercase text-zinc-400">Add Puppy</h3>
            <form onSubmit={handleAddPuppyForm} className="space-y-3 text-xs">
              <div><label className="text-zinc-500 uppercase block mb-1">Collar / Markings</label><input value={formCollar} onChange={(e) => setFormCollar(e.target.value)} required placeholder="e.g., Kék nyakörv" className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white" /></div>
              <div><label className="text-zinc-500 uppercase block mb-1">Gender</label><select value={formGender} onChange={(e) => setFormGender(e.target.value)} className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white"><option value="Male">Male (Kan)</option><option value="Female">Female (Szuka)</option></select></div>
              <div><label className="text-zinc-500 uppercase block mb-1">Unit</label><select value={formWeightUnit} onChange={(e) => setFormWeightUnit(e.target.value)} className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white"><option value="g">Gramm (g)</option><option value="oz">Uncia (oz)</option></select></div>
              <div><label className="text-zinc-500 uppercase block mb-1">Weight</label><input value={formBirthWeight} onChange={(e) => setFormBirthWeight(e.target.value)} type="number" placeholder="450" className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white" /></div>
              <button type="submit" disabled={loading} className="w-full bg-amber-500 text-black font-bold uppercase py-2 rounded-lg disabled:opacity-50">{loading ? "Saving..." : "Add Puppy"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
