"use client";

import { useState, useEffect, useTransition } from "react";
import { createLitterAction, addPuppyAction, sellPuppyAction, markLitterAsBornAction, deleteLitterAction } from "./actions";

interface Props {
  litters: any[];
  puppies: any[];
  potentialSires: any[];
  potentialDams: any[];
  activeLitterId: string | null;
}

export default function LittersClient({ litters, puppies, potentialSires, potentialDams, activeLitterId }: Props) {
  const [activeTab, setActiveTab] = useState<string>("directory");
  const [selectedLitterId, setSelectedLitterId] = useState<string | null>(activeLitterId || (litters[0]?.id || null));
  const [sireType, setSireType] = useState("");
  const [damType, setDamType] = useState("");
  const [dbError, setDbError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Kliens oldali lokális kiskutya lista, hogy azonnal reagáljon a felület
  const [localPuppies, setLocalPuppies] = useState<any[]>(puppies);

  // Form inputok állapota (state), hogy kézzel is tudjuk üríteni és kezelni őket
  const [formCollar, setFormCollar] = useState("");
  const [formGender, setFormGender] = useState("Male");
  const [formWeightUnit, setFormWeightUnit] = useState("g");
  const [formBirthWeight, setFormBirthWeight] = useState("");
  const [isAddingPuppy, setIsAddingPuppy] = useState(false);

  // Szinkronizáljuk a prop-ból jövő kutyákat, ha frissül a szerver
  useEffect(() => {
    setLocalPuppies(puppies);
  }, [puppies]);

  // URL paraméterek figyelése
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const err = params.get("error");
      const urlId = params.get("id");
      
      if (err) {
        setDbError(decodeURIComponent(err));
      }
      if (urlId) {
        setSelectedLitterId(urlId);
        setActiveTab("litter-profile");
      }
    }
  }, [litters]);

  const selectedLitter = litters.find((l) => l.id === selectedLitterId);
  const currentPuppies = localPuppies.filter((p) => p.litter_id === selectedLitterId);

  const calculateWhelpingDate = (dateString: string) => {
    if (!dateString) return "Nincs megadva";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Érvénytelen dátum";
    date.setDate(date.getDate() + 63);
    return date.toISOString().split("T")[0];
  };

  const handleMarkAsBorn = async (litterId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const actualDate = prompt("Kérlek, add meg a tényleges ellés dátumát (ÉÉÉÉ-HH-NN):", today);
    
    if (actualDate && actualDate.trim() !== "") {
      startTransition(async () => {
        try {
          await markLitterAsBornAction(litterId, actualDate.trim());
          setDbError(null);
          alert("Alom státusza sikeresen frissítve Ellés-re! 🎉");
        } catch (err: any) {
          setDbError(err.message);
        }
      });
    }
  };

  const handleDeleteLitter = async (litterId: string, letter: string) => {
    if (confirm(`Biztosan törölni szeretnéd a(z) "${letter}" almot és minden adatát a listából?`)) {
      startTransition(async () => {
        try {
          await deleteLitterAction(litterId);
          if (selectedLitterId === litterId) {
            setSelectedLitterId(null);
            setActiveTab("directory");
          }
          setDbError(null);
          alert("Alom sikeresen törölve a rendszerből. 🗑️");
        } catch (err: any) {
          setDbError(err.message);
        }
      });
    }
  };

  // Kézi, golyóálló kliensoldali beküldés az Add Puppy gombhoz
  const handleCustomAddPuppy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLitterId || !formCollar.trim()) return;

    setIsAddingPuppy(true);
    setDbError(null);

    // 1. Összekészítjük a form adatokat hagyományos módon
    const formData = new FormData();
    formData.append("litter_id", selectedLitterId);
    formData.append("collar_color", formCollar.trim());
    formData.append("gender", formGender);
    formData.append("weight_unit", formWeightUnit);
    formData.append("birth_weight", formBirthWeight || "0");

    // 2. Létrehozunk egy ideiglenes lokális kiskutyát, hogy AZONNAL megjelenjen a képernyőn
    const tempId = "temp-" + Date.now();
    const mockPuppy = {
      id: tempId,
      litter_id: selectedLitterId,
      collar_color: formCollar.trim(),
      gender: formGender,
      weight_unit: formWeightUnit,
      birth_weight: parseInt(formBirthWeight || "0", 10),
      status: "Elérhető"
    };

    // Azonnal betesszük a listába látványnak
    setLocalPuppies((prev) => [...prev, mockPuppy]);

    try {
      // 3. Elküldjük a háttérben a szervernek
      await addPuppyAction(formData);
      
      // Sikeres mentés esetén kiürítjük a beviteli mezőket, hogy lehessen írni a következőt
      setFormCollar("");
      setFormBirthWeight("");
    } catch (err: any) {
      console.error("Hiba történt a mentés közben:", err);
      setDbError(err.message || "Nem sikerült elmenteni a kiskutyát az adatbázisba.");
      // Ha elhasal a szerver, kivesszük a listából a kamut
      setLocalPuppies((prev) => prev.filter((p) => p.id !== tempId));
    } finally {
      setIsAddingPuppy(false);
    }
  };

  const renderLitterCard = (l: any) => {
    const isPlanned = l.status === "Tervezett" || l.status === "Planning" || l.status === "Pregnant";
    return (
      <div 
        key={l.id} 
        className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl flex flex-col justify-between hover:border-zinc-700 transition"
      >
        <button 
          type="button"
          onClick={() => { setSelectedLitterId(l.id); setActiveTab("litter-profile"); }}
          className="text-left w-full block focus:outline-none"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-amber-400">"{l.letter || 'Névtelen'}" Litter</h2>
            <span className={`text-[10px] font-mono px-2 py-1 rounded border uppercase ${isPlanned ? "bg-blue-950/60 border-blue-800 text-blue-400" : "bg-emerald-950/60 border-emerald-800 text-emerald-400"}`}>
              {l.status}
            </span>
          </div>
          
          <p className="text-xs text-zinc-400 mt-2">Apa: {l.sire_name || "Saját kan"} • Anya: {l.dam_name || "Saját szuka"}</p>
          
          <div className="mt-3 pt-3 border-t border-zinc-800/60 font-mono text-xs space-y-1">
            {isPlanned ? (
              <>
                <div className="text-zinc-400">
                  <span className="text-zinc-500 uppercase font-bold text-[10px] block">Fedeztetés időpontja:</span> 
                  {l.birth_date || "Nincs megadva"}
                </div>
                <div className="text-blue-400 font-bold">
                  <span className="text-blue-500 uppercase text-[10px] block mt-1">Várható ellés időpontja (+63 nap):</span> 
                  {calculateWhelpingDate(l.birth_date)}
                </div>
              </>
            ) : (
              <div className="text-emerald-400">
                <span className="text-zinc-500 uppercase font-bold text-[10px] block">Ellés időpontja:</span> 
                {l.birth_date || "Nincs megadva"}
              </div>
            )}
          </div>
        </button>

        <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-800 justify-end">
          {isPlanned && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleMarkAsBorn(l.id)}
              className="px-3 py-1.5 text-[10px] font-black uppercase bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
            >
              🎉 Megszületett
            </button>
          )}
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleDeleteLitter(l.id, l.letter)}
            className="px-3 py-1.5 text-[10px] font-black uppercase bg-zinc-800 border border-zinc-700 text-red-400 rounded-lg hover:bg-red-950/40 hover:border-red-900 transition disabled:opacity-50"
          >
            🗑️ Törlés
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      
      {/* ALMENÜ NAVIGÁCIÓ */}
      <div className="flex border-b border-zinc-800 gap-2 overflow-x-auto">
        <button type="button" onClick={() => { setActiveTab("directory"); setDbError(null); }} className={`px-4 py-2 text-xs font-black uppercase border-b-2 transition ${activeTab === "directory" ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>📂 Litters Directory</button>
        <button type="button" onClick={() => { setActiveTab("planner"); setDbError(null); }} className={`px-4 py-2 text-xs font-black uppercase border-b-2 transition ${activeTab === "planner" ? "border-amber-
