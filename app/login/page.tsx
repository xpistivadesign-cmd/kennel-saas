"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Inicializáljuk a kliensoldali Supabase-t a környezeti változóidból
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LoginPage() {
  const router = useRouter();
  
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
      // 🔐 ÉLES SUPABASE BEJELENTKEZÉS
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInErr) throw signInErr;

      // Sikeres belépés után azonnali irányítás a Dashboardra
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Autentikációs hiba:", err);
      setError(err.message || "Hiba történt a feldolgozás során.");
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth bejelentkezés élesítése (csak előre regisztrált/meghívott emailekkel fog működni!)
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#030712] font-sans antialiased selection:bg-[#023FF9] selection:text-white overflow-hidden">
      
      {/* 🌌 BAL OLDAL: PORTRÉ + INTUITÍV MÁTRIX FELIRATOK */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 bg-black border-r border-zinc-900">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1974&auto=format&fit=crop')` 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#030712]" />
        
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7D39EB]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#023FF9]/15 rounded-full blur-[120px] pointer-events-none" />

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
            <span>Track</span>
            <span className="text-zinc-800">•</span>
            <span>Breed</span>
            <span className="text-zinc-800">•</span>
            <span className="text-[#C6FF33]">Win</span>
          </div>
        </div>
      </div>

      {/* ⚡ JOBB OLDAL: GLASSMORPHISM BEJELENTKEZŐ KÁRTYA */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-[#023FF9]/5 rounded-full blur-[100px] pointer-events-none" />

        <div 
          className="w-full max-w-[460px] rounded-[32px] p-8 sm:p-10 relative overflow-hidden border border-zinc-800/80"
          style={{
            background: "linear-gradient(145deg, rgba(15, 23, 42, 0.4) 0%, rgba(3, 7, 18, 0.8) 100%)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 30px 70px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.03)"
          }}
        >
          <div className="lg:hidden mb-8">
            <h2 className="text-3xl font-black tracking-tight text-white uppercase">
              Kennel<span className="text-[#023FF9]">OS</span>
            </h2>
          </div>

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
            {/* EMAIL INPUT */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 block px-1">Email cím</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@kennel.com"
                className="w-full h-12 px-4 rounded-xl border border-zinc-800 bg-zinc-950/50 text-white font-medium text-sm placeholder-zinc-600 focus:outline-none focus:border-[#023FF9] focus:ring-1 focus:ring-[#023FF9] transition-all"
              />
            </div>

            {/* JELSZÓ INPUT SZEMECSKÉVEL ÉS ELFELEJTETT LINKKEL */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Jelszó</label>
                <button 
                  type="button"
                  onClick={() => alert("Jelszó-visszaállító kérelem elküldve a Supabase adminisztrátornak!")}
                  className="text-[10px] uppercase font-black tracking-widest text-[#7D39EB] hover:text-[#023FF9] transition-colors"
                >
                  Elfelejtetted?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-4 pr-12 rounded-xl border border-zinc-800 bg-zinc-950/50 text-white font-medium text-sm placeholder-zinc-600 focus:outline-none focus:border-[#023FF9] focus:ring-1 focus:ring-[#023FF9] transition-all"
                />
                
                {/* 👁️ JELSZÓ MUTATÓ SZEMECSKE GOMB */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* BEJELENTKEZÉS CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-4 rounded-xl bg-[#023FF9] text-white text-xs font-black uppercase tracking-widest hover:bg-[#023FF9]/90 transition-all active:scale-[0.98] shadow-lg shadow-[#023FF9]/20 flex items-center justify-center gap-2"
              style={{ border: "none" }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Rendszer Autentikáció"
              )}
            </button>
          </form>

          {/* ELVÁLASZTÓ */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800/60" />
            </div>
            <span className="relative z-10 px-3 bg-[#0c1220] text-[9px] uppercase font-black text-zinc-600 tracking-widest">vagy</span>
          </div>

          {/* GOOGLE BEJELENTKEZÉS */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-12 rounded-xl border border-zinc-800 bg-zinc-950/20 text-zinc-300 text-xs font-bold hover:bg-zinc-900/50 hover:text-white transition-all flex items-center justify-center gap-3"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Belépés Google fiókkal
          </button>

          {/* 🔒 PRÉMIUM MEGHÍVÁSOS RENDSZER JELZÉS */}
          <div className="mt-8 pt-4 border-t border-zinc-900 text-center">
            <span className="text-[9px] uppercase font-black tracking-[0.2em] text-[#C6FF33] opacity-80">
              🔒 Closed Platform • Invitation Only
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
