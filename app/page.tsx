import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const supabase = createServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/dashboard");
    }

    redirect("/login");
  } catch {
    redirect("/login");
  }
}
