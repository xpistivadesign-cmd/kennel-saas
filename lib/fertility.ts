export type Unit = "ngml" | "nmol";

/**
 * 1 ng/ml = 3.18 nmol/L
 */
export const CONVERSION_FACTOR = 3.18;

export function convert(value: number, unit: Unit): number {
  return unit === "nmol" ? value * CONVERSION_FACTOR : value;
}

export function format(value: number, unit: Unit): string {
  const v = convert(value, unit);

  return unit === "nmol"
    ? `${v.toFixed(2)} nmol/L`
    : `${v.toFixed(1)} ng/ml`;
}

export function getPeak(values: number[]): number {
  if (!values.length) return 0;
  return Math.max(...values);
}

export function getLast(values: number[]): number {
  if (!values.length) return 0;
  return values[values.length - 1];
}

export function getTrend(values: number[]): "up" | "down" | "flat" | "unknown" {
  if (values.length < 2) return "unknown";

  const last = values[values.length - 1];
  const prev = values[values.length - 2];

  if (last > prev) return "up";
  if (last < prev) return "down";
  return "flat";
}

/**
 * Egyszerű ovulációs becslés:
 * peak után ~1–2 nap
 */
export function getDueDate(dates: string[], values: number[]): string | null {
  if (!dates.length || !values.length) return null;

  const peakIndex = values.indexOf(Math.max(...values));
  if (peakIndex === -1) return null;

  const peakDate = new Date(dates[peakIndex]);
  const due = new Date(peakDate);
  due.setDate(due.getDate() + 2);

  return due.toISOString();
}