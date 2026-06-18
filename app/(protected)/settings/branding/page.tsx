import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import BrandingClient from "./BrandingClient";

export const dynamic = "force-dynamic";

async function saveBrandingAction(formData: FormData) {
  "use server";
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const accent_color = String(formData.get("accent_color"));
  const bg_style = String(formData.get("bg_style"));
  const font_family = String(formData.get("font_family"));
  const logo_url = String(formData.get("logo_url") || "");

  // Megnézzük létezik-e már beállítás
  const { data: existing } = await supabase
    .from("branding_settings")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const payload = {
    user_id: user.id,
    accent_color,
    bg_style,
    font_family,
    logo_url: logo_url.trim() || null,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    await supabase.from("branding_settings").update(payload).eq("user_id", user.id);
  } else {
    await supabase.from("branding_settings").insert(payload);
  }

  revalidatePath("/settings/branding");
}

export default async function BrandingPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Lekérjük a meglévő beállításokat, ha nincsenek, alapértelmezett értékeket adunk
  const { data: settings } = await supabase
    .from("branding_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const defaultSettings = settings || {
    accent_color: "#3b82f6",
    bg_style: "zinc",
    font_family: "sans",
    logo_url: null,
  };

  return (
    <BrandingClient 
      settings={defaultSettings} 
      saveBrandingAction={saveBrandingAction} 
    />
  );
}
