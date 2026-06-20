"use client";

import { useState, useEffect } from "react";

export default function VeterinaryHubPage() {
  const [dogs, setDogs] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states új időponthoz
  const [title, setTitle] = useState("");
  const [dogId, setDogId] = useState("");
  const [type, setType] = useState("checkup");
  const [startAt, setStartAt] = useState("");
  const [vetName, setVetName] = useState("");

  useEffect(() => {
    async function loadHealthData() {
      try {
        // Lekérjük a kutyák listáját a select menühöz
        const dogsRes = await fetch("/api/branding/get-current"); 
        // Lekérjük az aktuális orvosi adatokat egy új belső API-ról (3. lépés)
        const healthRes = await fetch("/api/veterinary");
        
        if (dogsRes.ok && healthRes.ok) {
          const dogsData = await dogsRes.json();
          const healthData = await healthRes.json();
          setDogs(dogsData.dogs || []);
          setAppointments(healthData.appointments || []);
        }
      } catch (err) {
        console.error("Hiba az egészségügyi adatok betöltésekor:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHealthData();
  }, []);

  async function handleAddAppointment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title || !dogId || !startAt || isSaving) return;
    setIsSaving(true);

    const fd = new FormData();
    fd.set("action_type", "create_appointment");
    fd.set("title", title);
    fd.set("dog_id", dogId);
    fd.set("type", type);
    fd.set("start_at", startAt);
    fd.set("vet_name", vetName);

    try {
      const res = await fetch("/api/veterinary", { method: "POST", body: fd });
      if (res.ok) {
        alert("🩺 Orvosi időpont sikeresen rögzítve és szinkronizálva!");
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <div className="text-xs opacity-50 p-6">Egészségügyi struktúra betöltése...</div>;

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-4xl font-black">🩺 Veterinary & Health Hub</h1>
        <p className="opacity-60 text-xs">A kennel teljes körű klinikai nyilvántartása, oltási naptára és lelet-archívuma.</p>
      </div>

      {/* SÜRGŐS ÉRTESÍTÉSI SÁV */}
      <div className="card p-5 border border-red-500/20" style={{ background: "linear-gradient(135deg, var(--primary)10, transparent)" }}>
        <h3 className="font-bold text-xs uppercase tracking-wider text-red-400 mb-2">🚨 Ma esedékes klinikai feladatok</h3>
        <p className="text-xs opacity-80">Nincs mára halasztott vagy lejárt egészségügyi határidő a kennel adatbázisában.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* BAL OSZLOP: IDŐPONTOK ÉS TRAKKING */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-sm text-purple-400">📅 Közelgő Orvosi Vizsgálatok & Oltások</h3>
            {appointments.length === 0 ? (
              <p className="text-xs opacity-50">Nincs tervezett orvosi időpont rögzítve.</p>
            ) : (
              <div className="space-y-2">
                {appointments.map((app: any) => (
                  <div key={app.id} className="p-4 bg-black/40 border border-zinc-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs block text-white">{app.title}</span>
                      <span className="text-[11px] opacity-40 capitalize">Típus: {app.type} • {app.vet_name || "Ismeretlen állatorvos"}</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-zinc-900 border">
                      {new Date(app.start_at).toLocaleDateString("hu-HU")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* JOBB OSZLOP: MOBIL-OPTIMALIZÁLT QUICK ADD PANEL */}
        <div className="space-y-4">
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-sm text-lime-400">➕ Új Orvosi Időpont / Riasztás</h3>
            <form onSubmit={handleAddAppointment} className="space-y-3 text-white">
              <div>
                <label className="text-[10px] uppercase block opacity-40 mb-1">Kutya kiválasztása</label>
                <select value={dogId} onChange={e => setDogId(e.target.value)} className="w-full bg-black p-3 rounded-xl border text-xs text-white">
                  <option value="">-- Válassz kutyát --</option>
                  {dogs.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase block opacity-40 mb-1">Megnevezés / Beavatkozás</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="pl. Veszettség elleni ismétlő oltás" className="w-full bg-black p-3 rounded-xl text-xs" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase block opacity-40 mb-1">Vizsgálat típusa</label>
                  <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-black p-2.5 rounded-xl text-xs text-white">
                    <option value="vaccination">Oltás (Vaccine)</option>
                    <option value="ultrasound">Ultrahang</option>
                    <option value="xray">Röntgen (X-Ray)</option>
                    <option value="checkup">Általános kontroll</option>
                    <option value="surgery">Műtéti beavatkozás</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase block opacity-40 mb-1">Dátum</label>
                  <input type="date" value={startAt} onChange={e => setStartAt(e.target.value)} className="w-full bg-black p-2 rounded-xl text-xs text-white" />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase block opacity-40 mb-1">Kezelő állatorvos neve</label>
                <input type="text" value={vetName} onChange={e => setVetName(e.target.value)} placeholder="pl. Dr. Szabó Péter" className="w-full bg-black p-3 rounded-xl text-xs" />
              </div>

              <button type="submit" disabled={isSaving} className="w-full h-12 rounded-xl bg-lime-300 text-black font-black text-xs uppercase tracking-wider transition-all">
                {isSaving ? "Szinkronizálás..." : "🚀 IDŐPONT ÉS ALARM RÖGZÍTÉSE"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
