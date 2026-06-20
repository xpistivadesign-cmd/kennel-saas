"use client";

import { useState, useEffect } from "react";

export default function VeterinaryDocumentsPage() {
  const [dogs, setDogs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    async function loadDocs() {
      const dogsRes = await fetch("/api/branding/get-current");
      const docsRes = await fetch("/api/veterinary");
      if (dogsRes.ok && docsRes.ok) {
        const d = await dogsRes.json();
        const docData = await docsRes.json();
        setDogs(d.dogs || []);
        setDocuments(docData.documents || []);
      }
    }
    loadDocs();
  }, []);

  async function handleUploadDoc(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsUploading(true);

    const fd = new FormData(e.currentTarget);
    fd.set("action_type", "upload_document");

    try {
      const res = await fetch("/api/veterinary", { method: "POST", body: fd });
      if (res.ok) {
        alert("📄 Klinikai dokumentum sikeresen archiválva a kutya profiljához!");
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">📁 Medical Cloud Storage</h1>
        <p className="opacity-60 text-xs">Röntgenfelvételek (X-Ray), laborleletek és egészségügyi igazolások kutyánként rendszerezve.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6 space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">Archivált Digitális Leletek</h3>
          {documents.length === 0 ? (
            <p className="text-xs opacity-40">Nincs még klinikai dokumentum feltöltve.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {documents.map((doc: any) => (
                <div key={doc.id} className="p-4 bg-black/40 border border-zinc-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white block truncate">{doc.title}</span>
                    <span className="text-[9px] uppercase font-black bg-zinc-900 px-2 py-0.5 rounded text-lime-400">{doc.category}</span>
                  </div>
                  <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-[11px] text-purple-400 font-bold block hover:underline">📄 Lelet megnyitása →</a>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6 space-y-4 h-fit">
          <h3 className="font-bold text-xs uppercase tracking-wider text-lime-400">Lelet Feltöltése</h3>
          <form onSubmit={handleUploadDoc} className="space-y-3">
            <div>
              <label className="text-[10px] uppercase opacity-40 block mb-1">Kutya összekapcsolása</label>
              <select name="dog_id" required className="w-full bg-black p-3 rounded-xl border text-xs text-white">
                <option value="">-- Válassz kutyát --</option>
                {dogs.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase opacity-40 block mb-1">Dokumentum címe</label>
              <input type="text" name="title" required placeholder="pl. HD Csípőszűrés lelet" className="w-full bg-black p-3 rounded-xl text-xs text-white" />
            </div>
            <div>
              <label className="text-[10px] uppercase opacity-40 block mb-1">Kategória</label>
              <select name="category" className="w-full bg-black p-3 rounded-xl border text-xs text-white">
                <option value="xray">Röntgen (X-Ray)</option>
                <option value="bloodwork">Labor / Vérvétel</option>
                <option value="ultrasound">Ultrahang lelet</option>
                <option value="vaccination">Oltási igazolás</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase opacity-40 block mb-1">Fájl kiválasztása (PDF, JPG, PNG)</label>
              <input type="file" name="medical_file" required accept="image/*,application/pdf" className="w-full p-2 bg-black rounded-xl text-xs text-zinc-400 border cursor-pointer" />
            </div>
            <button type="submit" disabled={isUploading} className="w-full h-12 bg-lime-300 text-black font-black uppercase text-xs rounded-xl tracking-wider">
              {isUploading ? "Mentés a Cloud-ba..." : "🚀 DIGITÁLIS ARCHIVÁLÁS"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
