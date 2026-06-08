import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md space-y-6 p-8 rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-wide">
            Kennel Access
          </h1>
          <p className="text-sm text-white/60">
            Sign in or create an account
          </p>
        </div>

        <form
          action={async (formData) => {
            "use server";

            const email = formData.get("email") as string;
            const password = formData.get("password") as string;

            const supabase = await createClient();

            const { error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (error) {
              throw new Error(error.message);
            }

            redirect("/protected/dashboard");
          }}
          className="space-y-3"
        >
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded bg-black border border-white/10"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded bg-black border border-white/10"
            required
          />

          <button className="w-full py-3 rounded bg-white text-black font-medium">
            Sign In
          </button>
        </form>

        <form
          action={async (formData) => {
            "use server";

            const email = formData.get("email") as string;
            const password = formData.get("password") as string;

            const supabase = await createClient();

            const { error } = await supabase.auth.signUp({
              email,
              password,
            });

            if (error) {
              throw new Error(error.message);
            }

            redirect("/protected/dashboard");
          }}
          className="space-y-3"
        >
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded bg-black border border-white/10"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded bg-black border border-white/10"
            required
          />

          <button className="w-full py-3 rounded border border-white/20 text-white">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
