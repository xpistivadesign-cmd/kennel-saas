export function calculateCompatibility(a: any, b: any) {
  let score = 50;

  if (a.breed === b.breed) score += 40;
  if (a.health_score && b.health_score) {
    score += Math.abs(a.health_score - b.health_score) < 10 ? 10 : -10;
  }

  return {
    score,
    level:
      score > 80 ? "EXCELLENT" : score > 60 ? "GOOD" : "RISKY",
  };
}