export const THEMES = {
  midnight: { primary: "#7D39EB", accent: "#C6FF33", bg: "#000000", surface: "#090A0F", text: "#FFFFFF", border: "rgba(255,255,255,0.08)" },
  aurora:   { primary: "#6D28D9", accent: "#22D3EE", bg: "#030712", surface: "#111827", text: "#FFFFFF", border: "rgba(255,255,255,0.08)" },
  electric: { primary: "#4F46E5", accent: "#00FFA3", bg: "#050505", surface: "#111111", text: "#FFFFFF", border: "rgba(255,255,255,0.08)" },
  royal:    { primary: "#D4AF37", accent: "#FFF4CC", bg: "#080808", surface: "#181818", text: "#FFFFFF", border: "rgba(255,255,255,0.05)" },
  lime:     { primary: "#7D39EB", accent: "#C6FF33", bg: "#000000", surface: "#101010", text: "#FFFFFF", border: "rgba(255,255,255,0.08)" },
  custom:   { primary: "#7D39EB", accent: "#C6FF33", bg: "#000000", surface: "#090A0F", text: "#FFFFFF", border: "rgba(255,255,255,0.08)" }
} as const;

export type BrandingSettings = {
  preset_palette?: string | null;
  theme_mode?: string | null;
  primary_color?: string | null;
  accent_color?: string | null;
  bg_color?: string | null;
  surface_color?: string | null;
  text_color?: string | null;
  border_color?: string | null;

  card_mode?: string | null;
  card_1?: string | null;
  card_2?: string | null;
  card_3?: string | null;
  card_4?: string | null;
  card_glow?: number | null;
  card_blur?: number | null;
  card_opacity?: number | null;

  gradient_enabled?: boolean | null;
  gradient_type?: string | null;
  gradient_from?: string | null;
  gradient_to?: string | null;
  gradient_angle?: number | null;
  gradient_strength?: number | null;

  glass_enabled?: boolean | null;
  glass_blur?: number | null;
  glass_opacity?: number | null;
  glass_border_glow?: number | null;
  glass_shadow?: number | null;

  font_family?: string | null;
  font_scale?: number | null;
  font_weight?: number | null;
  letter_spacing?: number | null;

  button_style?: string | null;
  button_radius?: number | null;
  button_glow?: number | null;

  sidebar_bg?: string | null;
  sidebar_active?: string | null;
  sidebar_hover?: string | null;
  sidebar_width?: number | null;

  animation?: string | null;
  hover_lift?: number | null;
  cursor_glow?: boolean | null;
  parallax_enabled?: boolean | null;
  custom_css?: string | null;
};

export function buildThemeTokens(settings?: BrandingSettings | null) {
  const palette = THEMES[(settings?.preset_palette ?? "midnight") as keyof typeof THEMES] ?? THEMES.midnight;
  const isCustom = settings?.preset_palette === "custom";
  const isDark = settings?.theme_mode !== "light";

  // 1. Brand Colors
  const primary = isCustom ? settings?.primary_color || "#7D39EB" : palette.primary;
  const accent = isCustom ? settings?.accent_color || "#C6FF33" : palette.accent;
  const bg = isDark ? (isCustom ? settings?.bg_color || "#000000" : palette.bg) : "#FFFFFF";
  const surface = isDark ? (isCustom ? settings?.surface_color || "#090A0F" : palette.surface) : "#F3F4F6";
  const text = isDark ? (isCustom ? settings?.text_color || "#FFFFFF" : "#FFFFFF") : "#111827";
  const border = isCustom ? settings?.border_color || "rgba(255,255,255,0.08)" : palette.border;

  // 2. Dashboard Cards Modes
  const cardMode = settings?.card_mode || "uniform";
  const c1 = settings?.card_1 || `${primary}15`;
  const c2 = settings?.card_2 || `${accent}10`;
  const c3 = settings?.card_3 || `${primary}08`;
  const c4 = settings?.card_4 || `${accent}08`;

  let card1 = surface, card2 = surface, card3 = surface, card4 = surface;
  if (cardMode === "alternating" || cardMode === "mixed" || cardMode === "dynamic") {
    card1 = c1; card2 = c2; card3 = c3; card4 = c4;
  } else if (cardMode === "violet") {
    card1 = `${primary}20`; card2 = `${primary}15`; card3 = `${primary}10`; card4 = `${primary}05`;
  } else if (cardMode === "lime") {
    card1 = `${accent}20`; card2 = `${accent}15`; card3 = `${accent}10`; card4 = `${accent}05`;
  }

  // 3. Typography Mapper
  const fontMap: Record<string, string> = {
    inter: "'Inter', sans-serif",
    geist: "'Geist', sans-serif",
    poppins: "'Poppins', sans-serif",
    manrope: "'Manrope', sans-serif",
    sora: "'Sora', sans-serif"
  };
  const font = fontMap[settings?.font_family || "inter"] || "'Inter', sans-serif";
  const fontScale = (settings?.font_scale || 100) / 100;

  return {
    primary, accent, bg, surface, text, border,
    cardMode, card1, card2, card3, card4,
    cardGlow: settings?.card_glow ?? 0,
    cardBlur: settings?.card_blur ?? 0,
    cardOpacity: settings?.card_opacity ?? 100,
    gradientEnabled: settings?.gradient_enabled ?? false,
    gradientType: settings?.gradient_type || "linear",
    gradientFrom: settings?.gradient_from || primary,
    gradientTo: settings?.gradient_to || accent,
    gradientAngle: settings?.gradient_angle ?? 135,
    gradientStrength: settings?.gradient_strength ?? 50,
    glassEnabled: settings?.glass_enabled ?? false,
    glassBlur: settings?.glass_blur ?? 18,
    glassOpacity: settings?.glass_opacity ?? 20,
    glassBorderGlow: settings?.glass_border_glow ?? 0,
    glassShadow: settings?.glass_shadow ?? 15,
    font, fontScale,
    fontWeight: settings?.font_weight || 400,
    letterSpacing: `${(settings?.letter_spacing ?? 0) * 0.1}px`,
    buttonStyle: settings?.button_style || "solid",
    buttonRadius: `${settings?.button_radius ?? 12}px`,
    buttonGlow: settings?.button_glow ?? 0,
    sidebarBg: settings?.sidebar_bg || (isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"),
    sidebarActive: settings?.sidebar_active || primary,
    sidebarHover: settings?.sidebar_hover || "rgba(255,255,255,0.04)",
    sidebarWidth: `${settings?.sidebar_width || 270}px`,
    animation: settings?.animation || "normal",
    hoverLift: `${settings?.hover_lift || 0}px`,
    cursorGlow: settings?.cursor_glow ?? false,
    parallaxEnabled: settings?.parallax_enabled ?? false,
    customCss: settings?.custom_css || ""
  };
}
