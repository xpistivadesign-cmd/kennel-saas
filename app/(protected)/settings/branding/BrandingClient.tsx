"use client";

import { useState, useTransition } from "react";

// Az inspirációs Pinterest / Behance képek alapján újragondolt luxus paletta-mátrix
export const BRANDING_PRESETS = {
  obsidian_platinum: { name: "Obsidian Platinum (Mérnöki)", bg: "#0A0B0F", heading: "#E5E7EB", body: "#8B8D98", accent: "#8B8D98" },
  royal_gold: { name: "Royal Navy & Gold (Luxus)", bg: "#060B16", heading: "#E2D1B3", body: "#A2B3C6", accent: "#C6A675" },
  creme_burgundy: { name: "Creme & Deep Burgundy", bg: "#F4EFEA", heading: "#4A0E17", body: "#7A6865", accent: "#A11A4B" },
  cyber_neon: { name: "Cyberpunk Tech (Élénk)", bg: "#07040F", heading: "#00FFCC", body: "#EEA0FF", accent: "#5A4EFF" },
  swiss_emerald: { name: "Swiss Green (Letisztult)", bg: "#061310", heading: "#E2F4F0", body: "#789A93", accent: "#22C55E" },
  sandstone_cosy: { name: "Sandstone Beige (Meleg)", bg: "#151210", heading: "#E7CFA4", body: "#A19284", accent: "#C19A6B" },
  arctic_white: { name: "Arctic Minimal (Világos)", bg: "#F8FAFC", heading: "#0F172A", body: "#64748B", accent: "#06B6D4" },
  burnt_peach: { name: "Burnt Peach & Sage", bg: "#1A1512", heading: "#F4A27E", body: "#9FB1A5", accent: "#E67E22" },
  inkwell_eclipse: { name: "Inkwell Dark Chrome", bg: "#121318", heading: "#FFFFFF", body: "#71717A", accent: "#E2E8F0" },
  forest_heritage: { name: "Forest Prestige", bg: "#0B140F", heading: "#D1E7DD", body: "#748E81", accent: "#81C784" },
  monetto_flat: { name: "Monetto Terracotta", bg: "#FDFBF7", heading: "#EA2E00", body: "#5A6E72", accent: "#9DBDB8" },
  graphite_monochrome: { name: "Graphite Studio", bg: "#09090B", heading: "#FFFFFF", body: "#71717A", accent: "#FFFFFF" },
};

export default function BrandingClient({ settings, saveBrandingAction }: any) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("my-kennel");

  const [themeMode, setThemeMode] = useState(settings.theme_mode || "preset");
  const [selectedPreset, setSelectedPreset] = useState(settings.preset_palette || "obsidian_platinum");

  const [customBg, setCustomBg] = useState(settings.bg_color || "#0A0B0F");
  const [customAccent, setCustomAccent] = useState(settings.accent_color || "#8B8D98");

  const [customHeading, setCustomHeading] = useState(settings.text_heading_color || "#FFFFFF");
  const [customBody, setCustomBody] = useState(settings.text_body_color || "#A1A1AA");
  const [customCardText, setCustomCardText] = useState(settings.text_card_color || "#FFFFFF");

  const [kennelName, setKennelName] = useState(settings.kennel_name || "Saját Kennel");
  const [fontName, setFontName] = useState(settings.google_font_name || "Inter");

  const [widgets, setWidgets] = useState({
    dogs: true, heats: true, litters: true, finance: true, shows: true, calendar: true
  });

  const applyWorkspacePreset = (mode: string) => {
    if (mode === "breeding") {
      setWidgets({ dogs: true, heats: true, litters: true, finance: false, shows: false, calendar: true });
    } else if (mode === "show") {
      setWidgets({ dogs: true, heats: false, litters: false, finance: false, shows: true, calendar: true });
    } else if (mode === "finance") {
      setWidgets({ dogs: false, heats: false, litters: false, finance: true, shows: false, calendar: true });
    } else {
      setWidgets({ dogs: true, heats: true, litters: true, finance: true, shows: true, calendar: true });
    }
    alert(`Workspace átváltva: ${mode.toUpperCase()} MODE.`);
  };

  const pData = BRANDING_PRESETS[selectedPreset as keyof typeof BRANDING_PRESETS] || BRANDING_PRESETS.obsidian_platinum;
  const currentBg = themeMode === "preset" ? pData.bg : customBg;
  const currentAccent = themeMode === "preset" ? pData.accent : customAccent;
  const currentHeading = themeMode === "preset" ? pData.heading : customHeading;
  const currentBody = themeMode === "preset" ? pData.body : customBody;
  const currentCardText = themeMode === "preset" ? pData.heading : customCardText;

  const checkContrastValid = (bgHex: string, textHex: string) => {
    const getRGB = (c: string
