export const THEMES = {
  obsidian_dark: {
    primary: "#7D39EB", accent: "#C6FF33", bg: "#000000", surface: "#090A0F", text: "#FFFFFF", border: "rgba(255,255,255,0.08)",
    c1: "#0A0A0A", c2: "#101014", c3: "#131318", c4: "#16161F"
  },
  obsidian_light: {
    primary: "#7D39EB", accent: "#C6FF33", bg: "#FFFFFF", surface: "#F3F4F6", text: "#000000", border: "rgba(0,0,0,0.08)",
    c1: "#FAFAFA", c2: "#F3F4F6", c3: "#ECEEF3", c4: "#E5E7EB"
  },
  electric_dark: {
    primary: "#023FF9", accent: "#C6FF34", bg: "#011A2E", surface: "#08233F", text: "#FFFFFF", border: "rgba(255,255,255,0.08)",
    c1: "#08233F", c2: "#0E2C4A", c3: "#14375B", c4: "#1A436C"
  },
  electric_light: {
    primary: "#023FF9", accent: "#C6FF34", bg: "#FFFFFF", surface: "#EDF5FF", text: "#011A2E", border: "rgba(1,26,46,0.08)",
    c1: "#F8FBFF", c2: "#EDF5FF", c3: "#E4EEFF", c4: "#DBE9FF"
  }
} as const;

export type BrandingSettings = {
  preset_palette?: string | null;
  theme_mode?: string | null;
  
  // Global colors
  primary_color?: string | null;
  accent_color?: string | null;
  bg_color?: string | null;
  surface_color?: string | null;
  text_color?: string | null;
  border_color?: string | null;
  bg_gradient_enabled?: boolean | null;
  bg_gradient_from?: string | null;
  bg_gradient_to?: string | null;
  bg_gradient_angle?: number | null;
  bg_pattern?: string | null;

  // Headings & Typography
  font_family?: string | null;
  font_weight?: number | null;
  font_scale?: number | null;
  letter_spacing?: number | null;
  heading_color?: string | null;
  heading_uppercase?: boolean | null;
  sub_heading_color?: string | null;

  // Atomi Dashboard Widget kártyák
  widget_dogs_bg?: string | null;
  widget_dogs_icon_bg?: string | null;
  widget_dogs_icon_color?: string | null;
  widget_litters_bg?: string | null;
  widget_litters_icon_bg?: string | null;
  widget_litters_icon_color?: string | null;
  widget_heats_bg?: string | null;
  widget_heats_icon_bg?: string | null;
  widget_heats_icon_color?: string | null;
  widget_finance_bg?: string | null;
  widget_finance_icon_bg?: string | null;
  widget_finance_icon_color?: string | null;

  // Gombok és Inputs
  btn_primary_bg?: string | null;
  btn_primary_text?: string | null;
  btn_radius?: number | null;
  input_bg?: string | null;
  input_border?: string | null;

  // Sidebar tuning
  sidebar_bg?: string | null;
  sidebar_active_bg?: string | null;
  sidebar_text_color?: string | null;
  sidebar_width?: number | null;

  // Effects & Layout
  ui_radius?: string | null;
  ui_animation?: string | null;
  ui_style?: string | null;
  custom_css?: string | null;
  kennel_name?: string | null;
};

export function buildThemeTokens(settings?: BrandingSettings | null) {
  const pKey = (settings?.preset_palette || "obsidian_dark") as keyof typeof THEMES;
  const palette = THEMES[pKey] ?? THEMES.obsidian_dark;
  const isCustom = settings?.preset_palette === "custom";

  // 1. Core Base Assignment
  const primary = isCustom ? settings?.primary_color || "#7D39EB" : palette.primary;
  const accent = isCustom ? settings?.accent_color || "#C6FF33" : palette.accent;
  const bg = isCustom ? settings?.bg_color || "#000000" : palette.bg;
  const surface = isCustom ? settings?.surface_color || "#090A0F" : palette.surface;
  const text = isCustom ? settings?.text_color || "#FFFFFF" : palette.text;
  const border = isCustom ? settings?.border_color || "rgba(255,255,255,0.08)" : palette.border;

  // 2. Typography Mapper (6 prémium kért font)
  const fontMap: Record<string, string> = {
    inter: "'Inter', sans-serif",
    manrope: "'Manrope', sans-serif",
    sora: "'Sora', sans-serif",
    poppins: "'Poppins', sans-serif",
    jakarta: "'Plus Jakarta Sans', sans-serif",
    grotesk: "'Space Grotesk', sans-serif"
  };
  const font = fontMap[settings?.font_family || "inter"] || "'Inter', sans-serif";
  const fontScale = (settings?.font_scale || 100) / 100;

  // 3. Atomi Dashboard kártyák fallback logikája
  const dDogsBg = isCustom ? settings?.widget_dogs_bg || `${primary}15` : palette.c1;
  const dLittersBg = isCustom ? settings?.widget_litters_bg || `${accent}10` : palette.c2;
  const dHeatsBg = isCustom ? settings?.widget_heats_bg || `${primary}08` : palette.c3;
  const dFinanceBg = isCustom ? settings?.widget_finance_bg || `${accent}08` : palette.c4;

  return {
    primary, accent, bg, surface, text, border, font, fontScale,
    headingColor: isCustom ? settings?.heading_color || text : text,
    subHeadingColor: isCustom ? settings?.sub_heading_color || `${text}A0` : `${text}A0`,
    headingUppercase: settings?.heading_uppercase === true ? "uppercase" : "none",
    fontWeight: settings?.font_weight || 400,
    letterSpacing: `${(settings?.letter_spacing || 0) * 0.5}px`,
    
    // Background matrix
    bgGradientEnabled: settings?.bg_gradient_enabled ?? false,
    bgGradientFrom: settings?.bg_gradient_from || bg,
    bgGradientTo: settings?.bg_gradient_to || surface,
    bgGradientAngle: settings?.bg_gradient_angle || 135,
    bgPattern: settings?.bg_pattern || "none",

    // Atomi kártyák
    widgetDogsBg: dDogsBg,
    widgetDogsIconBg: settings?.widget_dogs_icon_bg || primary,
    widgetDogsIconColor: settings?.widget_dogs_icon_color || "#000000",
    widgetLittersBg: dLittersBg,
    widgetLittersIconBg: settings?.widget_litters_icon_bg || accent,
    widgetLittersIconColor: settings?.widget_litters_icon_color || "#000000",
    widgetHeatsBg: dHeatsBg,
    widgetHeatsIconBg: settings?.widget_heats_icon_bg || primary,
    widgetHeatsIconColor: settings?.widget_heats_icon_color || "#000000",
    widgetFinanceBg: dFinanceBg,
    widgetFinanceIconBg: settings?.widget_finance_icon_bg || accent,
    widgetFinanceIconColor: settings?.widget_finance_icon_color || "#000000",

    // Gombok & Inputs
    btnPrimaryBg: isCustom ? settings?.btn_primary_bg || accent : accent,
    btnPrimaryText: isCustom ? settings?.btn_primary_text || "#000000" : "#000000",
    btnRadius: `${settings?.btn_radius ?? 12}px`,
    inputBg: isCustom ? settings?.input_bg || "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.04)",
    inputBorder: isCustom ? settings?.input_border || border : border,

    // Sidebar
    sidebarBg: isCustom ? settings?.sidebar_bg || surface : surface,
    sidebarActiveBg: isCustom ? settings?.sidebar_active_bg || primary : primary,
    sidebarTextColor: isCustom ? settings?.sidebar_text_color || text : text,
    sidebarWidth: `${settings?.sidebar_width || 270}px`,

    // Core Frame
    radius: settings?.ui_radius === "sharp" ? "0px" : settings?.ui_radius === "small" ? "6px" : settings?.ui_radius === "soft" ? "22px" : settings?.ui_radius === "luxury" ? "32px" : "14px",
    transition: settings?.ui_animation === "off" ? "0s" : settings?.ui_animation === "minimal" ? "120ms ease" : "240ms ease",
    customCss: settings?.custom_css || ""
  };
}
