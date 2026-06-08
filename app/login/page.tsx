import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  async function signIn(formData: FormData) {
    "use server";

    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      return;
    }

    const supabase = createServerSupabase();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    redirect("/dashboard");
  }

  async function signUp(formData: FormData) {
    "use server";

    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      return;
    }

    const supabase = createServerSupabase();

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Kennel SaaS Login
        </h1>

        <form className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded bg-black border border-zinc-700"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded bg-black border border-zinc-700"
          />

          <div className="flex gap-3">
            <button
              formAction={signIn}
              className="flex-1 bg-white text-black p-3 rounded font-medium"
            >
              Sign In
            </button>

            <button
              formAction={signUp}
              className="flex-1 bg-zinc-700 text-white p-3 rounded font-medium"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
