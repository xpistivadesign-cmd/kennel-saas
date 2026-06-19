"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type BrandingSettings = {
  theme_mode: string;
  preset_palette: string;

  primary_color: string;
  accent_color: string;
  bg_color: string;
  card_color: string;

  ui_style: string;
  ui_radius: string;
  ui_animation: string;
  ui_density: string;

  ui_font?: string;
  ui_gradient?: string;
  glass_intensity?: string;
  card_style?: string;

  kennel_name: string;
  owner_name: string;
  kennel_address: string;
  tax_number: string;
};

type Props = {
  settings: BrandingSettings;
  saveBrandingAction: (fd: FormData) => Promise<void>;
};

const PALETTES = [
  {
    id: "midnight",
    name: "Midnight Neon",
    primary: "#7D39EB",
    accent: "#C6FF33",
    bg: "#000000",
    card: "#090A0F",
  },

  {
    id: "aurora",
    name: "Aurora",
    primary: "#6D28D9",
    accent: "#22D3EE",
    bg: "#030712",
    card: "#111827",
  },

  {
    id: "electric",
    name: "Electric",
    primary: "#4F46E5",
    accent: "#00FFA3",
    bg: "#050505",
    card: "#111111",
  },

  {
    id: "royal",
    name: "Royal",
    primary: "#D4AF37",
    accent: "#FFF4CC",
    bg: "#080808",
    card: "#181818",
  },

  {
    id: "lime",
    name: "Violet Lime",
    primary: "#7D39EB",
    accent: "#C6FF33",
    bg: "#000",
    card: "#101010",
  },

  {
    id: "custom",
    name: "Custom",
    primary: "#7D39EB",
    accent: "#C6FF33",
    bg: "#000",
    card: "#090A0F",
  },
];

export default function BrandingClient({
  settings,
  saveBrandingAction,
}: Props) {
  const router = useRouter();

  const [pending, startTransition] = useTransition();

  const [themeMode, setThemeMode] = useState(
    settings.theme_mode ?? "dark"
  );

  const [palette, setPalette] = useState(
    settings.preset_palette
  );

  const [primary, setPrimary] = useState(
    settings.primary_color
  );

  const [accent, setAccent] = useState(
    settings.accent_color
  );

  const [bg, setBg] = useState(
    settings.bg_color
  );

  const [card, setCard] = useState(
    settings.card_color
  );

  const [style, setStyle] = useState(
    settings.ui_style
  );

  const [radius, setRadius] = useState(
    settings.ui_radius
  );

  const [animation, setAnimation] = useState(
    settings.ui_animation
  );

  const [density, setDensity] = useState(
    settings.ui_density
  );

  const [font, setFont] = useState(
    settings.ui_font || "inter"
  );

  const [gradient, setGradient] = useState(
    settings.ui_gradient || "soft"
  );

  const [glass, setGlass] = useState(
    settings.glass_intensity || "medium"
  );

  const [cardStyle, setCardStyle] = useState(
    settings.card_style || "tinted"
  );

  const [kennelName, setKennelName] =
    useState(settings.kennel_name);

  function selectPalette(id: string) {
    setPalette(id);

    const p =
      PALETTES.find((x) => x.id === id);

    if (!p || id === "custom")
      return;

    setPrimary(p.primary);
    setAccent(p.accent);

    setBg(
      themeMode === "light"
        ? "#FFFFFF"
        : p.bg
    );

    setCard(p.card);
  }

  async function submit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const fd = new FormData();

    fd.set(
      "theme_mode",
      themeMode
    );

    fd.set(
      "preset_palette",
      palette
    );

    fd.set(
      "primary_color",
      primary
    );

    fd.set(
      "accent_color",
      accent
    );

    fd.set(
      "bg_color",
      bg
    );

    fd.set(
      "card_color",
      card
    );

    fd.set(
      "ui_style",
      style
    );

    fd.set(
      "ui_radius",
      radius
    );

    fd.set(
      "ui_animation",
      animation
    );

    fd.set(
      "ui_density",
      density
    );

    fd.set(
      "ui_font",
      font
    );

    fd.set(
      "ui_gradient",
      gradient
    );

    fd.set(
      "glass_intensity",
      glass
    );

    fd.set(
      "card_style",
      cardStyle
    );

    fd.set(
      "kennel_name",
      kennelName
    );

    startTransition(async () => {
      await saveBrandingAction(fd);

      router.refresh();

      location.reload();
    });
  }

  return (
    <form
      onSubmit={submit}
      className="max-w-7xl mx-auto space-y-8"
    >
      <div>

        <h1 className="text-4xl font-black">
          Appearance
        </h1>

        <p className="opacity-60">
          Premium Theme System
        </p>

      </div>

      <div className="grid lg:grid-cols-2 gap-8">

        <section className="space-y-6">

          <div>

            <h3 className="font-bold mb-3">
              Mode
            </h3>

            <select
              value={themeMode}
              onChange={(e)=>
                setThemeMode(
                  e.target.value
                )
              }
              className="w-full p-4 rounded-xl bg-black"
            >
              <option>
                dark
              </option>

              <option>
                light
              </option>

              <option>
                system
              </option>

            </select>

          </div>

          <div>

            <h3 className="font-bold mb-3">
              Palette
            </h3>

            <div className="grid grid-cols-2 gap-3">

              {PALETTES.map(
                (p)=>(
                  <button
                    key={p.id}
                    type="button"
                    onClick={()=>
                      selectPalette(
                        p.id
                      )
                    }
                    className={`rounded-2xl p-5 border ${
                      palette===p.id
                        ? "border-violet-500"
                        : "border-zinc-800"
                    }`}
                  >
                    <div className="flex gap-2">

                      <div
                        className="w-6 h-6 rounded-full"
                        style={{
                          background:
                            p.primary,
                        }}
                      />

                      <div
                        className="w-6 h-6 rounded-full"
                        style={{
                          background:
                            p.accent,
                        }}
                      />

                    </div>

                    <div className="mt-3">

                      {p.name}

                    </div>

                  </button>
                )
              )}

            </div>

          </div>

          {palette==="custom" && (
            <div className="grid grid-cols-2 gap-3">

              <input
                type="color"
                value={primary}
                onChange={(e)=>
                  setPrimary(
                    e.target.value
                  )
                }
              />

              <input
                type="color"
                value={accent}
                onChange={(e)=>
                  setAccent(
                    e.target.value
                  )
                }
              />

              <input
                type="color"
                value={bg}
                onChange={(e)=>
                  setBg(
                    e.target.value
                  )
                }
              />

              <input
                type="color"
                value={card}
                onChange={(e)=>
                  setCard(
                    e.target.value
                  )
                }
              />

            </div>
          )}

          <div>

            <label>

              Font

            </label>

            <select
              value={font}
              onChange={(e)=>
                setFont(
                  e.target.value
                )
              }
              className="w-full p-4 rounded-xl"
            >
              <option>
                inter
              </option>

              <option>
                outfit
              </option>

              <option>
                manrope
              </option>

              <option>
                sf
              </option>

            </select>

          </div>

          <div>

            <label>

              Glass

            </label>

            <select
              value={glass}
              onChange={(e)=>
                setGlass(
                  e.target.value
                )
              }
              className="w-full p-4 rounded-xl"
            >
              <option>
                off
              </option>

              <option>
                soft
              </option>

              <option>
                medium
              </option>

              <option>
                strong
              </option>

            </select>

          </div>

          <button
            disabled={pending}
            className="w-full h-14 rounded-2xl bg-lime-300 text-black font-black"
          >
            {pending
              ? "Saving..."
              : "Save Theme"}
          </button>

        </section>

        <section>

          <div
            className="rounded-[32px] p-8"
            style={{
              background:
                `linear-gradient(135deg,
                ${primary}22,
                ${accent}11)`,

              border:
                "1px solid #ffffff20",
            }}
          >

            <div
              className="rounded-3xl p-6"
              style={{
                background:
                  card,
              }}
            >
              <h2
                style={{
                  color:
                    primary,
                }}
              >
                {kennelName}
              </h2>

              <div className="grid gap-3 mt-5">

                <div
                  className="p-5 rounded-2xl"
                  style={{
                    background:
                      `${primary}18`,
                  }}
                >
                  Dashboard Card 1
                </div>

                <div
                  className="p-5 rounded-2xl"
                  style={{
                    background:
                      `${accent}18`,
                  }}
                >
                  Dashboard Card 2
                </div>

                <div
                  className="p-5 rounded-2xl"
                  style={{
                    background:
                      `${primary}10`,
                  }}
                >
                  Dashboard Card 3
                </div>

              </div>

            </div>

          </div>

        </section>

      </div>

    </form>
  );
}
