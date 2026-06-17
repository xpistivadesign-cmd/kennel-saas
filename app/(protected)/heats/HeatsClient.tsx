"use client";

import { addGlobalHeatAction } from "./actions";

interface Props {
  heatCycles: any[];
  femaleDogs: any[];
}

export default function HeatsClient({ heatCycles, femaleDogs }: Props) {
  
  // Segédfunkció az intelligens tenyésztői adatok kiszámításához
  const calculateBreedingData = (startDateStr: string) => {
    const start = new Date(startDateStr);
    const today = new Date();
    
    // Eltelt napok száma a kezdettől fogva
    const diffTime = today.getTime() - start.getTime();
    const elapsedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // 1. Ciklus vége (+21 nap)
    const endDate = new Date(start);
    endDate.setDate(start.getDate() + 21);

    // 2. Következő tüzelés (+6 hónap / 180 nap)
    const nextHeatDate = new Date(start);
    nextHeatDate.setDate(start.getDate() + 180);

    // 3. Fedeztetési ablak (11. naptól a 14. napig)
    const windowStart = new Date(start);
    windowStart.setDate(start.getDate() + 10); // 11. nap
    const windowEnd = new Date(start);
    windowEnd.setDate(start.getDate() + 13); // 14. nap

    // Formázó funkció magyaros dátumhoz
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    // 4. Státusz és Progress Bar százalék meghatározása
    let statusText = "";
    let statusColor = "";
    let progressPercent = 0;

    if (elapsedDays < 1) {
      statusText = "Ütemezett / Jövőbeli";
      statusColor = "text-zinc-400 bg-zinc-900 border-zinc-800";
      progressPercent = 0;
    } else if (elapsedDays <= 9) {
      statusText = `Elő-ciklus (Proestrus) - ${elapsedDays}. nap`;
      statusColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
      progressPercent = Math.min(100, Math.round((elapsedDays / 21) * 100));
    } else if (elapsedDays <= 14) {
      statusText = `🔥 TERMÉKENY SZAKASZ (Estrus) - ${elapsedDays}. nap`;
      statusColor = "text-pink-500 bg-pink-500/10 border-pink-500/20 animate-pulse";
      progressPercent = Math.min(100, Math.round((elapsedDays / 21) * 100));
    } else if (elapsedDays <= 21) {
      statusText = `Levezető szakasz (Diestrus) - ${elapsedDays}. nap`;
      statusColor = "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
      progressPercent = Math.min(100, Math.round((elapsedDays / 21) * 100));
    } else {
      statusText = "Lezajlott / Inaktív ciklus";
      statusColor = "text-zinc-500 bg-zinc-950 border-zinc-900";
      progressPercent = 100;
    }

    return {
      elapsedDays,
      endDate: formatDate(endDate),
      nextHeatDate: formatDate(nextHeatDate),
      windowStart: formatDate(windowStart),
      windowEnd: formatDate(windowEnd),
      statusText,
      statusColor,
      progressPercent
    };
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* BAL OLDAL: INTELLIGENS CIKLUS MONITOR LISTA */}
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-2xl font-black uppercase text-amber-400 tracking-wider">Heat Cycles & Fertility Monitor</h1>
        <div className="grid grid-cols-1 gap-4">
          {heatCycles && heatCycles.length > 0 ? (
            heatCycles.map((heat: any) => {
              const data = calculateBreedingData(heat.start_date);
              
              return (
                <div key={heat.id} className="bg-zinc-900/50 border border-zinc-800/80 p-6 rounded-2xl space-y-4 shadow-xl">
                  {/* Fejléc: Kutya név + Aktuális fázis címke */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <h2 className="text-xl font-black text-white tracking-wide">
                        🐾 {heat.dog_name}
                      </h2>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Kezdet: <span className="text-zinc-300 font-mono font-bold">{heat.start_date}</span>
                      </p>
                    </div>
                    <span className={`text-[11px] font-bold uppercase px-3 py-1.5 rounded-xl border h-fit tracking-wider ${data.statusColor}`}>
                      {data.statusText}
                    </span>
                  </div>

                  {/* Vizuális folyamatjelző (Progress Bar) */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-500 uppercase font-bold">
                      <span>Ciklus lefolyása</span>
                      <span>{data.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-900">
                      <div 
                        className={`h-full transition-all duration-500 ${data.elapsedDays >= 10 && data.elapsedDays <= 14 ? 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]' : 'bg-amber-500'}`}
                        style={{ width: `${data.progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Automata Tenyésztői Predikciók rács */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3
