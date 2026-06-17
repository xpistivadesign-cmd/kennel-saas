"use client";
import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { addBuyerAction, updateBuyerStatusAction, deleteBuyerAction } from "./actions";

export default function BuyersClient({ buyers, puppies }: any) {
  const router = useRouter();
  const [subTab, setSubTab] = useState("waitlist"); // waitlist, database, contract-gen
  
  // Űrlap állapota új gazdihoz
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [idCard, setIdCard] = useState("");
  const [status, setStatus] = useState("Waiting");
  const [genderPref, setGenderPref] = useState("No preference");
  const [notes, setNotes] = useState("");
  const [load, setLoad] = useState(false);

  // Szerződés generáló állapota
  const [selectedBuyerId, setSelectedBuyerId] = useState("");
  const [selectedPuppyId, setSelectedPuppyId] = useState("");
  const [price, setPrice] = useState("2500");
  const [currency, setCurrency] = useState("EUR");

  const onSubmitBuyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoad(true);
    try {
      await addBuyerAction({
        name: name.trim(), email, phone, address,
        id_card_number: idCard, status, preferred_gender: genderPref, notes
      });
      alert("Sikeresen hozzáadva! 🎉");
      setName(""); setEmail(""); setPhone(""); setAddress(""); setIdCard(""); setNotes("");
      startTransition(() => { router.refresh(); });
    } catch (e: any) { alert(e.message); } finally { setLoad(false); }
  };

  const onChangeStatus = async (id: string, newStatus: string) => {
    try {
      await updateBuyerStatusAction(id, newStatus);
      startTransition(() => { router.refresh(); });
    } catch (e: any) { alert(e.message); }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Biztosan törlöd ezt a személyt?")) return;
    try {
      await deleteBuyerAction(id);
      startTransition(() => { router.refresh(); });
    } catch (e: any) { alert(e.message); }
  };

  // ADÁSVÉTELI SZERZŐDÉS GENERÁTOR ÉS NYOMTATÓ
  const generateContract = () => {
    const buyer = buyers.find((b: any) => b.id === selectedBuyerId);
    const puppy = puppies.find((p: any) => p.id === selectedPuppyId);

    if (!buyer || !puppy) {
      alert("Kérlek válassz ki egy Gazdit és egy Kiskutyát is a szerződéshez!");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Adásvételi Szerződés - ${puppy.name || 'Kiskutya'}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; color: #000; font-size: 14px; }
            h1 { text-align: center; text-uppercase: true; font-size: 20px; margin-bottom: 30px; }
            .section { margin-top: 20px; font-weight: bold; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .footer-sign { margin-top: 80px; display: flex; justify-content: space-between; }
            .sign-box { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; }
          </style>
        </head>
        <body>
          <h1>EB ADÁSVÉTELI SZERZŐDÉS</h1>
          <p>Amely létrejött egyfelől a <strong>Tenyésztő / Eladó</strong>, másfelől alulírott vevő között:</p>
          
          <div class="grid">
            <div>
              <p><strong>VEVŐ ADATAI:</strong></p>
              <p>Név: ${buyer.name}</p>
              <p>Cím: ${buyer.address || '........................................'}</p>
              <p>Személyi ig. szám: ${buyer.id_card_number || '................................'}</p>
              <p>Telefon: ${buyer.phone || 'N/A'}</p>
            </div>
            <div>
              <p><strong>A KISKUTYA ADATAI:</strong></p>
              <p>Törzskönyvi név: ${puppy.name || 'Névtelen'}</p>
              <p>Jelölés / Nyakörv: ${puppy.collar_color}</p>
              <p>Mikrochip szám: ${puppy.microchip_number || '................................'}</p>
              <p>Törzskönyv szám: ${puppy.pedigree_number || 'Folyamatban'}</p>
            </div>
          </div>

          <p class="section">1. A SZERZŐDÉS TÁRGYA</p>
          <p>Eladó eladja, Vevő pedig megvásárolja a fent megnevezett, fajtatiszta kiskutyát tenyésztési és hobbi célra. Eladó szavatolja, hogy a kiskutya a korának megfelelő oltásokkal és féreghajtásokkal rendelkezik.</p>

          <p class="section">2. VÉTELÁR ÉS FIZETÉSI FELTÉTELEK</p>
          <p>A szerződő felek a kiskutya vételárát fixen <strong>${price} ${currency}</strong> összegben határozzák meg, amelyet Vevő a szerződés aláírásával egyidejűleg készpénzben vagy átutalással megfizet az Eladó részére.</p>

          <p class="section">3. EGYÉB MEGÁLLAPODÁSOK</p>
          <p>Vevő kötelezettséget vállal arra, hogy a kiskutyának a fajta igényeinek megfelelő, szeretet teljes és minőségi életkörülményeket biztosít, láncon nem tartja. A szerződésben nem szabályozott kérdésekben a Polgári Törvénykönyv (PTK) rendelkezései az irányadóak.</p>

          <p>Kelt: Budapest, ${new Date().toISOString().split('T')[0]}</p>

          <div class="footer-sign">
            <div class="sign-box">Eladó (Tenyésztő)</div>
            <div class="sign-box">Vevő (Gazdi)</div>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const waitlistBuyers = buyers.filter((b: any) => b.status === "Waiting" || b.status === "Approved");
  const activeOwners = buyers.filter((b: any) => b.status === "Active Owner");

  return (
    <div className="space-y-4">
      {/* Al-menü fülek */}
      <div className="flex border-b border-zinc-800 gap-2 text-xs">
        <button onClick={() => setSubTab("waitlist")} className={`p-2 uppercase font-bold ${subTab === "waitlist" ? "text-amber-400 border-b-2 border-amber-500" : "text-zinc-500"}`}>⏳ Várólista ({waitlistBuyers.length})</button>
        <button onClick={() => setSubTab("database")} className={`p-2 uppercase font-bold ${subTab === "database" ? "text-amber-400 border-b-2 border-amber-500" : "text-zinc-500"}`}>👥 Gazdi Adatbázis ({activeOwners.length})</button>
        <button onClick={() => setSubTab("contract-gen")} className={`p-2 uppercase font-bold ${subTab === "contract-gen" ? "text-amber-400 border-b-2 border-amber-500" : "text-zinc-500"}`}>📄 Szerződés Generátor</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LISTÁK MEGJELENÍTÉSE */}
        <div className="lg:col-span-2 space-y-2">
          {subTab === "waitlist" && (
            <div className="space-y-2">
              {waitlistBuyers.map((b: any) => (
                <div key={b.id} className="bg-zinc-950 border border-zinc-900 p-3 rounded flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-amber-400">{b.name} <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded ml-2 text-zinc-400">{b.status}</span></h3>
                    <p className="text-zinc-400 text-[11px] mt-0.5">Pref: <span className="text-pink-400">{b.preferred_gender}</span> | {b.phone || "Nincs telefon"}</p>
                    {b.notes && <p className="text-zinc-500 italic text-[11px] mt-1">Megj: {b.notes}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => onChangeStatus(b.id, "Approved")} className="bg-blue-600 text-white px-2 py-1 rounded font-bold text-[10px]">JÓVÁHAGY</button>
                    <button onClick={() => onChangeStatus(b.id, "Active Owner")} className="bg-emerald-600 text-white px-2 py-1 rounded font-bold text-[10px]">GAZDI LETT 🎉</button>
                    <button onClick={() => onDelete(b.id)} className="bg-zinc-900 text-red-400 px-2 py-1 rounded border border-zinc-800 text-[10px]">TÖRLÉS</button>
                  </div>
                </div>
              ))}
              {waitlistBuyers.length === 0 && <p className="text-zinc-600 italic">A várólista jelenleg üres.</p>}
            </div>
          )}

          {subTab === "database" && (
            <div className="space-y-2">
              {activeOwners.map((b: any) => (
                <div key={b.id} className="bg-zinc-950 border border-zinc-900 p-3 rounded flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-emerald-400">🏡 {b.name}</h3>
                    <p className="text-zinc-400 text-[11px] mt-0.5">{b.address || "Nincs cím megadva"} • {b.phone}</p>
                    <p className="text-zinc-500 font-mono text-[10px]">{b.email}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => onChangeStatus(b.id, "Waiting")} className="bg-zinc-800 text-zinc-400 px-2 py-1 rounded text-[10px]">Várólistára vissza</button>
                    <button onClick={() => onDelete(b.id)} className="bg-zinc-900 text-red-400 px-2 py-1 rounded border border-zinc-800 text-[10px]">TÖRLÉS</button>
                  </div>
                </div>
              ))}
              {activeOwners.length === 0 && <p className="text-zinc-600 italic">Nincs még aktív gazdi rögzítve az adatbázisban.</p>}
            </div>
          )}

          {subTab === "contract-gen" && (
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded space-y-4">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">Adásvételi Dokumentum Kiküldő / Nyomtató</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-zinc-400 block mb-1">1. Válaszd ki a Vevőt / Gazdit</label>
                  <select value={selectedBuyerId} onChange={e => setSelectedBuyerId(e.target.value)} className="w-full p-2 bg-black border border-zinc-800 rounded text-white text-xs">
                    <option value="">-- Válassz vevőt --</option>
                    {buyers.map((b: any) => (<option key={b.id} value={b.id}>{b.name} ({b.status})</option>))}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">2. Válaszd ki a kiskutyát</label>
                  <select value={selectedPuppyId} onChange={e => setSelectedPuppyId(e.target.value)} className="w-full p-2 bg-black border border-zinc-800 rounded text-white text-xs">
                    <option value="">-- Válassz kutyát --</option>
                    {puppies.map((p: any) => (<option key={p.id} value={p.id}>{p.name || 'Névtelen'} - {p.collar_color} ({p.status})</option>))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-zinc-400 block mb-1">Vételár</label>
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2 bg-black border border-zinc-800 rounded text-white text-xs" />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Pénznem</label>
                    <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full p-2 bg-black border border-zinc-800 rounded text-white text-xs">
                      <option value="EUR">EUR (€)</option>
                      <option value="HUF">HUF (Ft)</option>
                    </select>
                  </div>
                </div>

                <button onClick={generateContract} className="w-full bg-amber-500 text-black font-bold p-3 rounded uppercase text-xs tracking-wider font-bold hover:bg-amber-400 transition-all">
                  📄 HIVATALOS ADÁSVÉTELI SZERZŐDÉS GENERÁLÁSA & NYOMTATÁSA
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ÚJ JELENTKEZŐ HOZZÁADÁSA ŰRLAP (MINDIG JELEN VAN JOBB OLDALT) */}
        <form onSubmit={onSubmitBuyer} className="bg-zinc-900 border border-zinc-800 p-4 rounded h-fit space-y-2">
          <h3 className="font-bold text-zinc-400 uppercase text-xs mb-2">Új Jelentkező / Gazdi rögzítése</h3>
          <div><label className="text-zinc-500 block mb-0.5">Teljes név *</label><input value={name} onChange={e => setName(e.target.value)} required placeholder="Pl. Kiss János" className="w-full p-1.5 bg-black border border-zinc-800 rounded text-white" /></div>
          <div><label className="text-zinc-500 block mb-0.5">Telefonszám</label><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+36 30 123 4567" className="w-full p-1.5 bg-black border border-zinc-800 rounded text-white" /></div>
          <div><label className="text-zinc-500 block mb-0.5">E-mail cím</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="gazdi@email.com" className="w-full p-1.5 bg-black border border-zinc-800 rounded text-white" /></div>
          <div><label className="text-zinc-500 block mb-0.5">Lakcím (Szerződéshez)</label><input value={address} onChange={e => setAddress(e.target.value)} placeholder="1051 Budapest, Fő utca 12." className="w-full p-1.5 bg-black border border-zinc-800 rounded text-white" /></div>
          <div><label className="text-zinc-500 block mb-0.5">Személyi igazolvány szám</label><input value={idCard} onChange={e => setIdCard(e.target.value)} placeholder="123456AB" className="w-full p-1.5 bg-black border border-zinc-800 rounded text-white" /></div>
          
          <div>
            <label className="text-zinc-500 block mb-0.5">Preferált nem</label>
            <select value={genderPref} onChange={e => setGenderPref(e.target.value)} className="w-full p-1.5 bg-black border border-zinc-800 rounded text-white">
              <option value="No preference">Mindegy / Bármelyik</option>
              <option value="Male">Csak Kan (Male)</option>
              <option value="Female">Csak Szuka (Female)</option>
            </select>
          </div>

          <div>
            <label className="text-zinc-500 block mb-0.5">Kezdeti Státusz</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full p-1.5 bg-black border border-zinc-800 rounded text-white">
              <option value="Waiting">Waiting (Várólistás)</option>
              <option value="Approved">Approved (Előnyben részesített)</option>
              <option value="Active Owner">Active Owner (Aktív Gazdi)</option>
            </select>
          </div>

          <div><label className="text-zinc-500 block mb-0.5">Megjegyzés / Gazdi igényei</label><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Pl. Kertes ház, kiállításra keres kutyát..." className="w-full p-1.5 bg-black border border-zinc-800 rounded text-white h-16 text-xs" /></div>
          <button type="submit" disabled={load} className="w-full bg-amber-500 text-black font-bold py-2 rounded uppercase disabled:opacity-50 text-xs tracking-wider">{load ? "Mentés..." : "Felvétel a listára"}</button>
        </form>
      </div>
    </div>
  );
}
