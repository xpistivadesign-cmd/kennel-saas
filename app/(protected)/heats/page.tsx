import { createClient } from "@/utils/supabase/server";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default async function HeatsPage() {
  const supabase = await createClient();

  const { data: tests } = await supabase
    .from("progesterone_tests")
    .select("id, test_date, value")
    .order("test_date", { ascending: true });

  if (!tests) {
    return <div className="p-6 text-red-500">Nincs adat.</div>;
  }

  const chartData = tests.map(t => ({
    date: new Date(t.test_date).toLocaleDateString("hu-HU"),
    value: t.value,
  }));

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      <h1 className="text-2xl font-bold">🧬 Progeszteron görbe</h1>

      <div className="h-96 bg-white border rounded p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#000" />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}