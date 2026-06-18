"use client";
import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  addBuyerAction, 
  updateBuyerStatusAction, 
  deleteBuyerAction, 
  assignPuppyToBuyerAction, 
  saveContractAction,
  removePuppyFromBuyerAction 
} from "./actions";

export default function BuyersClient({ buyers, puppies, contracts }: any) {
  const router = useRouter();
  const [subTab, setSubTab] = useState("waitlist"); // waitlist, database, contract-gen, documents
  
  // Regisztrációs mezők
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [idCard, setIdCard] = useState("");
  const [status, setStatus] = useState("Waiting");
  const [genderPref, setGenderPref] = useState("No preference");
  const [notes, setNotes] = useState("");
  const [load, setLoad] = useState(false);

  // Szerződés mezők
  const [selectedBuyerId, setSelectedBuyerId] = useState("");
  const [selectedPuppyId, setSelectedPuppyId] = useState("");
  const [price, setPrice] = useState("2500");
  const [currency, setCurrency] = useState("EUR");

  // Új tag rögzítése
  const onSubmitBuyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoad(true);
    try {
      const res = await addBuyerAction({
        name: name.trim(), email, phone, address,
        id_card_number: idCard, status, preferred_gender: genderPref, notes
      });

      if (res && !res.success) {
        alert("Hiba: " + res.error);
        return;
      }

      alert("Sikeresen hozzáadva! 🎉");
      setName(""); setEmail(""); setPhone(""); setAddress(""); setIdCard(""); setNotes("");
      startTransition(() => { router.refresh(); });
    } catch (err: any) { 
      alert("Hiba: " + err.message); 
    } finally { 
      setLoad(false); 
    }
  };

  const onChangeStatus = async (id: string, newStatus: string) => {
    try {
      const res = await updateBuyerStatusAction(id, newStatus);
      if (res && !res.success) return alert(res.error);
      startTransition(() => { router.refresh(); });
    } catch (err: any) { alert(err.message); }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Biztosan törlöd?")) return;
    try {
      const res = await deleteBuyerAction(id);
      if (res && !res.success) return alert(res.error);
      startTransition(() => { router.refresh(); });
    } catch (err: any) { alert(err.message); }
  };

  // Gyors kiskutya hozzárendelés a Gazdi kártyájáról
  const handleAssignPuppy = async (buyerName: string, puppyId: string) => {
    if (!puppyId) return;
    try {
      const res = await assignPuppyToBuyerAction(puppyId, buyerName);
      if (res && !res.success) return alert(res.error);
      alert(`Kiskutya sikeresen hozzárendelve ${buyerName} részére! 🐶`);
      startTransition(() => { router.refresh(); });
    } catch (err: any) { alert(err.message); }
  };

  // SZERZŐDÉS MENTÉSE ÉS E-MAIL INDÍTÁSA
  const handleSaveAndEmailContract = async () => {
    const buyer = buyers.find((b: any) => b.id === selectedBuyerId);
    const puppy = puppies.find((p: any) => p.id === selectedPuppyId);

    if (!buyer || !puppy) {
      alert("Kérlek válassz ki egy Gazdit és egy Kiskutyát is!");
      return;
    }

    try {
      const res = await saveContractAction({
        buyer_id: buyer.id,
        buyer_name: buyer.name || buyer.full_name,
        buyer_email: buyer.email,
        puppy_id: puppy.id,
        puppy_name: puppy.name || "Névtelen",
        price_amount: parseFloat(price),
        price_currency: currency,
        contract_date: new Date().toISOString().split('T')[0]
      });

      if (res && !res.success) {
        alert("Szerződés mentési hiba: " + res.error);
        return;
      }

      alert("Szerződés sikeresen archiválva! A bevétel automatikusan könyvelve lett a Finance menüpont alá, a kiskutya státusza 'Sold'-ra változott, és az e-mail kiküldés elindult! 💰🐶✈️");
      startTransition(() => { router.refresh(); setSubTab("documents"); });
    } catch (err: any) { alert(err.message); }
  };

  // TISZTÁN NYOMTATÁSI KÉP DIGITÁLIS ALÁÍRÁSSAL
  const handlePrintOnly = (customBuyer?: any, customPuppy?: any, customPrice?: any, customCurrency?: any) => {
    const buyer = customBuyer || buyers.find((b: any) => b.id === selectedBuyerId);
    const puppy = customPuppy || puppies.find((p: any) => p.id === selectedPuppyId);
    const finalPrice = customPrice || price;
    const finalCurrency = customCurrency || currency;

    if (!buyer || !puppy) {
      alert("Nincs kiválasztva megfelelő adat a nyomtatáshoz!");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Szerződés - ${puppy.name || 'Kiskutya'}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; color: #000; font-size: 14px; }
            h1 { text-align: center; text-transform: uppercase; font-size: 20px; margin-bottom: 30px; }
            .section { margin-top: 20px; font-weight: bold; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .footer-sign { margin-top: 80px; display: flex; justify-content: space-between; align-items: flex-end; }
            .sign-box { border-top: 1px solid #000; width: 220px; text-align: center; padding-top: 5px; position: relative; }
            .signature { font-family: 'Brush Script MT', cursive, serif; font-size: 24px; color: #002699; position: absolute; top: -30px; left: 30px; transform: rotate(-5deg); }
          </style>
        </head>
        <body>
          <h1>EB ADÁSVÉTELI SZERZŐDÉS</h1>
          <p>Amely létrejött egyfelől a <strong>Tenyésztő / Eladó</strong>, másfelől alulírott vevő között:</p>
          
          <div class="grid">
            <div>
              <p><strong>VEVŐ ADATAI:</strong></p>
              <p>Név: ${buyer.name || buyer.full_name}</p>
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
          <p>Eladó eladja, Vevő pedig megvásárolja a fent részletezett fajtatiszta kiskutyát.</p>

          <p class="section">2. VÉTELÁR</p>
          <p>A kiskutya vételára fixen <strong>${finalPrice} ${finalCurrency}</strong>.</p>

          <p>Kelt: ${new Date().toISOString().split('T')[0]}</p>

          <div class="footer-sign">
            <div class="sign-box">
              <span class="signature">Kennel Breeder Verified</span>
              Eladó (Tenyésztő)
            </div>
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
  const availablePuppies = puppies.filter((p: any) => p.status !== "Sold" && !p.buyer_name);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-2 space-y-4">
        {/* Navigációs fülek */}
        <div className="flex border-b border-zinc-800 gap-4 text-xs">
          <button onClick={() => setSubTab("waitlist")} className={`pb-2 uppercase font-bold tracking-wider ${subTab === "waitlist" ? "text-amber-400 border-b-2 border-amber-400" : "text-zinc-500"}`}>⏳ Várólista ({waitlistBuyers.length})</button>
          <button onClick={() => setSubTab("database")} className={`pb-2 uppercase font-bold tracking-wider ${subTab === "database" ? "text-amber-400 border-b-2 border-amber-400" : "text-zinc-500"}`}>👥 Gazdi Adatbázis ({activeOwners.length})</button>
          <button onClick={() => setSubTab("contract-gen")} className={`pb-2 uppercase font-bold tracking-wider ${subTab === "contract-gen" ? "text-amber-400 border-b-2 border-amber-400" : "text-zinc-500"}`}>✍️ Szerződés Írás</button>
          <button onClick={() => setSubTab("documents")} className={`pb-2 uppercase font-bold tracking-wider ${subTab === "documents
