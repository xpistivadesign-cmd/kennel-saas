import type { Database } from "@/lib/db/types";

type Branding =
  Database["public"]["Tables"]["branding_settings"]["Row"];

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
    accent: "#06B6D4",
    bg: "#050816",
    surface: "#111827",
    text: "#FFFFFF",
  },

  emerald: {
    primary: "#10B981",
    accent: "#A3E635",
    bg: "#02120D",
    surface: "#06261C",
    text: "#FFFFFF",
  },

  royal: {
    primary: "#D4AF37",
    accent: "#FFE082",
    bg: "#090909",
    surface: "#171717",
    text: "#FFFFFF",
  },
} as const;

export function buildThemeTokens(
  settings: Partial<Branding> | null
) {
  const palette =
    (settings?.preset_palette ??
      "midnight") as keyof typeof THEMES;

  const selected =
    THEMES[palette] ??
    THEMES.midnight;

  const mode =
    settings?.theme_mode ??
    "dark";

  const isLight =
    mode === "light";

  const bg =
    isLight
      ? "#FFFFFF"
      : settings?.bg_color ||
        selected.bg;

  const surface =
    isLight
      ? "#F7F8FA"
      : settings?.card_color ||
        selected.surface;

  return {
    primary:
      settings?.primary_color ||
      selected.primary,

    accent:
      settings?.accent_color ||
      selected.accent,

    bg,

    surface,

    text:
      isLight
        ? "#111111"
        : selected.text,

    card1:
      settings?.primary_color
        ? `${settings.primary_color}14`
        : `${selected.primary}14`,

    card2:
      settings?.accent_color
        ? `${settings.accent_color}14`
        : `${selected.accent}14`,

    card3:
      settings?.primary_color
        ? `${settings.primary_color}22`
        : `${selected.primary}22`,

    border: isLight
      ? "#00000010"
      : "#FFFFFF10",
  };
}
