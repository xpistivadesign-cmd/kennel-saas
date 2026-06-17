"use client";

import { useState, useEffect, useTransition } from "react";
import { createLitterAction, addPuppyAction, sellPuppyAction, markLitterAsBornAction, deleteLitterAction } from "./actions";

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
  const [dbError, setDbError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // URL-ből kiolvassuk, ha van error paraméter
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const err = params.get("error");
      if (err) {
        setDbError(decodeURIComponent(err));
        setActiveTab("planner"); // Ha hiba volt, ugorjon vissza a tervezőhöz
      }
    }
  }, []);

  const selectedLitter = litters.find((l) => l.id === selectedLitterId);
  const currentPuppies = puppies.filter((p) => p.litter_id === selectedLitterId);

  // Segédfüggvény a +63 napos várható ellés kiszámításához
  const calculateWhelpingDate = (dateString: string) => {
    if (!dateString) return "Nincs megadva";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Érvénytelen dátum";
    date.setDate(date.getDate() + 63);
    return date.toISOString().split("T")[0];
  };

  // Kezelő a státusz "Ellés"-re váltásához
  const handleMarkAsBorn = async (litterId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const actualDate = prompt("Kérlek, add meg a tényleges ellés dátumát (ÉÉÉÉ-HH-NN):", today);
    
    if (actualDate && actualDate.trim() !== "") {
      startTransition(async () => {
        try {
          await markLitterAsBornAction(litterId, actualDate.trim());
          setDbError(null);
          alert("Alom státusza sikeresen frissítve Ellés-re! 🎉");
        } catch (err: any) {
          setDbError(err.message);
        }
      });
    }
  };

  // Kezelő az alom törléséhez
  const handleDeleteLitter = async (litterId: string, letter: string) => {
    if (confirm(`Biztosan törölni szeretnéd a(z) "${letter}" almot és minden adatát a listából?`)) {
      startTransition(async () => {
        try {
          await deleteLitterAction(litterId);
          if (selectedLitterId === litterId) {
            setSelectedLitterId(null);
            setActiveTab("directory");
          }
          setDbError(null);
          alert("Alom sikeresen törölve a rendszerből. 🗑️");
        } catch (err: any) {
          setDbError(err.message);
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      
      {/* ALMENÜ NAVIGÁCIÓ */}
      <div className="flex border-b border-zinc-800 gap-2 overflow-x-auto">
        <button onClick={() => { setActiveTab("directory"); setDbError(null); }} className={`px-4 py-2 text-xs font-black uppercase border-b-2 transition ${activeTab === "directory" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>📂 Litters Directory</button>
        <button onClick={() => setActiveTab("planner")} className={`px-4 py-2 text-xs font-black uppercase border-b-2 transition ${activeTab === "planner" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>🎯 Mating Planner</button>
        {selectedLitter && (
          <button onClick={() => { setActiveTab("litter-profile"); setDbError(null); }} className={`px-4 py-2 text-xs font-black uppercase border-b-2 transition ${activeTab === "litter-profile" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>🐶 {selectedLitter.letter} Litter Manager</button>
        )}
      </div>

      {/* ERROR DISPLAY */}
      {dbError && (
        <div className="bg-red-950/80 border border-red-800 p-4 rounded-xl text-xs text-red-300 font-mono">
          <span className="font-bold uppercase text-red-400 block mb-1">⚠️ SÉMA VAGY ADATBÁZIS HIBA DETEKTÁLVA:</span>
          {dbError}
        </div>
      )}

      {/* A FÜL: DIRECTORY */}
      {activeTab === "directory" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {litters.map((l) => {
            const isPlanned = l.status === "Tervezett";
            return (
              <div 
                key={l.id} 
                className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl flex flex-col justify-between hover:border-zinc-700 transition"
              >
                <button 
                  onClick={() => { setSelectedLitterId(l.id); setActiveTab("litter-profile"); }}
                  className="text-left w-full block focus:outline-none"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-amber-400">"{l.letter}" Litter</h2>
                    <span className={`text-[10px] font-mono px-2 py-1 rounded border uppercase ${isPlanned ? "bg-blue-950/60 border-blue-800 text-blue-400" : "bg-emerald-950/60 border-emerald-800 text-emerald-400"}`}>
                      {l.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2">Apa: {l.sire_name || "Saját kan"} • Anya: {l.dam_name || "Saját szuka"}</p>
                  
                  {/* Dinamikus Dátum Megjelenítés */}
                  <div className="mt-3 pt-3 border-t border-zinc-800/60 font-mono text-xs space-y-1">
                    {isPlanned ? (
                      <>
                        <p className="text-zinc-400"><span className="text-zinc-500 uppercase font-bold text-[10px] block">Fedeztetés időpontja:</span> {l.birth_date || "Nincs megadva"}</p>
                        <p className="text-blue-400 font-bold"><span className="text-blue-500 uppercase text-[10px] block mt-1">Várható ellés időpontja (+63 nap):</span> {calculateWhelpingDate(l.birth_date)}</p>
                      </>
                    ) : (
                      <p className="text-emerald-400"><span className="text-zinc-500 uppercase font-bold text-[10px] block">Ellés időpontja:</span> {l.birth_date || "Nincs megadva"}</p>
                    )}
                  </div>
                </button>

                {/* Akciógombok a kártya alján */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-800 justify-end">
                  {isPlanned && (
                    <button
                      disabled={isPending}
                      onClick={() => handleMarkAsBorn(l.id)}
                      className="px-3 py-1.5 text-[10px] font-black uppercase bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      🎉 Megszületett
                    </button>
                  )}
                  <button
                    disabled={isPending}
                    onClick={() => handleDeleteLitter(l.id, l.letter)}
                    className="px-3 py-1.5 text-[10px] font-black uppercase bg-zinc-800 border border-zinc-700 text-red-400 rounded-lg hover:bg-red-950/40 hover:border-red-900 transition disabled:opacity-50"
                  >
                    🗑️ Törlés
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* B FÜL: MATING PLANNER FORMA */}
      {activeTab === "planner" && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-2xl">
          <h2 className="text-lg font-black uppercase text-amber-400 mb-4">Plan & Register New Mating / Litter</h2>
          <form action={createLitterAction} className="space-y-4 text-xs">
