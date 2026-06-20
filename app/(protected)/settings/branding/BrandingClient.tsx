"use client";

import { useState } from "react";

export default function BrandingClient({ settings }: any) {
  const [isSaving, setIsSaving] = useState(false);

  // 1. Brand Colors States
  const [themeMode, setThemeMode] = useState(settings.theme_mode || "dark");
  const [palette, setPalette] = useState(settings.preset_palette || "obsidian_dark");
  const [primary, setPrimary] = useState(settings.primary_color || "#7D39EB");
  const [accent, setAccent] = useState(settings.accent_color || "#C6FF33");
  const [bg, setBg] = useState(settings.bg_color || "#000000");
  const [surface, setSurface] = useState(settings.surface_color || "#090A0F");
  const [textColor, setTextColor] = useState(settings.text_color || "#FFFFFF");
  const [borderColor, setBorderColor] = useState(settings.border_color || "rgba(255,255,255,0.08)");
  
  const [bgGradEnabled, setBgGradientEnabled] = useState(settings.bg_gradient_enabled === true);
  const [bgGradFrom, setBgGradientFrom] = useState(settings.bg_gradient_from || "#000000");
  const [bgGradTo, setBgGradientTo] = useState(settings.bg_gradient_to || "#090A0F");
  const [bgGradAngle, setBgGradientAngle] = useState(settings.bg_gradient_angle || 135);
  const [bgPattern, setBgPattern] = useState(settings.bg_pattern || "none");

  // 2. Typography & Headings States
  const [fontFamily, setFontFamily] = useState(settings.font_family || "inter");
  const [fontScale, setFontScale] = useState(settings.font_scale || 100);
  const [fontWeight, setFontWeight] = useState(settings.font_weight || 400);
  const [letterSpacing, setLetterSpacing] = useState(settings.letter_spacing || 0);
  const [headingColor, setHeadingColor] = useState(settings.heading_color || "#FFFFFF");
  const [headingUpper, setHeadingUppercase] = useState(settings.heading_uppercase === true);
  const [subHeadingColor, setSubHeadingColor] = useState(settings.sub_heading_color || "#9CA3AF");

  // 3. Atomi Dashboard Widgets States
  const [wDogsBg, setWidgetDogsBg] = useState(settings.widget_dogs_bg || "#7D39EB15");
  const [wLittersBg, setWidgetLittersBg] = useState(settings.widget_litters_bg || "#C6FF3310");
  const [wHeatsBg, setWidgetHeatsBg] = useState(settings.widget_heats_bg || "#7D39EB08");
  const [wFinanceBg, setWidgetFinanceBg] = useState(settings.widget_finance_bg || "#C6FF3308");

  // 4. Gombok & Inputok States
  const [btnPrimaryBg, setBtnPrimaryBg] = useState(settings.btn_primary_bg || "#C6FF33");
  const [btnPrimaryText, setBtnPrimaryText] = useState(settings.btn_primary_text || "#000000");
  const [btnRadius, setBtnRadius] = useState(settings.btn_radius || 12);
  const [inputBg, setInputBg] = useState(settings.input_bg || "rgba(255,255,255,0.04)");
  const [inputBorder, setInputBorder] = useState(settings.input_border || "rgba(255,255,255,0.08)");

  // 5. Sidebar States
  const [sidebarBg, setSidebarBg] = useState(settings.sidebar_bg || "#090A0F");
  const [sidebarActiveBg, setSidebarActiveBg] = useState(settings.sidebar_active_bg || "#7D39EB");
  const [sidebarWidth, setSidebarWidth] = useState(settings.sidebar_width || 270);

  // 6. Core Framework & Layout States
  const [uiRadius, setUiRadius] = useState(settings.ui_radius || "medium");
  const [uiAnimation, setUiAnimation] = useState(settings.ui_animation || "normal");
  const [uiStyle, setUiStyle] = useState(settings.ui_style || "glass");
  const [customCss, setCustomCss] = useState(settings.custom_css || "");
  const [kennelName, setKennelName] = useState(settings.kennel_name || "Saját Kennel");

  const PALETTES = [
    { id: "obsidian_dark", name: "Obsidian (Default Dark)", primary: "#7D39EB", accent: "#C6FF33", bg: "#000000", surface: "#090A0F" },
    { id: "obsidian_light", name: "Obsidian Light", primary: "#7D39EB", accent: "#C6FF33", bg: "#FFFFFF", surface: "#F3F4F6" },
    { id: "electric_dark", name: "Electric Blue Dark", primary: "#023FF9", accent: "#C6FF34", bg: "#011A2E", surface: "#08233F" },
    { id: "electric_light", name: "Electric Blue Light", primary: "#023FF9", accent: "#C6FF34", bg: "#FFFFFF", surface: "#EDF5FF" },
    { id: "custom", name: "⚙️ Haladó Custom Designer Builder", primary: primary, accent: accent, bg: bg, surface: surface }
  ];

  function selectPalette(p: any) {
    setPalette(p.id);
    if (p.id === "custom") return;
    setPrimary(p.primary);
    setAccent(p.accent);
    setBg(themeMode === "light" ? "#FFFFFF" : p.bg);
    setSurface(p.surface);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    const fd = new FormData();
    fd.set("preset_palette", palette);
    fd.set("theme_mode", themeMode);
    fd.set("primary_color", primary);
    fd.set("accent_color", accent);
    fd.set("bg_color", bg);
    fd.set("surface_color", surface);
    fd.set("text_color", textColor);
    fd.set("border_color", borderColor);
    fd.set("bg_gradient_enabled", String(bgGradEnabled));
    fd.set("bg_gradient_from", bgGradFrom);
    fd.set("bg_gradient_to", bgGradTo);
    fd.set("bg_gradient_angle", String(bgGradAngle));
    fd.set("bg_pattern", bgPattern);
    fd.set("font_family", fontFamily);
    fd.set("font_scale", String(fontScale));
    fd.set("font_weight", String(fontWeight));
    fd.set("letter_spacing", String(letterSpacing));
    fd.set("heading_color", headingColor);
    fd.set("heading_uppercase", String(headingUpper));
    fd.set("sub_heading_color", subHeadingColor);
    fd.set("widget_dogs_bg", wDogsBg);
    fd.set("widget_litters_bg", wLittersBg);
    fd.set("widget_heats_bg", wHeatsBg);
    fd.set("widget_finance_bg", wFinanceBg);
    fd.set("btn_primary_bg", btnPrimaryBg);
    fd.set("btn_primary_text", btnPrimaryText);
    fd.set("btn_radius", String(btnRadius));
    fd.set("input_bg", inputBg);
    fd.set("input_border", inputBorder);
    fd.set("sidebar_bg", sidebarBg);
    fd.set("sidebar_active_bg", sidebarActiveBg);
    fd.set("sidebar_width", String(sidebarWidth));
    fd.set("ui_radius", uiRadius);
    fd.set("ui_animation", uiAnimation);
    fd.set("ui_style", uiStyle);
    fd.set("custom_css", customCss);
    fd.set("kennel_name", kennelName);

    try {
      const res = await fetch("/api/branding", { method: "POST", body: fd });
      if (res.ok) {
        window.location.reload();
      } else {
        alert("Szerver hiba történt a tokenek feldolgozásakor.");
        setIsSaving(false);
      }
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-8 pb-32">
      <div>
        <h1 className="text-4xl font-black">Appearance & Architecture Control</h1>
        <p className="opacity-60">Prémium White-Label Custom Theme Builder & Tokener Matrix.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. CORE PRESETS */}
          <div className="card p-6 space-
