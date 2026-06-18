"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function GestationCalculator() {
  const [matingDate, setMatingDate] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  // A kutya vemhességi ideje fixen ~63 nap
  const calculateMilestone = (days: number) => {
    if (!matingDate) return "";
    const date = new Date(matingDate);
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  };

  const dueDate = calculateMilestone(63);
  const implantationDate = calculateMilestone(21);
  const heartbeatDate = calculateMilestone(28);

  const handleSaveToEvents = async () => {
    if (!matingDate || isSaving) return;
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Elmentjük a várható ellést a naptár események közé
      const { error } = await supabase.from("events").insert({
        user_id: user.id,
        title: "🐶 Várható ellési időpont (Alom)",
        event_type: "Vemhesség",
        date: dueDate,
        location: "Kennel",
      });

      if (error) throw error;

      setSaveStatus("Sikeresen mentve a naptárba! 🎉");
    } catch (err) {
      console.error(err);
      setSaveStatus("Hiba történt a mentés során. ❌");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-3">
      <h3 className="text-sm font-bold text-zinc-300">Gestation Calculator</h3>
      <div className="space-y-3">
        <div>
          <label className="text-[11px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">
            Fedeztetés dátuma
          </label>
          <input
            type="date"
            value={matingDate}
            onChange={(e) => setMatingDate(e.target.value)}
            className="w-full bg-black border border-zinc-800 p-2 rounded text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {matingDate ? (
          <div className="bg-black/40 border border-zinc-900 p-3 rounded-lg space-y-2 text-xs">
            <div className="flex justify-between border-b border-zinc-900 pb-1.5">
              <span className="text-zinc-400">Beágyazódás (~21. nap):</span>
              <span className="font-mono text-zinc-200 font-bold">{implantationDate}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-900 pb-1.5">
              <span className="text-zinc-400">Szívhang (~28. nap):</span>
              <span className="font-mono text-zinc-200 font-bold">{heartbeatDate}</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="text-amber-400 font-bold">Várható ellés (~63. nap):</span>
              <span className="font-mono text-amber-400 font-black">{dueDate}</span>
            </div>

            <button
              onClick={handleSaveToEvents}
              disabled={isSaving}
              className="w-full mt-2 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 text-black font-bold text-[11px] py-1.5 rounded transition-colors uppercase tracking-wider"
            >
              {isSaving ? "Mentés..." : "💾 Mentés a naptárba"}
            </button>
            {saveStatus && (
              <p className="text-[10px] text-center italic text-zinc-400 mt-1">{saveStatus}</p>
            )}
          </div>
        ) : (
          <div className="text-zinc-600 space-y-1 text-xs italic">
            Válassz egy dátumot a mérföldkövek automatikus kiszámításához!
          </div>
        )}
      </div>
    </div>
  );
}
