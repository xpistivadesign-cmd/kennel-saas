"use client";

import { 
  addHeatAction, 
  addMatingAction, 
  addWhelpingAction 
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

  // Segédfüggvény a várható ellési dátum kiszámításához (Mating + 63 nap)
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

      {/* 1. TÜZELÉSI CIKLUSOK (HEAT CYCLES) */}
      <div className="border-t border-zinc-800/60 pt-4 space-y-4">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Log Heat Cycle</h3>
        <form action={addHeatAction.bind(null, dogId)} className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-black/40 p-3 rounded-xl border border-zinc-900">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-500 uppercase">Start Date</label>
            <input name="start_date" type="date" required className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-500 uppercase">Notes / Observations</label>
            <input name="notes" placeholder="e.g., Swelling noticed, day 1" className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black text-xs uppercase py-2 rounded-lg transition h-[34px]">Record Heat</button>
          </div>
        </form>

        <div className="space-y-1.5 text-xs">
          {heatCycles?.map((h: any) => (
            <div key={h.id} className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900 flex justify-between items-center text-zinc-300">
              <div>
                Ciklus kezdete: <span className="font-bold text-white">{h.start_date}</span> 
                {h.notes && <span className="text-zinc-500 italic ml-2">({h.notes})</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. PROGESZTERON TESZTEK */}
      <div className="border-t border-zinc-800/60 pt-4 space-y-4">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Ovulation Tracking (Progesterone Tests)</h3>
        {/* Ide jön az a form, ami majd a progesterone_tests táblába ment, ha szükséges, de a propokat már biztonsággal lekezeli a TS */}
        <div className="space-y-1.5 text-xs">
          {progesteroneTests?.length > 0 ? (
            progesteroneTests.map((p: any) => {
              const isOptimal = p.progesterone >= 5 && p.progesterone <= 10;
              return (
                <div key={p.id} className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-900 flex justify-between items-center text-zinc-300">
                  <div>
                    Mérés: <span className="font-semibold text-zinc-500">{p.date || p.created_at?.split("T")[0]}</span> — <span className="font-bold text-white">{p.progesterone} ng/ml</span>
                  </div>
                  {isOptimal && (
                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider animate-pulse">
                      Optimal Breeding Window
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-zinc-600 italic text-xs">No blood hormone diagnostics uploaded yet.</p>
          )}
        </div>
      </div>

      {/* 3. FEDEZTETÉSEK (MATINGS) */}
      <div className="border-t border-zinc-800/60 pt-4 space-y-4">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Mating Records & Gestation Tracker</h3>
        <form action={addMatingAction.bind(null, dogId)} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-black/40 p-3 rounded-xl border border-zinc-900">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-500 uppercase">Sire / Stud Name</label>
            <input name="male_name" required placeholder="Stud dog's complete name" className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-500 uppercase">Mating Date</label>
            <input name="mating_date" type="date" required className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-500 uppercase">Notes</label>
            <input name="notes" placeholder="e.g., 20 minute tie" className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-black font-black text-xs uppercase py-2 rounded-lg transition h-[34px]">Log Coitus</button>
          </div>
        </form>

        <div className="space-y-2 text-xs">
          {matings?.map((m: any) => (
            <div key={m.id} className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-900 grid sm:grid-cols-2 gap-2 text-zinc-300">
              <div>
                Fedeztetés: <span className="font-bold text-white">{m.male_name}</span> kan kutyával<br />
                Dátum: <span className="text-zinc-400 font-mono">{m.date}</span> {m.notes && <span className="text-zinc-500 italic">({m.notes})</span>}
              </div>
              <div className="sm:text-right flex sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Expected Due Date (63d):</span>
                <span className="text-amber-400 font-black tracking-wide bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 mt-0.5">{getExpectedWhelpingDate(m.date)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. ELLÉS (WHELPING / LITTER REGISTRATION) */}
      <div className="border-t border-zinc-800/60 pt-4 space-y-4">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Register Whelping Event (Litter Registry)</h3>
        <form action={addWhelpingAction.bind(null, dogId)} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-black/40 p-3 rounded-xl border border-zinc-900">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-500 uppercase">Litter Name / Letter</label>
            <input name="litter_name" required placeholder="e.g., 'A' Litter" className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-500 uppercase">Whelping Birthdate</label>
            <input name="birth_date" type="date" required className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-500 uppercase">Live Born</label>
            <input name="live_puppies" type="number" defaultValue="0" min="0" className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-500 uppercase">Stillborn</label>
            <input name="dead_puppies" type="number" defaultValue="0" min="0" className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-xs text-white" />
          </div>
          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs uppercase py-2 rounded-lg transition col-span-full mt-2">
            Execute Litter Birth Registration
          </button>
        </form>
      </div>

    </div>
  );
}
