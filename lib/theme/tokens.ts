export const THEMES = {
  midnight: {
    primary: "#7D39EB",
    accent: "#C6FF33",
    bgDark: "#000000",
    bgLight: "#FFFFFF",
  },

  aurora: {
    primary: "#2563EB",
    accent: "#2DD4BF",
    bgDark: "#020617",
    bgLight: "#F8FAFC",
  },

  emerald: {
    primary: "#10B981",
    accent: "#A3E635",
    bgDark: "#02140F",
    bgLight: "#F7FFF9",
  },

  royal: {
    primary: "#A855F7",
    accent: "#FACC15",
    bgDark: "#050505",
    bgLight: "#FFFFFF",
  },
};

export function createTheme(settings:any){

const dark=settings.theme_mode!=="light";

const base=
THEMES[
(settings.preset_palette||
"midnight")
as keyof typeof THEMES
];

return{

bg:
dark
? settings.bg_color||base.bgDark
: "#FFFFFF",

surface:
dark
? settings.card_color||"#090A0F"
: "#FFFFFF",

text:
dark
? "#FFFFFF"
: "#111111",

primary:
settings.primary_color||
base.primary,

accent:
settings.accent_color||
base.accent,

radius:
settings.ui_radius==="soft"
? "28px"
:
settings.ui_radius==="sharp"
? "0px"
:
"18px",

font:
settings.font_family||
"Inter"

};

}
