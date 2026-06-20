"use client";

import { useState } from "react";

export default function GestationCalculator() {
  const [matingDate, setMatingDate] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const calculateMilestone = (days: number) => {
    if (!matingDate) return "";
    const date = new Date(matingDate);
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  };

  const dueDate = calculateMilestone(63);
  const implantationDate = calculateMilestone(21);
  const heartbeatDate = calculateMilestone(28);

  // ⚡ FELEJTSD EL A KLIENSOLDALI SUPABASE INSERETET - API-T HASZNÁLUNK!
  const handleSaveToEvents = async () => {
    if (!matingDate || isSaving) return;
    setIsSaving(true);
    setSaveStatus(null);

    const fd = new FormData();
    fd.set("action_type", "create_gestation_event");
    fd.set("due_date", dueDate);

    try {
      const res = await fetch("/api/veterinary/save-event", {
        method: "POST",
        body: fd
      });

      if (res.ok) {
        setSaveStatus("Sikeresen mentve a naptárba! 🎉");
        setTimeout(() => { window.location.reload(); }, 600);
      } else {
        setSaveStatus("Szerveroldali elutasítás. ❌");
      }
    } catch (err) {
      setSaveStatus("Hálózati hiba történt. ❌");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card p-5 space-y-3">
      <h3 className="text-sm font-black opacity-80">Gestation Calculator</h3>
      <div className="space-y-3">
        <div>
          <label className="text-[10px] uppercase font-black opacity-40 block mb-1">Fedeztetés dátuma</label>
          <input
            type="date"
            value={matingDate}
            onChange={(e) => setMatingDate(e.target.value)}
            className="w-full bg-black p-2.5 text-xs text-white"
          />
        </div>

        {matingDate ? (
          <div className="bg-black/30 border border-white/5 p-3 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="opacity-50">Beágyazódás (~21. nap):</span>
              <span className="font-mono text-zinc-200 font-bold">{implantationDate}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="opacity-50">Szívhang (~28. nap):</span>
              <span className="font-mono text-zinc-200 font-bold">{heartbeatDate}</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="text-amber-400 font-bold">Várható ellés (~63. nap):</span>
              <span className="font-mono text-amber-400 font-black">{dueDate}</span>
            </div>

            <button
              onClick={handleSaveToEvents}
              disabled={isSaving}
              className="w-full mt-2 h-9 bg-lime-300 text-black font-bold text-[11px] rounded-lg uppercase tracking-wider transition-all"
            >
              {isSaving ? "Mentés..." : "💾 Mentés a naptárba"}
            </button>
            {saveStatus && (
              <p className="text-[10px] text-center italic opacity-60 mt-1">{saveStatus}</p>
            )}
          </div>
        ) : (
          <div className="opacity-40 text-xs italic">Válassz egy dátumot a mérföldkövek kiszámításához!</div>
        )}
      </div>
    </div>
  );
}
