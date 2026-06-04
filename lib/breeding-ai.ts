export type ProgTest = {
  test_date: string;
  value: number;
};

export type Heat = {
  start_date: string;
  progesterone_tests?: ProgTest[];
};

export function getPeak(tests: ProgTest[]) {
  return tests.length ? Math.max(...tests.map(t => t.value)) : 0;
}

export function getLast(tests: ProgTest[]) {
  return tests.length ? tests[tests.length - 1].value : 0;
}

// 🔥 optimal breeding window detection
export function getOptimalWindow(tests: ProgTest[]) {
  const last = getLast(tests);

  if (last >= 5 && last <= 8) {
    return {
      status: "OPTIMAL",
      confidence: 0.95,
      message: "Ideális fedeztetési ablak (24-36h)"
    };
  }

  if (last >= 2 && last < 5) {
    return {
      status: "RISING",
      confidence: 0.6,
      message: "Közelgő ovuláció (figyeld 12-24h)"
    };
  }

  if (last > 8) {
    return {
      status: "POST_OVULATION",
      confidence: 0.8,
      message: "Ovuláció után"
    };
  }

  return {
    status: "BASELINE",
    confidence: 0.3,
    message: "Alacsony hormon szint"
  };
}

// 📅 estimated ovulation timing (simple model)
export function estimateOvulationDate(startDate: string) {
  const d = new Date(startDate);
  d.setDate(d.getDate() + 10);
  return d;
}