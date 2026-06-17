"use client";
import { useState, useEffect } from "react";
import { 
  createLitterAction, 
  addPuppyAction, 
  sellPuppyAction, 
  markLitterAsBornAction, 
  deleteLitterAction 
} from "./actions";

export default function LittersClient({ 
  litters, 
  puppies, 
  potentialSires, 
  potentialDams, 
  activeLitterId 
}: any) {
  const [tab, setTab] = useState("directory");
  const [selId, setSelId] = useState<string | null>(
    activeLitterId || litters[0]?.id || null
  );
  const [sireType, setSireType] = useState("");
  const [damType, setDamType] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pugs, setPugs] = useState<any[]>(puppies);
  const [fc, setFc] = useState("");
  const [fg, setFg] = useState("Male");
  const [fw, setFw] = useState("g");
  const [fb, setFb] = useState("");
  const [load, setLoad] = useState(false);

  // Amikor a szerverről új adatok jönnek (pl. sell vagy delete után)
  useEffect(() => { 
    if (puppies) setPugs(puppies); 
  }, [puppies]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("error")) {
        setErr(decodeURIComponent(p.get("error")!));
      }
      if (p.get("id")) { 
        setSelId(p.get("id")); 
        setTab("litter-profile"); 
      }
    }
  }, [litters]);

  const litter = litters.find(
    (l: any) => l.id === selId
  );
  const currentPuppies = pugs.filter(
    (p) => p.litter_id === selId
  );

  const onBorn = async (id: string) => {
    const d = prompt(
      "Dátum (ÉÉÉÉ-HH-NN):", 
      new Date().toISOString().split("T")[0]
    );
    if (d) { 
      await markLitterAsBornAction(id, d); 
      alert("Kész! 🎉"); 
    }
  };

  const onDel = async (id: string, n: string) => {
    if (confirm(`Törlöd: ${n}?`)) { 
      await deleteLitterAction(id); 
      setSelId(null); 
      setTab("directory"); 
    }
  };

  const onAddPuppy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selId || !fc.trim()) return;
    setLoad(true); 
    setErr(null);
    
    const pData = { 
      litter_id: selId, 
      collar_color: fc.trim(), 
      gender: fg, 
      weight_unit: fw, 
      birth_weight: parseInt(fb || "0", 10) 
    };
    
    const tempId = "t-" + Date.now();
    const temp = { 
      ...pData, 
      id: tempId, 
      status: "Elérhető" 
    };
    
    // Először betesszük az ideiglenes elemet (Optimistic UI)
    setPugs((prev) => [...prev, temp]);
    
    try {
      const savedPuppy = await addPuppyAction(pData);
      
      // Ha sikeres, kicseréljük az ideiglenes elemet a szervertől kapottra
      if (savedPuppy) {
        setPugs((prev) => 
          prev.map((p) => p.id === tempId ? savedPuppy : p)
        );
      }
      setFc(""); 
      setFb("");
    } catch (e: any) {
      alert("HIBA: " + (e.message || "Hiba!"));
      setErr(e.message);
      // Hiba esetén kiszedjük az ideiglenes elemet a listából
      setPugs((prev) => prev.filter((x) => x.id !== tempId));
    } finally { 
      setLoad(false); 
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 space-y-4 text-xs">
      <div className="flex border-b border-zinc-800 gap-2">
        <button 
          onClick={() => setTab("directory")} 
          className={`p-2 uppercase font-bold ${
            tab === "directory" 
              ? "text-amber-400 border-b-2 border-amber-500" 
              : "text-zinc-500"
          }`}
        >
          📂 Directory
        </button>
        <button 
          onClick={() => setTab("planner")} 
          className={`p-2 uppercase font-bold ${
            tab === "planner" 
              ? "text-amber-400 border-b-2 border-amber-500" 
              : "text-zinc-500"
          }`}
        >
          🎯 Planner
        </button>
        {litter && (
          <button 
            onClick={() => setTab("litter-profile")} 
            className={`p-2 uppercase font-bold ${
              tab === "litter-profile" 
                ? "text-amber-400 border-b-2 border-amber-500" 
                : "text-zinc-500"
            }`}
          >
            🐶 "{litter.letter}" Manager
          </button>
        )}
      </div>

      {err && (
        <div className="bg-red-950 p-3 rounded border border-red-800 text-red-300">
          ⚠️ {err}
        </div>
      )}

      {tab === "directory" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {litters.map((l: any) => (
            <div 
              key={l.id} 
              className="bg-zinc-900 border border-zinc-800 p-4 rounded flex flex-col justify-between"
            >
              <button 
                onClick={() => { 
                  setSelId(l.id); 
                  setTab("litter-profile"); 
                }} 
                className="text-left block w-full"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-amber-400">
                    "{l.letter}"
                  </h2>
                  <span className="p-1 bg-zinc-800 text-zinc-400 rounded text-[10px]">
                    {l.status}
                  </span>
                </div>
                <p className="text-zinc-400 mt-1">
                  Apa: {l.sire_name || "Saját"} • Anya: {l.dam_name || "Saját"}
                </p>
                <p className="text-zinc-500 font-mono mt-1">
                  Dátum: {l.birth_date || "Nincs"}
                </p>
              </button>
              <div className="flex gap-2 mt-3 justify-end">
                {(l.status === "Tervezett" || l.status === "Planning") && (
                  <button 
                    onClick={() => onBorn(l.id)} 
                    className="bg-emerald-600 px-2 py-1 rounded font-bold"
                  >
                    🎉 Megszületett
                  </button>
                )}
                <button 
                  onClick={() => onDel(l.id, l.letter)} 
                  className="bg-zinc-800 text-red-400 px-2 py-1 rounded font-bold"
                >
                  🗑️ Törlés
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "planner" && (
        <form 
          action={createLitterAction} 
          className="bg-zinc-900 p-4 rounded border border-zinc-800 max-w-md space-y-3"
        >
          <h2 className="text-sm font-bold text-amber-400 uppercase">
            Plan New Litter
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-zinc-500 block mb-1">Letter</label>
              <input 
                name="letter" 
                required 
                placeholder="A" 
                className="w-full p-2 bg-black border border-zinc-800 rounded" 
              />
            </div>
            <div>
              <label className="text-zinc-500 block mb-1">Date</label>
              <input 
                name="birth_date" 
                type="date" 
                className="w-full p-2 bg-black border border-zinc-800 rounded" 
              />
            </div>
          </div>
          <div>
            <label className="text-blue-400 block mb-1">Sire (Father)</label>
            <select 
              name="sire_id" 
              onChange={(e) => setSireType(e.target.value)} 
              className="w-full p-2 bg-black border border-zinc-800 rounded"
            >
              <option value="null">-- Select --</option>
              {potentialSires.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
              <option value="other">Other...</option>
            </select>
            {sireType === "other" && (
              <input 
                name="sire_name" 
                placeholder="External sire" 
                className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded mt-1" 
              />
            )}
          </div>
          <div>
            <label className="text-pink-400 block mb-1">Dam (Mother)</label>
            <select 
              name="dam_id" 
              onChange={(e) => setDamType(e.target.value)} 
              className="w-full p-2 bg-black border border-zinc-800 rounded"
            >
              <option value="null">-- Select --</option>
              {potentialDams.map((d: any) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
              <option value="other">Other...</option>
            </select>
            {damType === "other" && (
              <input 
                name="dam_name" 
                placeholder="External dam" 
                className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded mt-1" 
              />
            )}
          </div>
          <div>
            <label className="text-zinc-500 block mb-1">Státusz</label>
            <select 
              name="status" 
              className="w-full p-2 bg-black border border-zinc-800 rounded"
            >
              <option value="Tervezett">Planning</option>
              <option value="Ellés">Born</option>
            </select>
          </div>
          <button 
            type="submit" 
            className="w-full bg-amber-500 text-black font-bold p-2 rounded uppercase"
          >
            Save Litter
          </button>
        </form>
      )}

      {tab === "litter-profile" && litter && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <h1 className="text-lg font-bold text-amber-400">
              "{litter.letter}" Manager
            </h1>
            <div className="space-y-2">
              {currentPuppies.map((p) => (
                <div 
                  key={p.id} 
                  className="bg-zinc-950 border border-zinc-900 p-3 rounded flex justify-between items-center"
                >
                  <div>
                    <span className="font-bold block">
                      🎀 {p.collar_color} ({p.gender === "Male" ? "Kan" : "Szuka"})
                    </span>
                    <span className="text-zinc-500 font-mono text-[10px]">
                      Súly: {p.birth_weight}{p.weight_unit}
                    </span>
                  </div>
                  {p.status !== "Sold" ? (
                    <form 
                      action={sellPuppyAction.bind(null, p.id, litter.id)} 
                      className="flex gap-1"
                    >
                      <input 
                        name="buyer_name" 
                        required 
                        placeholder="Gazdi" 
                        className="p-1 bg-black rounded border border-zinc-800 w-20 text-[11px]" 
                      />
                      <input 
                        name="sale_price" 
                        type="number" 
                        required 
                        placeholder="EUR" 
                        className="w-12 p-1 bg-black rounded border border-zinc-800 text-[11px]" 
                      />
                      <button 
                        type="submit" 
                        className="bg-emerald-500 text-black px-2 py-1 font-bold rounded text-[10px]"
                      >
                        SELL
                      </button>
                    </form>
                  ) : (
                    <span className="text-zinc-500 font-bold uppercase text-[10px]">
                      SOLD
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <form 
            onSubmit={onAddPuppy} 
            className="bg-zinc-900 border border-zinc-800 p-4 rounded h-fit space-y-2"
          >
            <h3 className="font-bold text-zinc-400 uppercase">
              Add Puppy
            </h3>
            <div>
              <label className="text-zinc-500 block mb-0.5">
                Collar / Markings
              </label>
              <input 
                value={fc} 
                onChange={(e) => setFc(e.target.value)} 
                required 
                placeholder="Kék nyakörv" 
                className="w-full p-1.5 bg-black border border-zinc-800 rounded" 
              />
            </div>
            <div>
              <label className="text-zinc-500 block mb-0.5">
                Gender
              </label>
              <select 
                value={fg} 
                onChange={(e) => setFg(e.target.value)} 
                className="w-full p-1.5 bg-black border border-zinc-800 rounded"
              >
                <option value="Male">Kan</option>
                <option value="Female">Szuka</option>
              </select>
            </div>
            <div>
              <label className="text-zinc-500 block mb-0.5">
                Unit
              </label>
              <select 
                value={fw} 
                onChange={(e) => setFw(e.target.value)} 
                className="w-full p-1.5 bg-black border border-zinc-800 rounded"
              >
                <option value="g">Gramm (g)</option>
                <option value="oz">Uncia (oz)</option>
              </select>
            </div>
            <div>
              <label className="text-zinc-500 block mb-0.5">
                Weight
              </label>
              <input 
                value={fb} 
                onChange={(e) => setFb(e.target.value)} 
                type="number" 
                placeholder="450" 
                className="w-full p-1.5 bg-black border border-zinc-800 rounded" 
              />
            </div>
            <button 
              type="submit" 
              disabled={load} 
              className="w-full bg-amber-500 text-black font-bold py-1.5 rounded uppercase disabled:opacity-50"
            >
              {load ? "Saving..." : "Add Puppy"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
