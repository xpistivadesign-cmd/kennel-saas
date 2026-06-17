"use client";

import { useState } from "react";
import Link from "next/link";
import { updateDogProfileAction } from "./actions";

interface Props {
  dogId: string;
  isEditing: boolean;
  sireNameDisplay: string;
  damNameDisplay: string;
  potentialSires: any[];
  potentialDams: any[];
  currentSireId: string | null;
  currentDamId: string | null;
  currentSireName: string | null;
  currentDamName: string | null;
}

export default function DogPedigreeSection({
  dogId,
  isEditing,
  sireNameDisplay,
  damNameDisplay,
  potentialSires,
  potentialDams,
  currentSireId,
  currentDamId,
  currentSireName,
  currentDamName,
}: Props) {
  const [sireSelection, setSireSelection] = useState<string>(
    currentSireId ? currentSireId : (currentSireName ? "other" : "null")
  );
  const [damSelection, setDamSelection] = useState<string>(
    currentDamId ? currentDamId : (currentDamName ? "other" : "null")
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          href={isEditing ? `/dogs/${dogId}?tab=pedigree` : `/dogs/${dogId}?tab=pedigree&edit=true`}
          className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-black uppercase px-4 py-2 rounded-lg transition"
        >
          {isEditing ? "Cancel Edit" : "📝 Edit Pedigree"}
        </Link>
      </div>

      {isEditing ? (
        <form
          action={updateDogProfileAction.bind(null, dogId, "pedigree")}
          className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* SIRE SECTION */}
            <div className="space-y-2 bg-black/30 border border-zinc-800 p-4 rounded-xl">
              <label className="text-[10px] uppercase font-black text-blue-400 tracking-wider block">
                Sire (Father) Selection
              </label>
              <select
                name="sire_id"
                value={sireSelection}
                onChange={(e) => setSireSelection(e.target.value)}
                className="w-full p-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white outline-none focus:border-blue-500 transition"
              >
                <option value="null">-- Unknown / Not Recorded --</option>
                {potentialSires.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    🐾 {s.name}
                  </option>
                ))}
                <option value="other">➕ Other (Type manually)...</option>
              </select>

              {sireSelection === "other" && (
                <div className="pt-2">
                  <label className="text-[9px] text-zinc-400 uppercase font-bold">
                    Type External Stud's Complete Name:
                  </label>
                  <input
                    name="sire_name"
                    defaultValue={currentSireName || ""}
                    required
                    placeholder="e.g., El Toro Grande of Kennel"
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white mt-1 outline-none focus:border-amber-400"
                  />
                </div>
              )}
            </div>

            {/* DAM SECTION */}
            <div className="space-y-2 bg-black/30 border border-zinc-800 p-4 rounded-xl">
              <label className="text-[10px] uppercase font-black text-pink-400 tracking-wider block">
                Dam (Mother) Selection
              </label>
              <select
                name="dam_id"
                value={damSelection}
                onChange={(e) => setDamSelection(e.target.value)}
                className="w-full p-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white outline-none focus:border-pink-500 transition"
              >
                <option value="null">-- Unknown / Not Recorded --</option>
                {potentialDams.map((d: any) => (
                  <option key={d.id} value={d.id}>
                    🐾 {d.name}
                  </option>
                ))}
                <option value="other">➕ Other (Type manually)...</option>
              </select>

              {damSelection === "other" && (
                <div className="pt-2">
                  <label className="text-[9px] text-zinc-400 uppercase font-bold">
                    Type External Female's Complete Name:
                  </label>
                  <input
                    name="dam_name"
                    defaultValue={currentDamName || ""}
                    required
                    placeholder="e.g., Bella Donna of Spain"
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white mt-1 outline-none focus:border-amber-400"
                  />
                </div>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase text-xs p-3.5 rounded-lg transition mt-2 shadow-lg shadow-emerald-500/5"
          >
            Save Lineage Connection & Sync Pedigree
          </button>
        </form>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 mb-4">
            Lineage Family Tree
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-black/40 p-4 rounded-xl border border-zinc-800">
              <span className="text-blue-400 font-bold block text-[10px]">Sire (Father)</span>
              <span className="text-white font-bold text-sm mt-1 block">{sireNameDisplay}</span>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-zinc-800">
              <span className="text-pink-400 font-bold block text-[10px]">Dam (Mother)</span>
              <span className="text-white font-bold text-sm mt-1 block">{damNameDisplay}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
