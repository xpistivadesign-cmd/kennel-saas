import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default function LoginPage() {
  async function signIn(formData: FormData) {
    "use server";

    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log("LOGIN ERROR:", error.message);
      throw new Error(error.message);
    }

    if (!data.session) {
      console.log("NO SESSION RETURNED");
      throw new Error("No session returned");
    }

    redirect("/dashboard");
  }

  async function signUp(formData: FormData) {
    "use server";

    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.log("SIGNUP ERROR:", error.message);
      throw new Error(error.message);
    }

    console.log("SIGNUP OK:", data);

    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-8 border border-white/10 rounded-xl space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>

        <form action={signIn} className="space-y-3">
          <input
            name="email"
            placeholder="Email"
            className="w-full p-2 bg-black border border-white/20"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full p-2 bg-black border border-white/20"
          />

          <button className="w-full bg-white text-black py-2">
            Sign In
          </button>
        </form>

        <form action={signUp}>
          <button className="w-full border border-white/30 py-2">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
