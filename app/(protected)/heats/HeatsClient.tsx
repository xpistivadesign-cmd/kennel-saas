"use client";

import { addGlobalHeatAction } from "./actions";

interface Props {
  heatCycles: any[];
  femaleDogs: any[];
}

export default function HeatsClient({ heatCycles, femaleDogs }: Props) {
  
  const calculateBreedingData = (startDateStr: string) => {
    const start = new Date(startDateStr);
    const today = new Date();
    
    const diffTime = today.getTime() - start.getTime();
    const elapsedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const endDate = new Date(start);
    endDate.setDate(start.getDate() + 21);

    const nextHeatDate = new Date(start);
    nextHeatDate.setDate(start.getDate() + 180);

    const windowStart = new Date(start);
    windowStart.setDate(start.getDate() + 10); 
    const windowEnd = new Date(start);
    windowEnd.setDate(start.getDate() + 13); 

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

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
      
      {/* BAL OLDAL */}
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-2xl font-black uppercase text-amber-400 tracking-wider">
          Heat Cycles & Fertility Monitor
        </h1>
        <div className="grid grid-cols-1 gap-4">
          {heatCycles && heatCycles.length > 0 ? (
            heatCycles.map((heat: any) => {
              const data = calculateBreedingData(heat.start_date);
              
              return (
                <div 
                  key={heat.id} 
                  className="bg-zinc-900/50 border border-zinc-800/80 p-6 rounded-2xl space-y-4 shadow-xl"
                >
                  
                  {/* Fejléc */}
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

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-500 uppercase font-bold">
                      <span>Ciklus lefolyása</span>
                      <span>{data.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-900">
                      <div 
                        className={`h-full transition-all duration-500 ${data.elapsedDays >= 10 && data.elapsedDays <= 14 ? "bg-pink-500" : "bg-amber-500"}`}
                        style={{ width: `${data.progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Predikciók rács szigorúan rövidített sorokkal */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                    
                    {/* Fedeztetés Box */}
                    <div className="bg-zinc-950/60 border border-zinc-900 p-3 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase text-zinc-500 font-bold block">
                        🎯 Optimális Fedeztetés
                      </span>
                      <span className="font-mono text-pink-400 font-bold block">
                        {data.windowStart} / {data.windowEnd.split("-")[2]}
                      </span>
                      <span className="text-[10px] text-zinc-600 block italic">
                        A ciklus 11-14. napja
                      </span>
                    </div>

                    {/* Vége Box */}
                    <div className="bg-zinc-950/60 border border-zinc-900 p-3 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase text-zinc-500 font-bold block">
                        📅 Ciklus Várható Vége
                      </span>
                      <span className="font-mono text-zinc-300 font-semibold block">
                        {data.endDate}
                      </span>
                      <span className="text-[10px] text-zinc-600 block italic">
                        21 napos lefolyás
                      </span>
                    </div>

                    {/* Következő Box */}
                    <div className="bg-zinc-950/60 border border-zinc-900 p-3 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase text-zinc-400 font-bold block">
                        🔮 Következő Tüzelés
                      </span>
                      <span className="font-mono text-amber-400 font-bold block">
                        {data.nextHeatDate}
                      </span>
                      <span className="text-[10px] text-zinc-600 block italic">
                        ~6 hónap pihenő után
                      </span>
                    </div>

                  </div>

                  {/* Jegyzet */}
                  {heat.notes && (
                    <div className="bg-black/40 border border-zinc-900 px-4 py-2.5 rounded-xl text-zinc-400 text-xs italic">
                      <span className="text-[10px] uppercase font-bold text-zinc-600 not-italic block mb-0.5">
                        Megfigyelt tünetek:
                      </span>
                      "{heat.notes}"
                    </div>
                  )}

                </div>
              );
            })
          ) : (
            <p className="text-zinc-600 italic text-xs">No active heat cycles logged.</p>
          )}
        </div>
      </div>

      {/* JOBB OLDAL: FORM */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl h-fit space-y-4 shadow-xl">
        <h2 className="text-base font-black uppercase tracking-wider text-zinc-300">
          Log New Heat
        </h2>
        
        <form action={addGlobalHeatAction} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500">
              Select Female Dog
            </label>
