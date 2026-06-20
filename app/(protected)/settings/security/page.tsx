export const dynamic = "force-dynamic";

export default function SecurityPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black">🔐 Security Matrix</h1>
        <p className="opacity-50 text-xs">Kétlépcsős azonosítás (2FA), API Token kulcsok és aktív munkamenetek.</p>
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div>
            <h4 className="font-bold text-sm">Two-Factor Authentication (2FA)</h4>
            <p className="text-[11px] opacity-40">Biztonsági szint megemelése authenticator applikációval.</p>
          </div>
          <span className="text-[10px] uppercase font-bold bg-zinc-800 px-3 py-1 rounded-full opacity-60">Disabled</span>
        </div>

        <div className="pt-2">
          <h4 className="font-bold text-sm mb-1">Kennel OS Developers API Keys</h4>
          <p className="text-[11px] opacity-40 mb-3">Integráld a tenyésztési adatokat külső weboldalaidba.</p>
          <div className="bg-black p-3 rounded-xl border border-zinc-800 font-mono text-xs flex items-center justify-between opacity-50">
            <span>sk_live_51N...matrixToken</span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400 cursor-pointer">Reveal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
