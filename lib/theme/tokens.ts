export const THEMES = {
  midnight: {
    primary: "#7D39EB",
    accent: "#C6FF33",
    bg: "#000000",
    surface: "#090A0F",
    text: "#FFFFFF",
  },

  aurora: {
    primary: "#0EA5E9",
    accent: "#2DD4BF",
    bg: "#050816",
    surface: "#0B1329",
    text: "#FFFFFF",
  },

  emerald: {
    primary: "#10B981",
    accent: "#34D399",
    bg: "#022C22",
    surface: "#064E3B",
    text: "#FFFFFF",
  },

  royal: {
    primary: "#D4AF37",
    accent: "#F3E5AB",
    bg: "#0B0C10",
    surface: "#1F2833",
    text: "#FFFFFF",
  },
} as const;

type ThemeKey = keyof typeof THEMES;

export type BrandingSettings = {
  preset_palette?: string | null;
  theme_mode?: string | null;

  primary_color?: string | null;
  accent_color?: string | null;
  bg_color?: string | null;
  card_color?: string | null;

  ui_radius?: string | null;
  ui_animation?: string | null;
  ui_style?: string | null;
};

export type ThemeTokens = {
  primary: string;
  accent: string;

  bg: string;
  surface: string;
  text: string;

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
};

export function buildThemeTokens(
  settings?: BrandingSettings | null
): ThemeTokens {
  const palette =
    THEMES[
      (settings?.preset_palette ??
        "midnight") as ThemeKey
    ] ?? THEMES.midnight;

  const isCustom =
    settings?.preset_palette === "custom";

  const isDark =
    settings?.theme_mode !== "light";

  const primary =
    isCustom
      ? settings?.primary_color || "#7D39EB"
      : palette.primary;

  const accent =
    isCustom
      ? settings?.accent_color || "#C6FF33"
      : palette.accent;

  const bg =
    isCustom
      ? settings?.bg_color || "#000000"
      : isDark
      ? palette.bg
      : "#FFFFFF";

  const surface =
    isCustom
      ? settings?.card_color || "#090A0F"
      : isDark
      ? palette.surface
      : "#F8FAFC";

  const text =
    isDark
      ? "#FFFFFF"
      : "#111827";

  const radius =
    settings?.ui_radius === "sharp"
      ? "0px"
      : settings?.ui_radius === "soft"
      ? "28px"
      : "18px";

  const transition =
    settings?.ui_animation === "minimal"
      ? "0s"
      : settings?.ui_animation === "dynamic"
      ? "400ms cubic-bezier(.2,.8,.2,1)"
      : "240ms ease";

  const style =
    settings?.ui_style ||
    "glass";

  const glass =
    style === "glass"
      ? "blur(18px)"
      : "none";

  const glow =
    style === "neon"
      ? `${primary}55`
      : "transparent";

  const shadow =
    style === "glass"
      ? "0 12px 60px rgba(0,0,0,.15)"
      : style === "neon"
      ? `0 0 40px ${primary}25`
      : "none";

  const sidebar =
    isDark
      ? "rgba(255,255,255,.03)"
      : "rgba(255,255,255,.92)";

  return {
    primary,
    accent,

    bg,
    surface,
    text,

    border:
      isDark
        ? "rgba(255,255,255,.08)"
        : "rgba(0,0,0,.08)",

    card1: `${primary}18`,
    card2: `${accent}18`,
    card3: `${primary}0C`,

    radius,

    transition,

    glass,

    glow,

    shadow,

    sidebar,

    style,
  };
}
