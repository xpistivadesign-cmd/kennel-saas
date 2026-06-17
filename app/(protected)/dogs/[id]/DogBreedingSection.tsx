"use client";

import { 
  addHeatAction, 
  addProgesteroneAction,
  addMatingAction 
} from "./actions";

interface Props {
  dogId: string;
  heatCycles: any[];
  progesteroneTests: any[];
  matings: any[];
}

export default function DogBreedingSection({ 
  dogId, 
  heatCycles, 
  progesteroneTests, 
  matings 
}: Props) {

  const getExpectedWhelpingDate = (matingDateStr: string) => {
    if (!matingDateStr) return "N/A";
    try {
      const d = new Date(matingDateStr);
      d.setDate(d.getDate() + 63);
      return d.toISOString().split("T")[0];
    } catch (e) {
      return "Invalid Date";
    }
  };

  return (
    <div className="space-y-8 bg-zinc-900/20 border border-zinc-800/80 p-6 rounded-2xl">
      <h2 className="text-lg font-black uppercase tracking-wider text-amber-400">🐾 Active Breeding Logs & Fertility Management</h2>

      {/* 1. HEAT CYCLES */}
      <div className="border-t border-zinc-800/60 pt-4 space-y-4">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Log Heat Cycle</h3>
        <form action={addHeatAction.bind(null, dogId)} className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-black/40 p-3 rounded-xl border border-zinc-900">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-500 uppercase">Start Date</label>
            <input name="start_date" type="date" required className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-500 uppercase">Notes</label>
            <input name="notes" placeholder="e.g., Day 1 swelling" className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black text-xs uppercase py-2 rounded-lg transition h-[34px]">Add Heat</button>
          </div>
        </form>

        <div className="space-y-1.5 text-xs">
          {heatCycles?.map((h: any) => (
            <div key={h.id} className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900 flex justify-between items-center text-zinc-300">
              <div>Ciklus kezdete: <span className="font-bold text-white">{h.start_date}</span> {h.notes && <span className="text-zinc-500 italic ml-2">({h.notes})</span>}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. PROGESZTERON */}
      <div className="border-t border-zinc-800/60 pt-4 space-y-4">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Ovulation Tracking (Progesterone)</h3>
        <form action={addProgesteroneAction.bind(null, dogId)} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-black/40 p-3 rounded-xl border border-zinc-900">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-500 uppercase">Date</label>
            <input name="date" type="date" required className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-500 uppercase">Value (ng/ml)</label>
            <input name="progesterone" type="number" step="0.1" required placeholder="e.g., 5.4" className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-500 uppercase">Notes</label>
            <input name="notes" placeholder="Notes" className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase py-2 rounded-lg transition h-[34px]">Add Test</button>
          </div>
        </form>

        <div className="space-y-1.5 text-xs">
          {progesteroneTests?.map((p: any) => (
            <div key={p.id} className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900 flex justify-between items-center text-zinc-300">
              <div>Dátum: <span className="text-zinc-400">{p.date}</span> — Érték: <span className="font-bold text-white">{p.progesterone} ng/ml</span> {p.notes && <span className="text-zinc-500 italic ml-2">({p.notes})</span>}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. MATINGS */}
      <div className="border-t border-zinc-800/60 pt-4 space-y-4">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Mating Records</h3>
        <form action={addMatingAction.bind(null, dogId)} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-black/40 p-3 rounded-xl border border-zinc-900">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-500 uppercase">Sire / Stud Name</label>
            <input name="male_name" required placeholder="Stud name" className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-500 uppercase">Mating Date</label>
            <input name="mating_date" type="date" required className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-500 uppercase">Notes</label>
            <input name="notes" placeholder="Tie notes" className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase py-2 rounded-lg transition h-[34px]">Add Mating</button>
          </div>
        </form>

        <div className="space-y-2 text-xs">
          {matings?.map((m: any) => (
            <div key={m.id} className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-900 grid sm:grid-cols-2 gap-2 text-zinc-300">
              <div>Stud: <span className="font-bold text-white">{m.male_name}</span> | Dátum: <span className="text-zinc-400 font-mono">{m.date}</span></div>
              <div className="sm:text-right text-amber-400 font-bold text-[11px]">Expected Due: {getExpectedWhelpingDate(m.date)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
