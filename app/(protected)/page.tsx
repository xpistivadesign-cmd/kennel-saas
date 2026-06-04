import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { count: dogsCount } = await supabase
    .from("dogs")
    .select("*", { count: "exact", head: true });

  const { count: activeHeatsCount } = await supabase
    .from("heats")
    .select("*", { count: "exact", head: true })
    .is("end_date", null);

  const { data: puppies } = await supabase
    .from("puppies")
    .select("sale_price, buyer_id");

  const totalRevenue =
    puppies?.reduce((sum, p) => sum + (Number(p.sale_price) || 0), 0) || 0;

  const activeReservations =
    puppies?.filter((p) => p.buyer_id).length || 0;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8">
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-bold">Kennel Dashboard 🏛️</h1>
        <p className="text-sm text-gray-500">
          Tenyésztési és analitikai központ
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Kutyák" value={dogsCount ?? 0} />
        <Stat label="Aktív tüzelés" value={activeHeatsCount ?? 0} />
        <Stat label="Foglalások" value={activeReservations} />
        <Stat
          label="Bevétel"
          value={new Intl.NumberFormat("hu-HU", {
            style: "currency",
            currency: "HUF",
          }).format(totalRevenue)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <NavCard href="/heats" title="Cikluskövetés" desc="Progeszteron mérések" />
        <NavCard href="/analytics" title="Analitika" desc="Trendek és peak elemzés" />
        <NavCard href="/breeding/planner" title="Tenyésztés" desc="63 napos terv" />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="bg-white border rounded-xl p-4 text-center">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-xl font-mono font-bold">{value}</div>
    </div>
  );
}

function NavCard({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="p-4 border rounded-xl bg-gray-50 hover:bg-white transition"
    >
      <div className="font-bold">{title}</div>
      <div className="text-xs text-gray-500">{desc}</div>
    </Link>
  );
}