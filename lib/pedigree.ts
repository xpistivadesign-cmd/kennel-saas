export function buildLineageTree(dog: any, depth = 0) {
  if (!dog || depth > 3) return null;

  return {
    id: dog.id,
    name: dog.name,
    children: [
      buildLineageTree(dog.father, depth + 1),
      buildLineageTree(dog.mother, depth + 1),
    ].filter(Boolean),
  };
}