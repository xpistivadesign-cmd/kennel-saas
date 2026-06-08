"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ProgesteroneChart({
  data,
}: {
  data: { test_date: string; value: number }[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="test_date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
