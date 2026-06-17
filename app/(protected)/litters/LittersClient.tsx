"use client";
import { useState, useEffect } from "react";
import { 
  createLitterAction, addPuppyAction, sellPuppyAction, 
  markLitterAsBornAction, deleteLitterAction, updatePuppyProfileAction, addVaccinationAction 
} from "./actions";

export default function LittersClient({ litters, puppies, potentialSires, potentialDams, activeLitterId, vaccinations }: any) {
  const [tab, setTab] = useState("directory");
  const [selId, setSelId] = useState<string | null>(activeLitterId || litters[0]?.id || null);
  const [sireType, setSireType] = useState("");
  const [damType, setDamType] = useState("");
  const [err, setErr] = useState<string | null>(null);
  
  // FIX: Csak az első induláskor vesszük át a szerveroldali listát, utána SOHA nem engedjük felülírni!
  const [pugs, setPugs] = useState<any[]>(() => puppies || []);
  const [vaccs, setVaccs] = useState<any[]>(() => vaccinations || []);

  const [selPuppy, setSelPuppy] = useState<any | null>(null);
  const [vName, setVName] = useState("");
  const [vDate, setVDate] = useState(new Date().toISOString().split("T")[0]);

  const [fname, setFname] = useState("");
  const [fc, setFc] = useState("");
  const [fg, setGender] = useState("Male");
  const [fw, setWeightUnit] = useState("g");
  const [fb, setBirthWeight] = useState("");
  const [load, setLoad] = useState(false);

  // FIX: Kivágtuk az eddigi hibás useEffect-et, ami letörölte a listát!

  const litter = litters.find((l: any) => l.id === selId);
  const currentPuppies = pugs.filter((p) => p.litter_id === selId);

  const onBorn = async (id: string) => {
    const d = prompt("Dátum (ÉÉÉÉ-HH-NN):", new Date().toISOString().split("T")[0]);
    if (d) { 
      await markLitterAsBornAction(id, d); 
      alert("Kész! 🎉"); 
    }
  };

  const onDel = async (id: string, n: string) => {
    if (confirm(`Törlöd ezt az almot: ${n}?`)) { 
      await deleteLitterAction(id); 
      setSelId(null); 
      setTab("directory"); 
    }
  };

  const onAddPuppy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selId || !fc.trim() || !fname.trim()) return;
    setLoad(true);
    try {
      const nP = await addPuppyAction({
        litter_id: selId, name: fname.trim(), collar_color: fc.trim(),
        gender: fg, weight_unit: fw, birth_weight: parseInt(fb || "0", 10)
      });
      
      // Fixen beleerőltetjük a listába kliens oldalon, és mivel nincs useEffect ami felülbírálja, itt is MARAD!
      if (nP) {
        setPugs(prev => {
          if (prev.some(p => p.id === nP.id)) return prev;
          return [...prev, nP];
        });
      }
      setFname(""); 
      setFc(""); 
      setBirthWeight("");
    } catch (e: any) { 
      alert(e.message); 
    } { setLoad(false); }
  };

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selPuppy) return;
    try {
      await updatePuppyProfileAction(selPuppy.id, selPuppy);
      setPugs(prev => prev.map(p => p.id === selPuppy.id ? selPuppy : p));
      alert("Profil sikeresen mentve! 💾");
    } catch (e: any) { alert(e.message); }
  };

  const onLitterVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selId || !vName.trim()) return;
    try {
      await addVaccinationAction({ vaccine_name: vName.trim(), date: vDate, litter_id: selId });
      alert("Oltás rögzítve az egész alomnak! 💉");
      setVName("");
    } catch (e: any) { alert(e.message); }
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
            <select name="sire_id" onChange={(e) => setSireType(e.target.value)} className="w-full p-2 bg-black border border-zinc-800 rounded text-white">
              <option value="null">-- Select --</option>
              {potentialSires.map((s: any) => (<option key={s.id} value={s.id}>{s.name}</option>))}
              <option value="other">Other...</option>
            </select>
            {sireType === "other" && (
              <input name="sire_name" placeholder="External sire name" className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded mt-1 text-white" />
            )}
          </div>
          <div>
            <label className="text-pink-400 block mb-1">Dam (Mother)</label>
            <select name="dam_id" onChange={(e) => setDamType(e.target.value)} className="w-full p-2 bg-black border border-zinc-800 rounded text-white">
              <option value="null">-- Select --</option>
              {potentialDams.map((d: any) => (<option key={d.id} value={d.id}>{d.name}</option>))}
              <option value="other">Other...</option>
            </select>
            {damType === "other" && (
              <input name="dam_name" placeholder="External dam name" className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded mt-1 text-white" />
            )}
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
              <h2 className="text-base font-bold text-amber-400">Alomszintű Oltási Napló</h2>
              <form onSubmit={onLitterVaccine} className="flex gap-2 mt-2">
                <input value={vName} onChange={e => setVName(e.target.value)} required placeholder="Oltás neve (pl. Parvo)" className="bg-black p-2 rounded border border-zinc-800 flex-1 text-white" />
                <input type="date" value={vDate} onChange={e => setVDate(e.target.value)} className="bg-black p-2 rounded border border-zinc-800 text-white" />
                <button type="submit" className="bg-amber-500 text-black px-4 py-2 rounded font-bold">Oltás beadása</button>
              </form>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase text-zinc-400">Kölykök a listában ({currentPuppies.length})</h3>
              {currentPuppies.map((p) => (
                <div key={p.id} className="bg-zinc-950 border border-zinc-900 p-4 rounded space-y-3">
                  <div className="flex justify-between items-start">
                    <button onClick={() => setSelPuppy(p)} className="text-left block">
                      <span className="font-bold text-sm text-amber-400 block hover:underline">🐶 {p.name || "Névtelen"}</span>
                      <span className="text-zinc-300 block">🎀 Nyakörv/Jelölés: {p.collar_color} ({p.gender === "Male" ? "Kan" : "Szuka"})</span>
                      <span className="text-zinc-500 font-mono text-[10px]">Súly: {p.birth_weight}{p.weight_unit}</span>
                    </button>
                    {p.status !== "Sold" ? (
                      <form action={sellPuppyAction.bind(null, p.id, litter.id)} className="flex gap-1 bg-zinc-900 p-1.5 rounded border border-zinc-800 text-white">
                        <input name="buyer_name" required placeholder="Gazdi" className="p-1 bg-black rounded border border-zinc-800 w-24 text-white" />
                        <input name="sale_price" type="number" required placeholder="EUR" className="w-16 p-1 bg-black rounded border border-zinc-800 text-white" />
                        <button type="submit" className="bg-emerald-500 text-black px-2 py-1 font-bold rounded">SELL</button>
                      </form>
                    ) : <span className="text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900 px-2 py-1 rounded">SOLD & SYNCED</span>}
                  </div>
                </div>
              ))}
              {currentPuppies.length === 0 && (
                <p className="text-zinc-600 italic p-2">Nincs még kiskutya felvéve ebbe az alomba.</p>
              )}
            </div>

            {selPuppy && (
              <form onSubmit={onSaveProfile} className="bg-zinc-900 border border-zinc-800 p-4 rounded space-y-3">
                <div className="flex justify-between items-center"><h2 className="text-base font-bold text-amber-400">🐶 Kiskutya Profil részletes adatai</h2><button type="button" onClick={() => setSelPuppy(null)} className="text-zinc-500">Bezárás X</button></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-zinc-500 block mb-1">Név</label><input value={selPuppy.name || ""} onChange={e => setSelPuppy({...selPuppy, name: e.target.value})} className="w-full bg-black p-2 border border-zinc-800 rounded text-white" /></div>
                  <div><label className="text-zinc-500 block mb-1">Nyakörv / Jelölés</label><input value={selPuppy.collar_color || ""} onChange={e => setSelPuppy({...selPuppy, collar_color: e.target.value})} className="w-full bg-black p-2 border border-zinc-800 rounded text-white" /></div>
                  <div><label className="text-zinc-500 block mb-1">Törzskönyvi szám</label><input value={selPuppy.pedigree_number || ""} onChange={e => setSelPuppy({...selPuppy, pedigree_number: e.target.value})} placeholder="Pl. MET.Whip.124/26" className="w-full bg-black p-2 border border-zinc-800 rounded text-white" /></div>
                  <div><label className="text-zinc-500 block mb-1">Microchip szám</label><input value={selPuppy.microchip_number || ""} onChange={e => setSelPuppy({...selPuppy, microchip_number: e.target.value})} placeholder="Pl. 900182000123456" className="w-full bg-black p-2 border border-zinc-800 rounded text-white" /></div>
                  <div><label className="text-zinc-500 block mb-1">Útlevél szám</label><input value={selPuppy.passport_number || ""} onChange={e => setSelPuppy({...selPuppy, passport_number: e.target.value})} placeholder="Pl. HU123456" className="w-full bg-black p-2 border border-zinc-800 rounded text-white" /></div>
                  <div><label className="text-zinc-500 block mb-1">Megjegyzés</label><input value={selPuppy.notes || ""} onChange={e => setSelPuppy({...selPuppy, notes: e.target.value})} className="w-full bg-black p-2 border border-zinc-800 rounded text-white" /></div>
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white font-bold p-2.5 rounded uppercase">Kiskutya adatlap mentése</button>
              </form>
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
