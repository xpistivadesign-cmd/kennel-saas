"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";

// 🚀 Recharts ONLY client-side load (build-safe!)
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const LineChart = dynamic(
  () => import("recharts").then((m) => m.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import("recharts").then((m) => m.Line),
  { ssr: false }
);
const XAxis = dynamic(
  () => import("recharts").then((m) => m.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import("recharts").then((m) => m.YAxis),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("recharts").then((m) => m.Tooltip),
  { ssr: false }
);

type Props = {
  tests: {
    id: string;
    test_date: string;
    value: number;
  }[];
};

export default function HeatsChart({ tests }: Props) {
  // 📊 safe format + sort
  const data = useMemo(() => {
    return [...tests]
      .sort(
        (a, b) =>
          new Date(a.test_date).getTime() -
          new Date(b.test_date).getTime()
      )
      .map((t) => ({
        date: new Date(t.test_date).toLocaleDateString("hu-HU"),
        value: t.value,
      }));
  }, [tests]);

  if (!data.length) {
    return (
      <div className="text-sm text-gray-400 italic">
        Nincs progeszteron mérési adat a grafikonhoz.
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#ec4899"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}