"use client";

import { useState, useEffect } from "react";

export default function KennelProfilePage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Profil állapotok
  const [kennelName, setKennelName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [kennelAddress, setKennelAddress] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Adatok beolvasása betöltéskor az API-ból
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/branding/get-current");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setKennelName(data.settings.kennel_name || "");
            setOwnerName(data.settings.owner_name || "");
            setKennelAddress(data.settings.kennel_address || "");
            setTaxNumber(data.settings.tax_number || "");
            setLogoUrl(data.settings.logo_url || null);
          }
        }
      } catch (err) {
        console.error("Hiba a profil betöltésekor:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []); // ⚡ FIXED: Megtisztított, szabályos React hook lezárás!

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    const fd = new FormData(e.currentTarget);
    fd.set("kennel_name", kennelName);
    fd.set("owner_name", ownerName);
    fd.set("kennel_address", kennelAddress);
    fd.set("tax_number", taxNumber);

    try {
      const res = await fetch("/api/branding", {
        method: "POST",
        body: fd
      });

      if (res.ok) {
        alert("🏢 Kennel profil adatai sikeresen elmentve!");
        window.location.reload();
      } else {
        alert("Szerver hiba történt a mentés során.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="text-xs opacity-50 p-6">Profil mátrix inicializálása...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6 pb-24">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black">🏢 Kennel Profile Configuration</h1>
        <p className="opacity-50 text-xs">A tenyészet hivatalos white-label cégadatai, elérhetőségei és logókezelése.</p>
      </div>

      <div className="card p-6 space-y-6">
        
        {/* LOGÓ SZEKCIÓ */}
        <div className="flex items-center gap-6 border-b border-zinc-900 pb-6">
          <div className="w-20 h-20 rounded-2xl bg-black border border-zinc-800 flex items-center justify-center overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="Kennel Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] opacity-30 uppercase font-bold text-center p-1">Nincs logó</span>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-[11px] block uppercase tracking-wider font-bold opacity-70">Hivatalos Logó Cseréje</label>
            <input 
              type="file" 
              name="logo_file" 
              accept="image/*" 
              className="w-full p-2 bg-black rounded-xl text-xs text-zinc-400 border border-zinc-800 cursor-pointer" 
            />
          </div>
        </div>

        {/* ALAPADATOK GRID */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] block mb-1 uppercase tracking-wider font-bold opacity-70">A tenyészet hivatalos neve (Kennel Name)</label>
            <input 
              type="text" 
              value={kennelName} 
              onChange={(e) => setKennelName(e.target.value)}
              placeholder="pl. Vom Hause Matrix" 
              className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-[11px] block mb-1 uppercase tracking-wider font-bold opacity-70">Tulajdonos / Vezető Neve (Owner)</label>
            <input 
              type="text" 
              value={ownerName} 
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="pl. Kovács János" 
              className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* CÉGES / ADÓZÁSI ADATOK */}
        <div className="grid md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-[11px] block mb-1 uppercase tracking-wider font-bold opacity-70">Hivatalos Székhely / Cím (Address)</label>
            <input 
              type="text" 
              value={kennelAddress} 
              onChange={(e) => setKennelAddress(e.target.value)}
              placeholder="pl. 1051 Budapest, Petőfi tér 4." 
              className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-[11px] block mb-1 uppercase tracking-wider font-bold opacity-70">Adószám / Nyilvántartási szám (Tax ID)</label>
            <input 
              type="text" 
              value={taxNumber} 
              onChange={(e) => setTaxNumber(e.target.value)}
              placeholder="pl. 12345678-2-42" 
              className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

      </div>

      <button 
        type="submit" 
        disabled={isSaving}
        className="w-full h-14 rounded-2xl bg-lime-300 text-black font-black text-xs uppercase tracking-wider shadow-xl transition-all hover:opacity-90 flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <span className="animate-spin inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full"></span>
            PROFIL ADATOK SZINKRONIZÁLÁSA...
          </>
        ) : "💾 KENNEL PROFIL MENTÉSE ÉS INTEGRÁLÁSA"}
      </button>
    </form>
  );
}
