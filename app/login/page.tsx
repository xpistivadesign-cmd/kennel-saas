import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md space-y-6 border border-white/10 p-8 rounded-xl">
        <h1 className="text-xl font-semibold">Kennel Login</h1>

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

            redirect("/dashboard");
          }}
          className="space-y-3"
        >
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full p-3 bg-black border border-white/10"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-black border border-white/10"
            required
          />

          <button className="w-full bg-white text-black py-2">
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

            redirect("/dashboard");
          }}
          className="space-y-3"
        >
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full p-3 bg-black border border-white/10"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-black border border-white/10"
            required
          />

          <button className="w-full border border-white/20 py-2">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
