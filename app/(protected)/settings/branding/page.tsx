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
  const kennel_name = String(formData.get("kennel_name") || "Saját Kennel");
  const owner_name = String(formData.get("owner_name") || "");
  const kennel_address = String(formData.get("kennel_address") || "");
  const tax_number = String(formData.get("tax_number") || "");
  const icon_style = String(formData.get("icon_style") || "minimal");

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
    kennel_name,
    owner_name,
    kennel_address,
    tax_number,
    icon_style,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    await supabase.from("branding_settings").update(payload).eq("user_id", user.id);
  } else {
    await supabase.from("branding_settings").insert(payload);
  }

  revalidatePath("/", "layout");
}

export default async function BrandingPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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
    kennel_name: "Saját Kennel",
    owner_name: "",
    kennel_address: "",
    tax_number: "",
    icon_style: "minimal",
  };

  return (
    <BrandingClient 
      settings={defaultSettings} 
      saveBrandingAction={saveBrandingAction} 
    />
  );
}
