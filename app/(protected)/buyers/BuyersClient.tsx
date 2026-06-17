"use client";
import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { addBuyerAction, updateBuyerStatusAction, deleteBuyerAction } from "./actions";

export default function BuyersClient({ buyers, puppies }: any) {
  const router = useRouter();
  const [subTab, setSubTab] = useState("waitlist");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [idCard, setIdCard] = useState("");
  const [status, setStatus] = useState("Waiting");
  const [genderPref, setGenderPref] = useState("No preference");
  const [notes, setNotes] = useState("");
  const [load, setLoad] = useState(false);

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
    } catch (err: any) { 
      alert("Mentési hiba: " + err.message); 
    } finally { 
      setLoad(false); 
    }
  };

  const onChangeStatus = async (id: string, newStatus: string) => {
    try {
      await updateBuyerStatusAction(id, newStatus);
      startTransition(() => { router.refresh(); });
    } catch (err: any) { alert(err.message); }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Biztosan törlöd ezt a személyt?")) return;
    try {
      await deleteBuyerAction(id);
      startTransition(() => { router.refresh(); });
    } catch (err: any) { alert(err.message); }
  };

  const generateContract = () => {
    const buyer = buyers.find((b: any) => b.id === selectedBuyerId);
    const puppy = puppies.find((p: any) => p.id === selectedPuppyId);

    if (!buyer || !puppy) {
      alert("Kérlek válassz ki egy Gazdit és egy Kiskutyát is!");
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
            h1 { text-align: center; text-transform: uppercase; font-size: 20px; margin-bottom: 30px; }
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
              <p>Jelölés / Nyakörv: ${puppy.collar_color || 'N/A'}</p>
              <p>Mikrochip szám: ${puppy.microchip_number || '................................'}</p>
              <p>Törzskönyv szám: ${puppy.pedigree_number || 'Folyamatban'}</p>
            </div>
          </div>

          <p class="section">1. A SZERZŐDÉS TÁRGYA</p>
          <p>Eladó eladja, Vevő pedig megvásárolja a fent megnevezett, fajtatiszta kiskutyát. Eladó szavatolja, hogy a kiskutya a korának megfelelő oltásokkal és féreghajtásokkal rendelkezik.</p>

          <p class="section">2. VÉTELÁR</p>
          <p>A kiskutya vételára fixen <strong>${price} ${currency}</strong>, amelyet Vevő a szerződés aláírásával egyidejűleg megfizet.</p>

          <p>Kelt: ${new Date().toISOString().split('T')[0]}</p>

          <div class="footer-sign">
            <div class="sign-box">Eladó (Tenyésztő)</div>
            <div class="sign-box">Vevő (Gazdi)</div>
          </div>

          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const waitlistBuyers = buyers.filter((b: any) => b.status === "Waiting" || b.status === "Approved");
  const activeOwners = buyers.filter((b: any) => b.status === "Active Owner");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex border-b border-zinc-800 gap-4 text-xs">
          <button onClick={() => setSubTab("waitlist")} className={`pb-2 uppercase font-bold tracking-wider ${subTab === "waitlist" ? "text-amber-400 border-b-2 border-amber-400" : "text-zinc-500"}`}>⏳ Várólista ({waitlistBuyers.length})</button>
          <button onClick={() => setSubTab("database")} className={`pb-2 uppercase font-bold tracking-wider ${subTab === "database" ? "text-amber-400 border-b-2 border-amber-400" : "text-zinc-500"}`}>👥 Gazdi Adatbázis ({activeOwners.length})</button>
          <button onClick={() => setSubTab("contract-gen")} className={`pb-2 uppercase font-bold tracking-wider ${subTab === "contract-gen" ? "text-amber-400 border-b-2 border-amber-400" : "text-zinc-500"}`}>📄 Szerződés</button>
        </div>

        {subTab === "waitlist" && (
          <div className="space-y-2">
            {waitlistBuyers.map((b: any) => (
              <div key={b.id} className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-amber-400">{b.name} <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded ml-2 text-zinc-400">{b.status}</span></h3>
                  <p className="text-zinc-400 text-[11px] mt-0.5">Nem: <span className="text-pink-400">{b.preferred_gender}</span> | {b.phone || "Nincs telefon"}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => onChangeStatus(b.id, "Active Owner")} className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-[10px] font-bold transition">GAZDI LETT 🎉</button>
                  <button onClick={() => onDelete(b.id)} className="bg-zinc-950 text-red-400 px-2 py-1 rounded border border-zinc-800 text-[10px] hover:bg-red-950 transition">TÖRLÉS</button>
                </div>
              </div>
            ))}
            {waitlistBuyers.length === 0 && <p className="text-zinc-600 italic text-xs">A várólista jelenleg üres.</p>}
          </div>
        )}

        {subTab === "database" && (
          <div className="space-y-2">
            {activeOwners.map((b: any) => (
              <div key={b.id} className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-emerald-400">🏡 {b.name}</h3>
                  <p className="text-zinc-400 text-[11px] mt-0.5">{b.address || "Nincs lakcím"} • {b.phone || "Nincs tel."}</p>
                </div>
                <button onClick={() => onDelete(b.id)} className="bg-zinc-950 text-red-400 px-2 py-1 rounded border border-zinc-800 text-[10px] hover:bg-red-950 transition">TÖRLÉS</button>
              </div>
            ))}
            {activeOwners.length === 0 && <p className="text-zinc-600 italic text-xs">Nincs még aktív gazdi az adatbázisban.</p>}
          </div>
        )}

        {subTab === "contract-gen" && (
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-zinc-400 block text-xs mb-1">1. Válaszd ki a Gazdit</label>
                <select value={selectedBuyerId} onChange={e => setSelectedBuyerId(e.target.value)} className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white text-xs">
                  <option value="">-- Válassz vevőt --</option>
                  {buyers.map((b: any) => (<option key={b.id} value={b.id}>{b.name} ({b.status})</option>))}
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block text-xs mb-1">2. Válaszd ki a kiskutyát</label>
                <select value={selectedPuppyId} onChange={e => setSelectedPuppyId(e.target.value)} className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white text-xs">
                  <option value="">-- Válassz kutyát --</option>
                  {puppies.map((p: any) => (<option key={p.id} value={p.id}>{p.name || 'Névtelen'} ({p.collar_color})</option>))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 block text-xs mb-1">Vételár</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white text-xs" />
                </div>
                <div>
                  <label className="text-zinc-400 block text-xs mb-1">Pénznem</label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white text-xs">
                    <option value="EUR">EUR (€)</option>
                    <option value="HUF">HUF (Ft)</option>
                  </select>
                </div>
              </div>

              <button onClick={generateContract} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold p-2.5 rounded-lg text-xs uppercase tracking-wider transition-all">
                📄 SZERZŐDÉS GENERÁLÁSA & NYOMTATÁSA
              </button>
            </div>
          </div>
        )}
      </div>

      {/* REGISZTRÁCIÓS ŰRLAP */}
      <form onSubmit={onSubmitBuyer} className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg space-y-3">
        <h3 className="font-bold text-zinc-400 uppercase text-xs border-b border-zinc-800 pb-2">Új tag rögzítése</h3>
        <div><label className="text-zinc-500 text-[11px] block mb-0.5">Teljes név *</label><input value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white text-xs" /></div>
        <div><label className="text-zinc-500 text-[11px] block mb-0.5">Telefonszám</label><input value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white text-xs" /></div>
        <div><label className="text-zinc-500 text-[11px] block mb-0.5">E-mail</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white text-xs" /></div>
        <div><label className="text-zinc-500 text-[11px] block mb-0.5">Lakcím (Szerződéshez)</label><input value={address} onChange={e => setAddress(e.target.value)} className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white text-xs" /></div>
        <div><label className="text-zinc-500 text-[11px] block mb-0.5">Személyi ig. szám</label><input value={idCard} onChange={e => setIdCard(e.target.value)} className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white text-xs" /></div>
        
        <div>
          <label className="text-zinc-500 text-[11px] block mb-0.5">Preferált nem</label>
          <select value={genderPref} onChange={e => setGenderPref(e.target.value)} className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white text-xs">
            <option value="No preference">Mindegy</option>
            <option value="Male">Kan</option>
            <option value="Female">Szuka</option>
          </select>
        </div>

        <div>
          <label className="text-zinc-500 text-[11px] block mb-0.5">Státusz</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white text-xs">
            <option value="Waiting">Waiting (Várólista)</option>
            <option value="Active Owner">Active Owner (Aktív Gazdi)</option>
          </select>
        </div>

        <div><label className="text-zinc-500 text-[11px] block mb-0.5">Megjegyzés</label><textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white text-xs h-12" /></div>
        
        <button type="submit" disabled={load} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-2 rounded-lg uppercase text-xs tracking-wider transition-all disabled:opacity-50">
          {load ? "Mentés..." : "Mentés"}
        </button>
      </form>
    </div>
  );
}
