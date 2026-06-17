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
    setDbError(null);

    const puppyData = {
      litter_id: selectedLitterId,
      collar_color: formCollar.trim(),
      gender: formGender,
      weight_unit: formWeightUnit,
      birth_weight: parseInt(formBirthWeight || "0", 10)
    };

    // Azonnali helyi frissítés a képernyőn (Optimistic UI)
    const tempObj = { ...puppyData, id: "temp-" + Date.now(), status: "Elérhető" };
    setLocalPuppies((prev) => [...prev, tempObj]);

    try {
      // Beküldés a háttérbe (Server Action)
      await addPuppyAction(puppyData);
      setFormCollar("");
      setFormBirthWeight("");
    } catch (err: any) {
      console.error("Hiba a mentés során:", err);
      
      // HA ELTŰNIK A KUTYA, EZ A POPUP FOGJA KIÍRNI A PONTOS ADATBÁZIS HIBÁT:
      alert("ADATBÁZIS MENTÉSI HIBA:\n" + (err.message || "A szerver visszadobta a kérést ismeretlen okból. Ellenőrizd az RLS szabályokat vagy az actions.ts-t!"));
      
      setDbError(err.message || "Hiba a mentés során.");
      // Ha elhasalt a szerveren a mentés, töröljük a lokális listából a hibás elemet
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
                {(l.status === "Tervezett" || l.
