"use client";

import { useState, useEffect } from "react";

export default function VeterinaryHubPage() {
  const [dogs, setDogs] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [dogId, setDogId] = useState("");
  const [type, setType] = useState("checkup");
  const [startAt, setStartAt] = useState("");
  const [vetName, setVetName] = useState("");
  const [cost, setCost] = useState("");

  useEffect(() => {
    async function loadHealthData() {
      try {
        const dogsRes = await fetch("/api/branding/get-current"); 
        const healthRes = await fetch("/api/veterinary");
        if (dogsRes.ok && healthRes.ok) {
          const dogsData = await dogsRes.json();
          const healthData = await healthRes.json();
          setDogs(dogsData.dogs || []);
          setAppointments(healthData.appointments || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHealthData();
  }, []);

  async function handleAddAppointment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title || !startAt || isSaving) return;
    setIsSaving(true);

    const fd = new FormData();
    fd.set("action_type", "create_appointment");
    fd.set("title", title);
    fd.set("dog_id", dogId);
    fd.set("type", type);
    fd.set("start_at", startAt);
    fd.set("vet_name", vetName);
    fd.set("cost", cost);

    try {
      const res = await fetch("/api/veterinary", { method: "POST", body: fd });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  // 🔥 LEZÁRÁS ÉS AUTOMATIKUS KÖNYVELÉS INDÍTÁSA A KLIENSRŐL
  async function triggerMarkDone(visitId: string, visitCost: number) {
    const fd = new FormData();
    fd.set("action_type", "mark_done");
    fd.set("visit_id", visitId);
    fd.set("cost", String(visitCost));

    try {
      const res = await fetch("/api/veterinary", { method: "POST", body: fd });
      if (res.ok) {
        alert("✅ Vizsgálat lezárva, a kiadás automatikusan könyvelve a pénzügybe!");
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (isLoading) return <div className="text-xs opacity-50 p-6">Egészségügyi hálózat szinkronizálása...</div>;

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-4xl font-black">🩺 Veterinary & Health Matrix</h1>
        <p className="opacity-60 text-xs">Klinikai menetrend automatikus pénzügyi és könyvelési integrációval.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-sm text-purple-400">📅 Menetrend & Beavatkozások</h3>
            {appointments.length === 0 ? (
              <p className="text-xs opacity-50">Nincs rögzített orvosi esemény.</p>
            ) : (
              <div className="space-y-2">
                {appointments.map((app: any) => (
                  <div key={app.id} className="p-4 bg-black/40 border border-zinc-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs block text-white">{app.purpose}</span>
                      <span className="text-[11px] opacity-40">Típus: {app.type} • Költség: {app.cost} €</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${app.status === "done" ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"}`}>
                        {app.status === "done" ? "Completed" : "Planned"}
                      </span>
                      {app.status !== "done" && (
                        <button type="button" onClick={() => triggerMarkDone(app.id, app.cost)} className="bg-green-500 text-black font-bold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider">
                          Mark as Done
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card p-6 space-y-4 h-fit">
          <h3 className="font-bold text-sm text-lime-400">➕ Add Veterinary Visit</h3>
          <form onSubmit={handleAddAppointment} className="space-y-3">
            <select value={dogId} onChange={e => setDogId(e.target.value)} className="w-full bg-black p-3 rounded-xl border text-xs text-white">
              <option value="">Select Dog</option>
              {dogs.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <input type="date" value={startAt} onChange={e => setStartAt(e.target.value)} className="w-full bg-black p-3 rounded-xl text-xs text-white" />
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Purpose (Vaccination, Surgery, etc.)" className="w-full bg-black p-3 rounded-xl text-xs text-white" />
            <input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="Cost (€)" className="w-full bg-black p-3 rounded-xl text-xs text-white" />
            <input type="text" value={vetName} onChange={e => setVetName(e.target.value)} placeholder="Veterinarian Name" className="w-full bg-black p-3 rounded-xl text-xs text-white" />
            <button type="submit" className="w-full h-12 bg-lime-300 text-black font-black text-xs uppercase tracking-wider rounded-xl">
              Save Visit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
