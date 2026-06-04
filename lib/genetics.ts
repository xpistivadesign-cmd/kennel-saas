export function calculateGeneticScore(dog: {
  health_tests?: number;
  lineage_quality?: number;
  show_score?: number;
}) {
  const health = dog.health_tests || 0;
  const lineage = dog.lineage_quality || 0;
  const show = dog.show_score || 0;

  const score = (health * 0.4 + lineage * 0.4 + show * 0.2);

  return {
    score: Math.round(score),
    label:
      score > 80
        ? "Elite bloodline"
        : score > 60
        ? "High quality"
        : score > 40
        ? "Average"
        : "Basic",
  };
}