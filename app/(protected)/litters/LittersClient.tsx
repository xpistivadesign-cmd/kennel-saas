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

  // Külön kiszervezett kártya-renderelő függvény
  const renderLitterCard = (l: any) => {
    const isPlanned = l.status === "Tervezett" || l.status === "Planning" || l.status === "Pregnant";
    return (
      <div 
        key={l.id} 
        className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl flex flex-col justify-between hover:border-zinc-700 transition"
      >
        <button 
          type="button"
          onClick={() => { setSelectedLitterId(l.id); setActiveTab("litter-profile"); }}
          className="text-left w-full block focus:outline-none"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-amber-400">"{l.letter || 'Névtelen'}" Litter</h2>
            <span className={`text-[10px] font-mono px-2 py-1 rounded border uppercase ${isPlanned ? "bg-blue-950/60 border-blue-800 text-blue-400" : "bg-emerald-950/60 border-emerald-800 text-emerald-400"}`}>
              {l.status}
            </span>
          </div>
          
          <p className="text-xs text-zinc-400 mt-2">Apa: {l.sire_name || "Saját kan"} • Anya: {l.dam_name || "Saját szuka"}</p>
          
          <div className="mt-3 pt-3 border-t border-zinc-800/60 font-mono text-xs space-y-1">
            {isPlanned ? (
              <>
                <div className="text-zinc-400">
                  <span className="text-zinc-500 uppercase font-bold text-[10px] block">Fedeztetés időpontja:</span> 
                  {l.birth_date || "Nincs megadva"}
                </div>
                <div className="text-blue-400 font-bold">
                  <span className="text-blue-500 uppercase text-[10px] block mt-1">Várható ellés időpontja (+63 nap):</span> 
                  {calculateWhelpingDate(l.birth_date)}
                </div>
              </>
            ) : (
              <div className="text-emerald-400">
                <span className="text-zinc-500 uppercase font-bold text-[10px] block">Ellés időpontja:</span> 
                {l.birth_date || "Nincs megadva"}
              </div>
            )}
          </div>
        </button>

        <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-800 justify-end">
          {isPlanned && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleMarkAsBorn(l.id)}
              className="px-3 py-1.5 text-[10px] font-black uppercase bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
            >
              🎉 Megszületett
            </button>
          )}
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleDeleteLitter(l.id, l.letter)}
            className="px-3 py-1.5 text-[10px] font-black uppercase bg-zinc-800 border border-zinc-700 text-red-400 rounded-lg hover:bg-red-950/40 hover:border-red-900 transition disabled:opacity-50"
          >
            🗑️ Törlés
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      
      {/* ALMENÜ NAVIGÁCIÓ */}
      <div className="flex border-b border-zinc-800 gap-2 overflow-x-auto">
        <button type="button" onClick={() => { setActiveTab("directory"); setDbError(null); }} className={`px-4 py-2 text-xs font-black uppercase border-b-2 transition ${activeTab === "directory" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>📂 Litters Directory</button>
        <button type="button" onClick={() => { setActiveTab("planner"); setDbError(null); }} className={`px-4 py-2 text-xs font-black uppercase border-b-2 transition ${activeTab === "planner" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>🎯 Mating Planner</button>
        {selectedLitter && (
          <button type="button" onClick={() => { setActiveTab("litter-profile"); setDbError(null); }} className={`px-4 py-2 text-xs font-black uppercase border-b-2 transition ${activeTab === "litter-profile" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>🐶 {selectedLitter.letter} Litter Manager</button>
        )}
      </div>

      {/* ERROR DISPLAY */}
      {dbError && (
        <div className="bg-red-950/80 border border-red-800 p-4 rounded-xl text-xs text-red-300 font-mono">
          <span className="font-bold uppercase text-red-400 block mb-1">⚠️ HIBA DETEKTÁLVA:</span>
          {dbError}
        </div>
      )}

      {/* A FÜL: DIRECTORY */}
      {activeTab === "directory" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {litters.map((l) => renderLitterCard(l))}
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
                <input name="letter" required placeholder="e.g., 'A' Litter" className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-sm text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-500 uppercase font-bold">Mating / Birth Date</label>
                <input name="birth_date" type="date" className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-sm text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-blue-400 uppercase font-bold">Sire (Father)</label>
              <select name="sire_id" onChange={(e) => setSireType(e.target.value)} className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-sm text-white">
                <option value="null">-- Select Sire --</option>
                {potentialSires.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                <option value="other">Other (External stud)...</option>
              </select>
              {sireType === "other" && <input name="sire_name" placeholder="Type external stud full name" className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg mt-1 text-white" />}
            </div>

            <div className="space-y-1">
              <label className="text-pink-400 uppercase font-bold">Dam (Mother)</label>
              <select name="dam_id" onChange={(e) => setDamType(e.target.value)} className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-sm text-white">
                <option value="null">-- Select Dam --</option>
                {potentialDams.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                <option value="other">Other (External female)...</option>
              </select>
              {damType === "other" && <input name="dam_name" placeholder="Type external dam full name" className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg mt-1 text-white" />}
            </div>

            <div className="space-y-1">
              <label className="text-zinc-500 uppercase font-bold">Státusz</label>
              <select name="status" className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-sm text-white">
                <option value="Tervezett">Planning (Tervezett párosítás)</option>
                <option value="Ellés">Born (Megszületett alom)</option>
              </select>
            </div>

            <button type="submit" className="w-full bg-amber-500 text-black font-black uppercase p-3 rounded-xl transition">Save Litter Specification</button>
          </form>
        </div>
      )}

      {/* C FÜL: LITTER PROFILE */}
      {activeTab === "litter-profile" && selectedLitter && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-amber-400">Litter "{selectedLitter.letter}" Dashboard</h1>
              
              <div className="mt-2 text-xs font-mono flex flex-wrap gap-4 text-zinc-400">
                <div><span className="text-zinc-500 font-bold uppercase">Státusz:</span> {selectedLitter.status}</div>
                {selectedLitter.status === "Tervezett" || selectedLitter.status === "Planning" || selectedLitter.status === "Pregnant" ? (
                  <>
                    <div><span className="text-zinc-500 font-bold uppercase">Fedeztetés dátuma:</span> {selectedLitter.birth_date || "N/A"}</div>
                    <div className="text-blue-400 font-bold"><span className="text-blue-500 font-bold uppercase">Várható ellés:</span> {calculateWhelpingDate(selectedLitter.birth_date)}</div>
                  </>
                ) : (
                  <div className="text-emerald-400 font-bold"><span className="text-zinc-500 font-bold uppercase">Ellés időpontja:</span> {selectedLitter.birth_date || "N/A"}</div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {(selectedLitter.status === "Tervezett" || selectedLitter.status === "Planning" || selectedLitter.status === "Pregnant") && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleMarkAsBorn(selectedLitter.id)}
                  className="px-3 py-2 text-xs font-black uppercase bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
                >
                  🎉 Megszületett
                </button>
              )}
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDeleteLitter(selectedLitter.id, selectedLitter.letter)}
                className="px-3 py-2 text-xs font-black uppercase bg-zinc-800 border border-zinc-700 text-red-400 rounded-xl hover:bg-red-950/50 transition"
              >
                🗑️ Törlés
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-black text-zinc-400 uppercase">Puppies in this litter ({currentPuppies.length})</h3>
              
              {(selectedLitter.status === "Tervezett" || selectedLitter.status === "Planning" || selectedLitter.status === "Pregnant") && currentPuppies.length === 0 && (
                <div className="text-xs text-zinc-500 italic bg-zinc-900/30 p-4 border border-dashed border-zinc-800 rounded-xl">
                  Ez egy tervezett párosítás, kiskutyák rögzítése előtt válaszd ki a fenti "Megszületett" opciót a valós adatok szinkronizálásához.
                </div>
              )}

              <div className="grid grid-cols-1 gap-2">
                {currentPuppies.map((p) => (
                  <div key={p.id} className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white block">🎀 Jelölés/Nyakörv: {p.collar_color} ({p.gender === "Male" ? "Kan" : "Szuka"})</span>
                      <span className="text-[10px] text-zinc-500 block font-mono">Születési súly: {p.birth_weight}{p.weight_unit || 'g'}</span>
                      {p.buyer_name && <span className="text-[10px] text-emerald-400 font-bold block mt-1">Gazdi: {p.buyer_name} ({p.sale_price} EUR)</span>}
                    </div>

                    {p.status !== "Sold" ? (
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

            {/* MÓDOSÍTOTT ADD PUPPY FORM JELÖLÉSSEL ÉS AMERIKAI/EURÓPAI SÚLLYAL */}
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl h-fit space-y-3">
              <h3 className="text-xs font-black uppercase text-zinc-400">Add Puppy to Litter</h3>
              <form action={addPuppyAction.bind(null, selectedLitter.id)} className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-500 uppercase block mb-1">Collar Color / Markings / Name</label>
                  <input name="collar_color" required placeholder="e.g., Kék nyakörv / 'Kis foltos'" className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white" />
                </div>
                <div>
                  <label className="text-zinc-500 uppercase block mb-1">Gender</label>
                  <select name="gender" className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white">
                    <option value="Male">Male (Kan)</option>
                    <option value="Female">Female (Szuka)</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-500 uppercase block mb-1">Weight Unit (Súlytípus)</label>
                  <select name="weight_unit" className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white">
                    <option value="g">Európai (Gramm - g)</option>
                    <option value="oz">Amerikai (Uncia - oz)</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-500 uppercase block mb-1">Birth Weight</label>
                  <input name="birth_weight" type="number" placeholder="e.g., 450 vagy 15" className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white" />
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
