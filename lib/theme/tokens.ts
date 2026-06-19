export const THEMES = {
  midnight: {
    primary: "#7D39EB",
    accent: "#C6FF33",
    bg: "#000000",
    surface: "#090A0F",
    text: "#FFFFFF",
  },

  aurora: {
    primary: "#4F46E5",
    accent: "#22D3EE",
    bg: "#050816",
    surface: "#0D1325",
    text: "#FFFFFF",
  },

  emerald: {
    primary: "#10B981",
    accent: "#6EE7B7",
    bg: "#03110E",
    surface: "#08231D",
    text: "#FFFFFF",
  },

  royal: {
    primary: "#A855F7",
    accent: "#FACC15",
    bg: "#070707",
    surface: "#111111",
    text: "#FFFFFF",
  },
} as const;

type ThemeName = keyof typeof THEMES;

type BrandingSettings = {
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

export function buildThemeTokens(
  settings?: BrandingSettings | null
) {
  const selected =
    THEMES[
      (
        settings?.preset_palette ??
        "midnight"
      ) as ThemeName
    ] ?? THEMES.midnight;

  const custom =
    settings?.preset_palette === "custom";

  const dark =
    settings?.theme_mode !== "light";

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
      ? "420ms cubic-bezier(.2,.8,.2,1)"
      : "220ms ease";

  const glass =
    settings?.ui_style === "glass"
      ? "blur(20px)"
      : "blur(0px)";

  const shadow =
    settings?.ui_style === "neon"
      ? `0 0 50px ${
          custom
            ? settings.primary_color
            : selected.primary
        }22`
      : "none";

  const bg = custom
    ? settings?.bg_color || "#000000"
    : dark
    ? selected.bg
    : "#FFFFFF";

  const surface = custom
    ? settings?.card_color || "#090A0F"
    : dark
    ? selected.surface
    : "#F8FAFC";

  const text = dark
    ? "#FFFFFF"
    : "#0F172A";

  const primary = custom
    ? settings?.primary_color || "#7D39EB"
    : selected.primary;

  const accent = custom
    ? settings?.accent_color || "#C6FF33"
    : selected.accent;

  return {
    primary,
    accent,

    bg,

    surface,

    text,

    border:
      dark
        ? "rgba(255,255,255,.08)"
        : "rgba(0,0,0,.08)",

    card1:
      `${primary}18`,

    card2:
      `${accent}18`,

    card3:
      `${primary}10`,

    radius,

    transition,

    glass,

    shadow,
  };
}
