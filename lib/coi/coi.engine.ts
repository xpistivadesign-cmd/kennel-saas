export function wrightCOI(input: {
  sireId: string;
  damId: string;
}): number {
  const base =
    input.sireId.charCodeAt(0) +
    input.damId.charCodeAt(0);

  return (base % 100) / 100;
}
