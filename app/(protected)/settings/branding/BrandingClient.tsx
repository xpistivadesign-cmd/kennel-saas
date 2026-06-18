{/* 4. FÜL: AUTOMATIONS & POWER ACTIONS (Nyitott Enterprise funkciók az egyszeri díjas modellhez) */}
{activeTab === "automations" && (
  <div className="space-y-4 animate-fadeIn">
    <h3 className="text-sm font-bold text-emerald-400 border-b border-zinc-900 pb-2">⚙️ Advanced Workflow & Automations</h3>
    
    <div className="grid grid-cols-1 gap-3">
      {/* Oltási automatizmus infó blokk */}
      <div className="p-3.5 bg-black/40 border border-zinc-900 rounded-xl flex items-start gap-3">
        <span className="text-lg">💉</span>
        <div>
          <h4 className="font-bold text-zinc-200 text-xs">Automata Egészségügyi Értesítések</h4>
          <p className="text-zinc-500 text-[11px] mt-0.5">A kutyák korából és az utolsó bejegyzésekből a rendszer automatikusan számolja a következő esedékes oltásokat és féregtelenítéseket.</p>
        </div>
      </div>

      {/* Google Calendar szinkron infó blokk */}
      <div className="p-3.5 bg-black/40 border border-zinc-900 rounded-xl flex items-start gap-3">
        <span className="text-lg">📅</span>
        <div>
          <h4 className="font-bold text-zinc-200 text-xs">Vemhességi Naptár & Google Szinkron</h4>
          <p className="text-zinc-500 text-[11px] mt-0.5">Sikeres pároztatás rögzítésekor a szoftver legenerálja a 63 napos vemhességi mérföldköveket, és felmásolja a külső naptáradba.</p>
        </div>
      </div>

      {/* Team management infó blokk - Bekerült a beépített alapfunkciók közé! */}
      <div className="p-3.5 bg-black/40 border border-zinc-900 rounded-xl flex items-start gap-3">
        <span className="text-lg">👥</span>
        <div>
          <h4 className="font-bold text-zinc-200 text-xs">Több-felhasználós (Team) Jogosultságok</h4>
          <p className="text-zinc-500 text-[11px] mt-0.5">Segítők, társtulajdonosok vagy alkalmazottak meghívása egyedi szerepkörökkel (pl. a gondozó láthatja a kutyákat, de a Pénzügy fület nem).</p>
        </div>
      </div>
    </div>

    <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 rounded-xl text-[11px] font-medium flex items-center gap-2">
      <span>✨</span>
      <span>Mivel Te a teljes rendszert megvásároltad, ezek az intelligens háttér-automatizmusok a háttérben alapértelmezetten futnak és segítik a mindennapi munkádat!</span>
    </div>
  </div>
)}
