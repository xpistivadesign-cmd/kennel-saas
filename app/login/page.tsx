"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1️⃣ KLIENSOLDALI BEJELENTKEZÉS (Ez állítja be a böngészős localStorage-t és sütiket)
      const { error: clientError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (clientError) throw clientError;

      // 2️⃣ SZERVEROLDALI SZINKRON (Meglőjük az API-t, hogy a Next.js szerver se dobjon ki)
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // 3️⃣ BIZTONSÁGI IRÁNYÍTÁS: Teljes ablak-újratöltéssel ugrunk a dashboardra
      window.location.href = "/dashboard";

    } catch (err: any) {
      console.error("Autentikációs hiba:", err);
      setError(err.message || "Hibás email cím vagy jelszó.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#030712] font-sans antialiased selection:bg-[#023FF9] selection:text-white overflow-hidden">
      
      {/* BAL OLDAL */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 bg-black border-r border-zinc-900">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1974&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#030712]" />
        
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#C6FF33]/30 bg-[#C6FF33]/5 text-[#C6FF33] text-[10px] font-black uppercase tracking-[0.2em]">
            ⚡ NEXT-GEN BREEDING MATRIX
          </div>
          <div>
            <h1 className="text-7xl font-black tracking-tight text-white uppercase">
              Kennel<span className="text-[#023FF9] drop-shadow-[0_0_20px_rgba(2,63,249,0.5)]">OS</span>
            </h1>
            <p className="mt-4 text-xl text-zinc-400 font-medium">
              Professional Breeding Management & Core Intelligence.
            </p>
          </div>
          <div className="pt-8 flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-zinc-500">
            <span>Track</span><span className="text-zinc-800">•</span><span>Breed</span><span className="text-zinc-800">•</span><span className="text-[#C6FF33]">Win</span>
          </div>
        </div>
      </div>

      {/* JOBB OLDAL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-[460px] rounded-[32px] p-8 sm:p-10 relative overflow-hidden border border-zinc-800/80"
          style={{
            background: "linear-gradient(145deg, rgba(15, 23, 42, 0.4) 0%, rgba(3, 7, 18, 0.8) 100%)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 30px 70px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.03)"
          }}
        >
          <div className="space-y-2 mb-8">
            <h3 className="text-2xl font-black text-white tracking-tight uppercase">Belépés a rendszerbe</h3>
            <p className="text-xs text-zinc-500 font-medium font-mono uppercase tracking-wider">Tenyésztői hitelesítés szükséges.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-bold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 block px-1">Email cím</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@kennel.com"
                className="w-full h-12 px-4 rounded-xl border border-zinc-800 bg-zinc-950/50 text-white font-medium text-sm placeholder-zinc-600 focus:outline-none focus:border-[#023FF9] transition-all"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Jelszó</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-4 pr-12 rounded-xl border border-zinc-800 bg-zinc-950/50 text-white font-medium text-sm placeholder-zinc-600 focus:outline-none focus:border-[#023FF9] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-6 rounded-xl bg-[#023FF9] text-white text-xs font-black uppercase tracking-widest hover:bg-[#023FF9]/90 transition-all shadow-lg shadow-[#023FF9]/20 flex items-center justify-center gap-2"
              style={{ border: "none" }}
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Rendszer Autentikáció"}
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-zinc-900 text-center">
            <span className="text-[9px] uppercase font-black tracking-[0.2em] text-[#C6FF33] opacity-80">🔒 Closed Platform • Invitation Only</span>
          </div>
        </div>
      </div>

    </div>
  );
}
