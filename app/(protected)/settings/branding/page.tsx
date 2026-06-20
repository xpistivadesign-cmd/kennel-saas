import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BrandingClient from "./BrandingClient";

export const dynamic = "force-dynamic";

export default async function BrandingPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: settings } = await supabase
    .from("branding_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return <BrandingClient settings={settings || {}} />;
}
