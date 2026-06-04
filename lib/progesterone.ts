export type Unit = "ngml" | "nmoll";

export const CONVERSION = 3.18;

export function toUnit(value: number, unit: Unit) {
  return unit === "nmoll" ? value * CONVERSION : value;
}

export function format(value: number, unit: Unit) {
  const v = toUnit(value, unit);

  return unit === "nmoll"
    ? `${v.toFixed(2)} nmol/L`
    : `${v.toFixed(1)} ng/ml`;
}

// 🧬 klinikai zónák NG/ML alapján
export function getZone(value: number) {
  if (value >= 5 && value <= 8) return "OPTIMAL";
  if (value >= 2 && value < 5) return "RISING";
  if (value > 8) return "POST_OVULATION";
  return "BASELINE";
}