export type Test = {
  test_date: string;
  value: number;
};

export function getPeak(tests: Test[]) {
  if (!tests.length) return 0;
  return Math.max(...tests.map(t => t.value));
}

export function getLast(tests: Test[]) {
  if (!tests.length) return 0;
  return tests[tests.length - 1].value;
}

// 📈 trend logic (stable, no AI bullshit)
export function getTrend(tests: Test[]) {
  if (tests.length < 2) {
    return { label: "INSUFFICIENT" };
  }

  const sorted = [...tests].sort(
    (a, b) =>
      new Date(a.test_date).getTime() -
      new Date(b.test_date).getTime()
  );

  const last = sorted.at(-1)!;
  const prev = sorted.at(-2)!;

  const diff = last.value - prev.value;

  if (diff > 2) return { label: "SPIKE" };
  if (diff > 0) return { label: "RISING" };
  if (diff < 0) return { label: "FALLING" };

  return { label: "STABLE" };
}

// 🐣 ellés kalkuláció
export function getDueDate(startDate: string) {
  const d = new Date(startDate);
  d.setDate(d.getDate() + 63);
  return d;
}