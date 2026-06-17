"use client";
import { useState, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  createLitterAction, addPuppyAction, sellPuppyAction, 
  markLitterAsBornAction, deleteLitterAction, updatePuppyProfileAction, addVaccinationAction, deleteVaccinationAction 
} from "./actions";

export default function LittersClient({ litters, puppies, potentialSires, potentialDams, activeLitterId, vaccinations }: any) {
  const router = useRouter();
  const [tab, setTab] = useState("directory");
  const [selId, setSelId] = useState<string | null>(activeLitterId || litters[0]?.id || null);
  const [sireType, setSireType] = useState("");
  const [damType, setDamType] = useState("");
  
  const [pugs, setPugs] = useState<any[]>(puppies || []);
  const [vaccs, setVaccs] = useState<any[]>(vaccinations || []);

  const [selPuppy, setSelPuppy] = useState<any | null>(null);
  
  const [vName, setVName] = useState("");
  const [vType, setVType] = useState("Vaccination");
  const [vDate, setVDate] = useState(new Date().toISOString().split("T")[0]);

  const [pMedName, setPMedName] = useState("");
  const [pMedType, setPMedType] = useState("Vaccination");
  const [pMedDate, setPMedDate] = useState(new Date().toISOString().split("T")[0]);

  const [fname, setFname] = useState("");
  const [fc, setFc] = useState("");
  const [fg, setGender] = useState("Male");
  const [fw, setWeightUnit] = useState("g");
  const [fb, setBirthWeight] = useState("");
  const [load, setLoad] = useState(false);

  useEffect(() => { if (puppies) setPugs(puppies); }, [puppies]);
  useEffect(() => { if (vaccinations) setVaccs(vaccinations); }, [vaccinations]);

  const litter = litters.find((l: any) => l.id === selId);
  const currentPuppies = pugs.filter((p) => p.litter_id === selId);

  const puppyMedicalRecords = selPuppy ? vaccs.filter((v: any) => v.puppy_id === selPuppy.id) : [];

  const onAddPuppy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selId || !fc.trim() || !fname.trim()) return;
    setLoad(true);
    try {
      await addPuppyAction({
        litter_id: selId, name: fname.trim(), collar_color: fc.trim(),
        gender: fg, weight_unit: fw, birth_weight: parseInt(fb || "0", 10)
      });
      startTransition(() => { router.refresh(); });
      setFname(""); setFc(""); setBirthWeight("");
    } catch (e: any) { alert(e.message); } finally { setLoad(false); }
  };

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selPuppy) return;
    try {
      await updatePuppyProfileAction(selPuppy.id, selPuppy);
      startTransition(() => { router.refresh(); });
      alert("Profil sikeresen mentve! 💾");
    } catch (e: any) { alert(e.message); }
  };

  const onLitterVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selId || !vName.trim()) return;
    try {
      await addVaccinationAction({ vaccine_name: vName.trim(), date: vDate, treatment_type: vType, litter_id: selId });
      startTransition(() => { router.refresh(); });
      alert("Bejegyzés rögzítve az egész alomnak! 🎉");
      setVName("");
    } catch (e: any) { alert(e.message); }
  };

  const onPuppyMedicalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selPuppy || !pMedName.trim()) return;
    try {
      await addVaccinationAction({ vaccine_name: pMedName.trim(), date: pMedDate, treatment_type: pMedType, puppy_id: selPuppy.id });
      startTransition(() => { router.refresh(); });
      setPMedName("");
    } catch (e: any) { alert(e.message); }
  };

  const onDeleteMedical = async (id: string) => {
    if (!confirm("Biztosan törlöd ezt a bejegyzést?")) return;
    try {
      await deleteVaccinationAction(id);
      startTransition(() => { router.refresh(); });
    } catch (e: any) { alert(e.message); }
  };

  const handleSellFormSubmit = async (puppyId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await sellPuppyAction(puppyId, selId!, formData);
    if (res && !res.success) {
      alert(res.error);
    } else {
      startTransition(() => { router.refresh(); });
      alert("Sikeres eladás! A kiskutya eladva és a pénz szinkronizálva! 💰");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 space-y-4 text-xs">
      <div className="flex border-b border-zinc-800 gap-2">
        <button onClick={() => setTab("directory")} className={`p-2 uppercase font-bold ${tab === "directory" ? "text-amber-400 border-b-2 border-amber-500" : "text-zinc-500"}`}>📂 Directory</button>
        <button onClick={() => setTab("planner")} className={`p-2 uppercase font-bold ${tab === "planner" ? "text-amber-400 border-b-2 border-amber-500" : "text-zinc-500"}`}>🎯 Planner</button>
        {litter && <button onClick={() => setTab("litter-profile")} className={`p-2 uppercase font-bold ${tab === "litter-profile" ? "text-amber-400 border-b-2 border-amber-500" : "text-zinc-500"}`}>🐶 "{litter.letter}" Manager</button>}
      </div>

      {tab === "directory" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {litters.map((l: any) => (
            <div key={l.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded flex flex-col justify-between">
              <button onClick={() => { setSelId(l.id); setTab("litter-profile"); }} className="text-left block w-full">
                <h2 className="text-lg font-bold text-amber-400">"{l.letter}" alom ({l.status})</h2>
                <p className="text-zinc-400 mt-1">Apa: {l.sire_name || "N/A"} • Anya: {l.dam_name || "N/A"}</p>
                <p className="text-zinc-500 font-mono mt-1">Dátum: {l.birth_date || "Nincs"}</p>
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "planner" && (
        <form action={createLitterAction} className="bg-zinc-900 p-4 rounded border border-zinc-800 max-w-md space-y-3">
          <h2 className="text-sm font-bold text-amber-400 uppercase">Plan New Litter</h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-zinc-500 block mb-1">Alom Betűje</label>
              <input name="letter" required placeholder="Pl. B" className="w-full p-2 bg-black border border-zinc-800 rounded text-white" />
            </div>
            <div>
              <label className="text-zinc-500 block mb-1">Date</label>
              <input name="birth_date" type="date" className="w-full p-2 bg-black border border-zinc-800 rounded text-white" />
            </div>
          </div>
          <div>
            <label className="text-blue-400 block mb-1">Sire (Father)</label>
            <select name="sire_id" className="w-full p-2 bg-black border border-zinc-800 rounded text-white">
              <option value="null">-- Select --</option>
              {potentialSires.map((s: any) => (<option key={s.id} value={s.id}>{s.name}</option>))}
              <option value="other">Other...</option>
            </select>
          </div>
          <div>
            <label className="text-pink-400 block mb-1">Dam (Mother)</label>
            <select name="dam_id" className="w-full p-2 bg-black border border-zinc-800 rounded text-white">
              <option value="null">-- Select --</option>
              {potentialDams.map((d: any) => (<option key={d.id} value={d.id}>{d.name}</option>))}
              <option value="other">Other...</option>
            </select>
          </div>
          <div>
            <label className="text-zinc-500 block mb-1">Státusz</label>
            <select name="status" className="w-full p-2 bg-black border border-zinc-800 rounded text-white">
              <option value="Tervezett">Planning</option>
              <option value="Ellés">Born</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-amber-500 text-black font-bold p-2 rounded uppercase">Save Litter</button>
        </form>
      )}

      {tab === "litter-profile" && litter && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-zinc-900 p-4 rounded border border-zinc-800">
              <h2 className="text-base font-bold text-amber-400">Alomszintű Egészségügyi Napló (Minden kiskutyának)</h2>
              <form onSubmit={onLitterVaccine} className="flex gap-2 mt-2 items-center">
                <select value={vType} onChange={e => setVType(e.target.value)} className="bg-black p-2 rounded border border-zinc-800 text-white font-bold">
                  <option value="Vaccination">💉 Oltás</option>
                  <option value="Deworming">💊 Féreghajtás</option>
                  <option value="Medical">🩺 Egyéb orvosi kezelés</option>
                </select>
                <input value={vName} onChange={e => setVName(e.target.value)} required placeholder="Megnevezés (pl. Parvo, Kombinált, Műtét)" className="bg-black p-2 rounded border border-zinc-800 flex-1 text-white" />
                <input type="date" value={vDate} onChange={e => setVDate(e.target.value)} className="bg-black p-2 rounded border border-zinc-800 text-white" />
                <button type="submit" className="bg-amber-500 text-black px-4 py-2 rounded font-bold">Rögzítés</button>
              </form>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase text-zinc-400">Kölykök a listában ({currentPuppies.length})</h3>
              {currentPuppies.map((p) => (
                <div key={p.id} className={`border p-4 rounded space-y-3 ${p.status === 'Deceased' ? 'bg-red-950/20 border-red-900/50 opacity-60' : 'bg-zinc-950 border-zinc-900'}`}>
                  <div className="flex justify-between items-start">
                    <button onClick={() => setSelPuppy(p)} className="text-left block">
                      <span className="font-bold text-sm text-amber-400 block hover:underline">
                        🐶 {p.name || "Névtelen"} 
                        {p.status === "Deceased" && <span className="text-red-500 ml-2 font-mono text-xs uppercase">[Elhullott 🕯️]</span>}
                        {p.status === "Sold" && <span className="text-emerald-500 ml-2 font-mono text-xs uppercase">[Gazdis 🎉]</span>}
                      </span>
                      <span className="text-zinc-300 block">🎀 Nyakörv/Jelölés: {p.collar_color} ({p.gender === "Male" ? "Kan" : "Szuka"})</span>
                      <span className="text-zinc-500 font-mono text-[10px]">Súly: {p.birth_weight}{p.weight_unit}</span>
                    </button>
                    {p.status !== "Sold" && p.status !== "Deceased" ? (
                      <form onSubmit={(e) => handleSellFormSubmit(p.id, e)} className="flex gap-1 bg-zinc-900 p-1.5 rounded border border-zinc-800 text-white">
                        <input name="buyer_name" required placeholder="Gazdi" className="p-1 bg-black rounded border border-zinc-800 w-24 text-white" />
                        <input name="sale_price" type="number" required placeholder="EUR" className="w-16 p-1 bg-black rounded border border-zinc-800 text-white" />
                        <button type="submit" className="bg-emerald-500 text-black px-2 py-1 font-bold rounded">SELL</button>
                      </form>
                    ) : p.status === "Sold" ? (
                      <span className="text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900 px-2 py-1 rounded text-[10px]">SOLD & SYNCED</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            {selPuppy && (
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded space-y-4">
                <form onSubmit={onSaveProfile} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h2 className="text-base font-bold text-amber-400">🐶 Kiskutya Profil részletes adatai</h2>
                    <button type="button" onClick={() => setSelPuppy(null)} className="text-zinc-500 hover:text-white">Bezárás X</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-zinc-500 block mb-1">Név</label><input value={selPuppy.name || ""} onChange={e => setSelPuppy({...selPuppy, name: e.target.value})} className="w-full bg-black p-2 border border-zinc-800 rounded text-white" /></div>
                    <div><label className="text-zinc-500 block mb-1">Nyakörv / Jelölés</label><input value={selPuppy.collar_color || ""} onChange={e => setSelPuppy({...selPuppy, collar_color: e.target.value})} className="w-full bg-black p-2 border border-zinc-800 rounded text-white" /></div>
                    <div><label className="text-zinc-500 block mb-1">Törzskönyvi szám</label><input value={selPuppy.pedigree_number || ""} onChange={e => setSelPuppy({...selPuppy, pedigree_number: e.target.value})} placeholder="Pl. MET.Whip.124/26" className="w-full bg-black p-2 border border-zinc-800 rounded text-white" /></div>
                    <div><label className="text-zinc-500 block mb-1">Microchip szám</label><input value={selPuppy.microchip_number || ""} onChange={e => setSelPuppy({...selPuppy, microchip_number: e.target.value})} placeholder="Pl. 900182000123456" className="w-full bg-black p-2 border border-zinc-800 rounded text-white" /></div>
                    <div><label className="text-zinc-500 block mb-1">Útlevél szám</label><input value={selPuppy.passport_number || ""} onChange={e => setSelPuppy({...selPuppy, passport_number: e.target.value})} placeholder="Pl. HU123456" className="w-full bg-black p-2 border border-zinc-800 rounded text-white" /></div>
                    <div>
                      <label className="text-zinc-500 block mb-1">Élethelyzet / Státusz</label>
                      <select value={selPuppy.status || "Elérhető"} onChange={e => setSelPuppy({...selPuppy, status: e.target.value})} className="w-full bg-black p-2 border border-zinc-800 rounded text-white">
                        <option value="Elérhető">Available</option>
                        <option value="Sold">Sold</option>
                        <option value="Deceased">Deceased (Elhullott 🕯️)</option>
                      </select>
                    </div>
                  </div>

                  {/* ÚJ: HA EL VAN ADVA, ITT JELENIK MEG A VEVŐ ÉS AZ ÁR IS FIXEN */}
                  {selPuppy.status === "Sold" && (
                    <div className="bg-emerald-950/20 border border-emerald-900/50 p-3 rounded grid grid-cols-2 gap-2 animate-fadeIn">
                      <div>
                        <label className="text-emerald-400 block mb-0.5 font-bold">Tulajdonos / Gazdi neve</label>
                        <input value={selPuppy.buyer_name || "Nincs rögzítve"} readOnly className="w-full bg-black p-2 border border-zinc-800 rounded text-zinc-400 text-xs font-semibold cursor-not-allowed" />
                      </div>
                      <div>
                        <label className="text-emerald-400 block mb-0.5 font-bold">Vételár (EUR)</label>
                        <input value={selPuppy.sale_price ? `${selPuppy.sale_price} EUR` : "0 EUR"} readOnly className="w-full bg-black p-2 border border-zinc-800 rounded text-zinc-400 text-xs font-mono cursor-not-allowed" />
                      </div>
                    </div>
                  )}

                  {selPuppy.status === "Deceased" && (
                    <div className="bg-red-950/30 border border-red-900/50 p-3 rounded">
                      <label className="text-red-400 block mb-1 font-bold">Elhullás oka</label>
                      <input value={selPuppy.death_reason || ""} onChange={e => setSelPuppy({...selPuppy, death_reason: e.target.value})} placeholder="Pl. Parvo, herpesz..." className="w-full bg-black p-2 border border-red-900 rounded text-white text-xs" />
                    </div>
                  )}

                  <div><label className="text-zinc-500 block mb-1">Megjegyzés</label><input value={selPuppy.notes || ""} onChange={e => setSelPuppy({...selPuppy, notes: e.target.value})} className="w-full bg-black p-2 border border-zinc-800 rounded text-white" /></div>
                  <button type="submit" className="w-full bg-emerald-600 text-white font-bold p-2.5 rounded uppercase">Kiskutya adatlap mentése</button>
                </form>

                <hr className="border-zinc-800 my-4" />

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">🏥 Egyedi Egészségügyi sáv ({selPuppy.name || "Kiskutya"})</h3>
                  
                  <form onSubmit={onPuppyMedicalSubmit} className="flex gap-2 bg-black p-2 rounded border border-zinc-800 items-center">
                    <select value={pMedType} onChange={e => setPMedType(e.target.value)} className="bg-zinc-900 p-2 rounded border border-zinc-800 text-white text-xs font-bold">
                      <option value="Vaccination">💉 Oltás</option>
                      <option value="Deworming">💊 Féreghajtás</option>
                      <option value="Medical">🩺 Egyéb orvosi</option>
                    </select>
                    <input value={pMedName} onChange={e => setPMedName(e.target.value)} required placeholder="Pl. Kombinált, Vitamin, Műtét..." className="bg-zinc-900 p-2 rounded border border-zinc-800 flex-1 text-white text-xs" />
                    <input type="date" value={pMedDate} onChange={e => setPMedDate(e.target.value)} className="bg-zinc-900 p-2 rounded border border-zinc-800 text-white text-xs" />
                    <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded font-bold">Hozzáadás</button>
                  </form>

                  <div className="space-y-1">
                    {puppyMedicalRecords.map((m: any) => (
                      <div key={m.id} className="flex justify-between items-center bg-zinc-950 p-2 border border-zinc-900 rounded">
                        <span className="text-zinc-300 font-medium">
                          {m.treatment_type === 'Deworming' ? '💊 [FÉREGHAJTÁS]' : m.treatment_type === 'Medical' ? '🩺 [EGYÉB ORVOSI]' : '💉 [OLTÁS]'} {m.vaccine_name} 
                          <span className="text-zinc-500 font-mono text-[10px] ml-2">({m.date_administered})</span>
                        </span>
                        <button type="button" onClick={() => onDeleteMedical(m.id)} className="text-red-500 hover:text-red-400 font-bold px-2 py-0.5 border border-red-950 rounded bg-red-950/20 text-[10px]">TÖRLÉS</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={onAddPuppy} className="bg-zinc-900 border border-zinc-800 p-4 rounded h-fit space-y-2">
            <h3 className="font-bold text-zinc-400 uppercase">Add Puppy</h3>
            <div><label className="text-zinc-500 block mb-0.5">Puppy Name</label><input value={fname} onChange={e => setFname(e.target.value)} required placeholder="Fuego" className="w-full p-1.5 bg-black border border-zinc-800 rounded text-white" /></div>
            <div><label className="text-zinc-500 block mb-0.5">Collar / Markings</label><input value={fc} onChange={e => setFc(e.target.value)} required placeholder="Kék nyakörv" className="w-full p-1.5 bg-black border border-zinc-800 rounded text-white" /></div>
            <div><label className="text-zinc-500 block mb-0.5">Gender</label><select value={fg} onChange={e => setGender(e.target.value)} className="w-full p-1.5 bg-black border border-zinc-800 rounded text-white"><option value="Male">Kan</option><option value="Female">Szuka</option></select></div>
            <div><label className="text-zinc-500 block mb-0.5">Unit</label><select value={fw} onChange={e => setWeightUnit(e.target.value)} className="w-full p-1.5 bg-black border border-zinc-800 rounded text-white"><option value="g">Gramm (g)</option><option value="oz">Uncia (oz)</option></select></div>
            <div><label className="text-zinc-500 block mb-0.5">Weight</label><input value={fb} onChange={e => setBirthWeight(e.target.value)} type="number" placeholder="450" className="w-full p-1.5 bg-black border border-zinc-800 rounded text-white" /></div>
            <button type="submit" disabled={load} className="w-full bg-amber-500 text-black font-bold py-1.5 rounded uppercase">{load ? "Saving..." : "Add Puppy"}</button>
          </form>
        </div>
      )}
    </div>
  );
}
