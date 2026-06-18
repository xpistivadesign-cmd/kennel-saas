"use client";
import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { createEventAction, updateEntryResultAction, deleteEventAction } from "./actions";

export default function ShowsClient({ events, dogs }: any) {
  const router = useRouter();
  const [load, setLoad] = useState(false);

  // Űrlap állapotai
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("Show");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [judge, setJudge] = useState("");
  const [entryFee, setEntryFee] = useState("0");
  const [currency, setCurrency] = useState("EUR");
  const [notes, setNotes] = useState("");
  const [selectedDogIds, setSelectedDogIds] = useState<string[]>([]);

  // Eredménykezelő ablak állapota
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [classEntered, setClassEntered] = useState("");
  const [placement, setPlacement] = useState("");
  const [titlesWon, setTitlesWon] = useState("");
  const [reportText, setReportText] = useState("");

  const handleDogCheck = (dogId: string) => {
    setSelectedDogIds(prev => 
      prev.includes(dogId) ? prev.filter(id => id !== dogId) : [...prev, dogId]
    );
  };

  const onSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return alert("Cím és Dátum megadása kötelező!");
    setLoad(true);

    try {
      const res = await createEventAction({
        title: title.trim(), event_type: eventType, date, location, judge,
        entry_fee: parseFloat(entryFee), currency, notes, dog_ids: selectedDogIds
      });

      if (res && !res.success) return alert(res.error);

      alert("Esemény sikeresen rögzítve! 📅 Sparkoltuk a pénzügyekbe is, ha volt díj.");
      setTitle(""); setDate(""); setLocation(""); setJudge(""); setEntryFee("0"); setNotes(""); setSelectedDogIds([]);
      startTransition(() => { router.refresh(); });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoad(false);
    }
  };

  const handleSaveResult = async (entryId: string) => {
    try {
      const res = await updateEntryResultAction(entryId, {
        class_entered: classEntered, placement, titles_won: titlesWon, report_text: reportText
      });
      if (res && !res.success) return alert(res.error);
      alert("Eredmény sikeresen elmentve! 🏆");
      setEditingEntryId(null);
      startTransition(() => { router.refresh(); });
    } catch (err: any) { alert(err.message); }
  };

  const onDeleteEvent = async (id: string) => {
    if (!confirm("Biztosan törlöd ezt az egész eseményt a nevezésekkel együtt?")) return;
    try {
      await deleteEventAction(id);
      startTransition(() => { router.refresh(); });
    } catch (err: any) { alert(err.message); }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingEvents = events.filter((e: any) => e.date >= todayStr);
  const pastEvents = events.filter((e: any) => e.date < todayStr);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* BAL OLDAL: ESEMÉNYEK LISTÁJA */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* KÖZELGŐ ESEMÉNYEK */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400">⏳ Közelgő Kiállítások & Vizsgák ({upcomingEvents.length})</h2>
          {upcomingEvents.map((e: any) => (
            <div key={e.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 mr-2">{e.event_type}</span>
                  <strong className="text-sm text-white font-sans">{e.title}</strong>
                  <p className="text-zinc-400 text-xs mt-1">📅 {e.date} • 📍 {e.location || "Nincs helyszín"}</p>
                </div>
                <button onClick={() => onDeleteEvent(e.id)} className="text-zinc-600 hover:text-red-400 text-xs">Törlés</button>
              </div>

              {/* Benevezett kutyák listája */}
              <div className="border-t border-zinc-800/60 pt-2 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Benevezett Kutyák:</span>
                {e.event_entries?.map((entry: any) => (
                  <div key={entry.id} className="text-xs text-zinc-300 flex justify-between bg-black/30 p-1.5 rounded">
                    <span>🐕 {entry.dogs?.name || "Ismeretlen kutya"}</span>
                    <span className="text-zinc-500 italic">Még nincs eredmény (jövőbeli esemény)</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {upcomingEvents.length === 0 && <p className="text-zinc-600 italic text-xs">Nincs ütemezett közelgő esemény.</p>}
        </div>

        {/* MÚLTBÉLI ESEMÉNYEK / EREDMÉNYEK BEÍRÁSA */}
        <div className="space-y-3 pt-4 border-t border-zinc-800/60">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-500">🏆 Múltbéli Események & Eredménytár ({pastEvents.length})</h2>
          {pastEvents.map((e: any) => (
            <div key={e.id} className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-lg space-y-3">
              <div>
                <strong className="text-sm text-zinc-300">{e.title}</strong>
                <p className="text-zinc-500 text-xs">📅 {e.date} • Bíró: {e.judge || "N/A"}</p>
              </div>

              <div className="space-y-2">
                {e.event_entries?.map((entry: any) => (
                  <div key={entry.id} className="bg-black/40 p-3 rounded-md border border-zinc-800/40 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-amber-400">🐕 {entry.dogs?.name}</span>
                      
                      {editingEntryId !== entry.id && (
                        <button 
                          onClick={() => {
                            setEditingEntryId(entry.id);
                            setClassEntered(entry.class_entered || "");
                            setPlacement(entry.placement || "");
                            setTitlesWon(entry.titles_won || "");
                            setReportText(entry.report_text || "");
                          }} 
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded text-[10px]"
                        >
                          {entry.placement || entry.titles_won ? "Szerkesztés" : "🏆 Eredmény beírása"}
                        </button>
                      )}
                    </div>

                    {/* HA ÉPPEN SZERKESZTI AZ EREDMÉNYT */}
                    {editingEntryId === entry.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-zinc-900 p-2 rounded border border-zinc-800 text-xs">
                        <div>
                          <label className="text-zinc-500 text-[10px] block mb-0.5">Osztály</label>
                          <input value={classEntered} onChange={e => setClassEntered(e.target.value)} placeholder="Pl. Fiatal / Munka" className="w-full bg-black p-1 border border-zinc-800 rounded text-white" />
                        </div>
                        <div>
                          <label className="text-zinc-500 text-[10px] block mb-0.5">Minősítés / Helyezés</label>
                          <input value={placement} onChange={e => setPlacement(e.target.value)} placeholder="Pl. Kitűnő I, Született" className="w-full bg-black p-1 border border-zinc-800 rounded text-white" />
                        </div>
                        <div>
                          <label className="text-zinc-500 text-[10px] block mb-0.5">Megnyert Címek</label>
                          <input value={titlesWon} onChange={e => setTitlesWon(e.target.value)} placeholder="Pl. HPJ, CAC, BOB" className="w-full bg-black p-1 border border-zinc-800 rounded text-white" />
                        </div>
                        <div className="md:col-span-3">
                          <label className="text-zinc-500 text-[10px] block mb-0.5">Bírálati szöveg / Megjegyzés</label>
                          <textarea value={reportText} onChange={e => setReportText(e.target.value)} placeholder="Nagyon szép fejforma, jó mozgás..." className="w-full bg-black p-1 border border-zinc-800 rounded text-white h-10" />
                        </div>
                        <div className="md:col-span-3 flex gap-1 justify-end pt-1">
                          <button onClick={() => setEditingEntryId(null)} className="bg-zinc-800 text-zinc-400 px-2 py-1 rounded">Mégse</button>
                          <button onClick={() => handleSaveResult(entry.id)} className="bg-emerald-600 text-white px-3 py-1 rounded font-bold">Mentés</button>
                        </div>
                      </div>
                    ) : (
                      // HA MÁR VAN ELMENTETT EREDMÉNY, ITT MUTATJA
                      (entry.placement || entry.titles_won) && (
                        <div className="text-[11px] text-zinc-400 font-mono pl-3 border-l-2 border-amber-500 space-y-0.5">
                          <p>Osztály: <span className="text-zinc-200">{entry.class_entered || "N/A"}</span></p>
                          <p>Eredmény: <span className="text-emerald-400 font-bold">{entry.placement}</span></p>
                          {entry.titles_won && <p>Címek: <span className="text-amber-400 font-bold">{entry.titles_won}</span></p>}
                          {entry.report_text && <p className="text-zinc-500 italic mt-1">Bírálat: "{entry.report_text}"</p>}
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* JOBB OLDAL: NEVEZÉSI ŰRLAP */}
      <form onSubmit={onSubmitEvent} className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg space-y-3">
        <h3 className="font-bold text-zinc-400 uppercase text-xs border-b border-zinc-800 pb-2">Esemény / Kiállítás Kiírása</h3>
        
        <div>
          <label className="text-zinc-500 text-[11px] block mb-0.5">Esemény jellege</label>
          <select value={eventType} onChange={e => setEventType(e.target.value)} className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white text-xs">
            <option value="Show">🏆 Kutyakiállítás (Show)</option>
            <option value="Working Exam">🦺 Munkavizsga (Working Exam)</option>
            <option value="Sport">🏃 Sportverseny (Agility, IGP, Racing)</option>
            <option value="Breeding Selection">📐 Tenyészszemle (Selection)</option>
          </select>
        </div>

        <div><label className="text-zinc-500 text-[11px] block mb-0.5">Esemény / Verseny neve *</label><input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Pl. Szilvásvárad CACIB" className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white text-xs" /></div>
        <div><label className="text-zinc-500 text-[11px] block mb-0.5">Dátum *</label><input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white text-xs" /></div>
        <div><label className="text-zinc-500 text-[11px] block mb-0.5">Helyszín</label><input value={location} onChange={e => setLocation(e.target.value)} placeholder="Pl. Budapest, Hungexpo" className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white text-xs" /></div>
        <div><label className="text-zinc-500 text-[11px] block mb-0.5">Bíró (Judge)</label><input value={judge} onChange={e => setJudge(e.target.value)} placeholder="Pl. Kovács Péter" className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white text-xs" /></div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-zinc-500 text-[11px] block mb-0.5">Nevezési díj</label>
            <input type="number" value={entryFee} onChange={e => setEntryFee(e.target.value)} className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white text-xs" />
          </div>
          <div>
            <label className="text-zinc-500 text-[11px] block mb-0.5">Pénznem</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white text-xs">
              <option value="EUR">EUR (€)</option>
              <option value="HUF">HUF (Ft)</option>
            </select>
          </div>
        </div>

        {/* KUTYÁK JELÖLÉSE A NEVEZÉSHEZ */}
        <div className="bg-black/40 p-2.5 rounded border border-zinc-800 space-y-1.5">
          <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block">Kutyák benevezése:</label>
          <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
            {dogs.map((d: any) => (
              <label key={d.id} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer hover:text-white">
                <input 
                  type="checkbox" 
                  checked={selectedDogIds.includes(d.id)} 
                  onChange={() => handleDogCheck(d.id)}
                  className="rounded border-zinc-800 bg-black text-amber-500 focus:ring-0"
                />
                <span>{d.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div><label className="text-zinc-500 text-[11px] block mb-0.5">Megjegyzés / Felszerelés</label><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Pl. Boxot, oltási könyveket vinni kell..." className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white text-xs h-12" /></div>
        
        <button type="submit" disabled={load} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-2 rounded-lg uppercase text-xs tracking-wider transition-all disabled:opacity-50">
          {load ? "Rögzítés..." : "🎯 Esemény Mentése"}
        </button>
      </form>
    </div>
  );
}
