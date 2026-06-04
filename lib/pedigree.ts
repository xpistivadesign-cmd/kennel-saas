type Dog = {
  id: string;
  name: string;
  parents?: Dog[];
};

type LineageNode = {
  id: string;
  name: string;
  depth: number;
  parents?: LineageNode[] | null;
};

export function buildLineageTree(
  dog: Dog | null,
  depth: number = 0
): LineageNode | null {
  if (!dog || depth > 3) return null;

  return {
    id: dog.id,
    name: dog.name,
    depth,
    parents: dog.parents
      ? dog.parents
          .map((parent) => buildLineageTree(parent, depth + 1))
          .filter(Boolean) as LineageNode[]
      : null,
  };
}
