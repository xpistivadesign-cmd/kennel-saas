export const THEMES = {
  midnight: { primary: "#7D39EB", accent: "#C6FF33", bg: "#000000", surface: "#090A0F" },
  aurora:   { primary: "#6D28D9", accent: "#22D3EE", bg: "#030712", surface: "#111827" },
  electric: { primary: "#4F46E5", accent: "#00FFA3", bg: "#050505", surface: "#111111" },
  royal:    { primary: "#D4AF37", accent: "#FFF4CC", bg: "#080808", surface: "#181818" },
  lime:     { primary: "#7D39EB", accent: "#C6FF33", bg: "#000000", surface: "#101010" },
  custom:   { primary: "#7D39EB", accent: "#C6FF33", bg: "#000000", surface: "#090A0F" },
} as const;

type ThemeKey = keyof typeof THEMES;

export type BrandingSettings = {
  preset_palette?: string | null;
  theme_mode?: string | null;
  primary_color?: string | null;
  accent_color?: string | null;
  bg_color?: string | null;
  card_color?: string | null;
  text_heading_color?: string | null;
  text_body_color?: string | null;
  ui_radius?: string | null;
  ui_animation?: string | null;
  ui_style?: string | null;
  ui_font?: string | null;
};

export type ThemeTokens = {
  primary: string;
  accent: string;
  bg: string;
  surface: string;
  textHeading: string;
  textBody: string;
  border: string;
  card1: string;
  card2: string;
  card3: string;
  radius: string;
  transition: string;
  glass: string;
  glow: string;
  shadow: string;
  sidebar: string;
  style: string;
  font: string;
};

export function buildThemeTokens(settings?: BrandingSettings | null): ThemeTokens {
  const palette = THEMES[(settings?.preset_palette ?? "midnight") as ThemeKey] ?? THEMES.midnight;
  const isCustom = settings?.preset_palette === "custom";
  const isDark = settings?.theme_mode !== "light";

  const primary = isCustom ? settings?.primary_color || "#7D39EB" : palette.primary;
  const accent = isCustom ? settings?.accent_color || "#C6FF33" : palette.accent;
  const bg = isCustom ? settings?.bg_color || "#000000" : isDark ? palette.bg : "#FFFFFF";
  const surface = isCustom ? settings?.card_color || "#090A0F" : isDark ? palette.surface : "#F3F4F6";

  // Intelligens betűszín vezérlés (Egyedi vagy Automatikus sötét/világos fallback)
  const textHeading = isCustom ? settings?.text_heading_color || "#FFFFFF" : isDark ? "#FFFFFF" : "#000000";
  const textBody = isCustom ? settings?.text_body_color || "#A1A1AA" : isDark ? "#9CA3AF" : "#374151";

  const radius = settings?.ui_radius === "sharp" ? "0px" : settings?.ui_radius === "soft" ? "28px" : "18px";
  const transition = settings?.ui_animation === "minimal" ? "0s" : settings?.ui_animation === "dynamic" ? "400ms cubic-bezier(.2,.8,.2,1)" : "240ms ease";

  const style = settings?.ui_style || "glass";
  const glass = style === "glass" ? "blur(20px)" : "none";
  const glow = style === "neon" ? `0 0 25px ${primary}40` : "none";
  const shadow = style === "glass" ? "0 8px 32px rgba(0,0,0,0.24)" : "none";
  const sidebar = isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)";
  
  // 10 darabos prémium Google Font Mapper
  const fontMap: Record<string, string> = {
    inter: "'Inter', sans-serif",
    poppins: "'Poppins', sans-serif",
    cinzel: "'Cinzel', serif",
    montserrat: "'Montserrat', sans-serif",
    outfit: "'Outfit', sans-serif",
    manrope: "'Manrope', sans-serif",
    playfair: "'Playfair Display', serif",
    roboto: "'Roboto', sans-serif",
    oswald: "'Oswald', sans-serif",
    ubuntu: "'Ubuntu', sans-serif"
  };
  const font = fontMap[settings?.ui_font || "inter"] || "'Inter', sans-serif";

  return {
    primary, accent, bg, surface, textHeading, textBody,
    border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    card1: `linear-gradient(135deg, ${primary}25, ${primary}05)`,
    card2: `linear-gradient(135deg, ${accent}20, ${accent}05)`,
    card3: `linear-gradient(135deg, ${primary}15, ${accent}10)`,
    radius, transition, glass, glow, shadow, sidebar, style, font
  };
}
