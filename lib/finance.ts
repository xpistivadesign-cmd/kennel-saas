export type Puppy = {
  price: number;
  reserved: boolean;
};

export function calculateRevenue(puppies: Puppy[]) {
  const total = puppies.reduce((sum, p) => sum + p.price, 0);
  const reserved = puppies
    .filter(p => p.reserved)
    .reduce((sum, p) => sum + p.price, 0);

  return {
    total,
    reserved,
    expected: total - reserved,
  };
}