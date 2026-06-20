export const dynamic = "force-dynamic";

export default function LabsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black">🧪 Experimental Labs</h1>
        <p className="opacity-50 text-xs">Kapcsolj be kísérleti funkciókat az alfa verziós modulok teszteléséhez.</p>
      </div>

      <div className="card p-6 space-y-4">
        <div className="space-y-4">
          <label className="flex items-start gap-4 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 mt-0.5 rounded border-zinc-800 bg-black text-purple-600 focus:ring-0" />
            <div>
              <span className="text-xs font-bold block">AI Assistant & Auto-Pedigree Engine</span>
              <p className="text-[11px] opacity-40">Automatikus törzskönyv elemzés és párosítás-optimalizálás mesterséges intelligenciával.</p>
            </div>
          </label>

          <label className="flex items-start gap-4 cursor-pointer pt-2 border-t border-zinc-900">
            <input type="checkbox" className="w-4 h-4 mt-0.5 rounded border-zinc-800 bg-black text-purple-600 focus:ring-0" />
            <div>
              <span className="text-xs font-bold block">Advanced Predictive Analytics</span>
              <p className="text-[11px] opacity-40">Várható alomszám és pénzügyi profit előrejelzés történelmi statisztikák alapján.</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
