"use client";

import { addGlobalHeatAction } from "./actions";

interface Props {
  heatCycles: any[];
  femaleDogs: any[];
}

export default function HeatsClient({ heatCycles, femaleDogs }: Props) {
  return (
    <div className="min-h-screen bg-black text-white p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* BAL OLDAL: TÜZELÉSEK TISZTA LISTÁJA */}
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-2xl font-black uppercase text-amber-400 tracking-wider">Heat Cycles Directory</h1>
        <div className="grid grid-cols-1 gap-3">
          {heatCycles && heatCycles.length > 0 ? (
            heatCycles.map((heat: any) => (
              <div key={heat.id} className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-xl block">
                <div className="flex justify-between items-center">
                  <div>
                    {/* ✅ BIZTOSAN A KUTYA NEVE JELENIK MEG */}
                    <h2 className="text-lg font-bold text-white">
                      🐾 {heat.dog_name}
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1">
                      Ciklus kezdete: <span className="text-pink-400 font-mono font-bold">{heat.start_date}</span>
                    </p>
                  </div>
                  {heat.notes && (
                    <span className="text-zinc-400 text-xs italic bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-900 max-w-xs truncate">
                      {heat.notes}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-zinc-600 italic text-xs">No active heat cycles logged in the database.</p>
          )}
        </div>
      </div>

      {/* JOBB OLDAL: PROFI FORM */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl h-fit space-y-4">
        <h2 className="text-base font-black uppercase tracking-wider text-zinc-300">Log New Heat</h2>
        
        <form action={addGlobalHeatAction} className="space-y-4 text-xs">
          {/* Szuka választó - Kizárólag Female kutyák! */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500">Select Female Dog</label>
            <select 
              name="dog_id" 
              required
              className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-sm text-white focus:border-amber-500 outline-none transition"
            >
              <option value="">-- Choose Female --</option>
              {femaleDogs?.map((dog: any) => (
                <option key={dog.id} value={dog.id}>🎀 {dog.name}</option>
              ))}
            </select>
          </div>

          {/* Dátum */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500">Start Date</label>
            <input name="start_date" type="date" required className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-sm text-white focus:border-amber-500 outline-none transition" />
          </div>

          {/* Jegyzet */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500">Notes / Symptoms</label>
            <input name="notes" placeholder="e.g., Bleeding started, swelling" className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-sm text-white focus:border-amber-500 outline-none transition" />
          </div>

          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black uppercase text-xs p-3 rounded-xl transition mt-4 shadow-lg shadow-amber-500/5">
            Add Heat Record
          </button>
        </form>
      </div>

    </div>
  );
}
