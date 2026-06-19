"use client";

import { useState, useTransition } from "react";

// A képeid alapján kinyert, szigorúan 3-3 színből álló prémium paletták
export const BRANDING_PRESETS = {
  deep_burgundy: { name: "Mély Burgundi & Krém", bg: "#0E0D0D", heading: "#EEDCC1", accent: "#5E001A" },
  royal_navy: { name: "Navy & Elegáns Arany", bg: "#1F2A44", heading: "#E8DCC8", accent: "#C6A75E" },
  cyber_neon: { name: "Cyberpunk Kék & Lila", bg: "#0E48C1", heading: "#3DF8F8", accent: "#E23AFB" },
  neon_lime: { name: "High-Tech Sötét & Lime", bg: "#8116E0", heading: "#FEFFFC", accent: "#DDFF00" },
  behance_pastel: { name: "Behance Pasztell", bg: "#F5F5F5", heading: "#5A4EFF", accent: "#EEA0FF" },
  travel_app: { name: "Travel App Minimal", bg: "#F5F5F5", heading: "#4B5563", accent: "#E2F4A6" },
};

export default function BrandingClient({ settings, saveBrandingAction }: any) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("my-kennel");

  const [themeMode, setThemeMode] = useState(settings.theme_mode || "preset");
  const [selectedPreset, setSelectedPreset] = useState(settings.preset_palette || "deep_burgundy");

  const [customBg, setCustomBg] = useState(settings.bg_color || "#0A0B0F");
  const [customAccent, setCustomAccent] = useState(settings.accent_color || "#8B8D98");
  const [customHeading, setCustomHeading] = useState(settings.text_heading_color || "#FFFFFF");

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

  const pData = BRANDING_PRESETS[selectedPreset as keyof typeof BRANDING_PRESETS] || BRANDING_PRESETS.deep_burgundy;
  const currentBg = themeMode === "preset" ? pData.bg : customBg;
  const currentAccent = themeMode === "preset" ? pData.accent : customAccent;
  const currentHeading = themeMode === "preset" ? pData.heading : customHeading;

  const checkContrastValid = (bgHex: string, textHex: string) => {
    const getRGB = (c: string) => {
      const h = c.replace("#", "");
      return { 
        r: parseInt(h.substr(0, 2), 16) || 0, 
        g: parseInt(h.substr(2, 2), 16) || 0, 
        b: parseInt(h.substr(4, 2), 16) || 0 
      };
    };
    const c1 = getRGB(bgHex); 
    const c2 = getRGB(textHex);
    const yiq1 = ((c1.r * 299) + (c1.g * 587) + (c1.b * 114)) / 1000;
    const yiq2 = ((c2.r * 299) + (c2.g * 587) + (c2.b * 114)) / 1000;
    return
