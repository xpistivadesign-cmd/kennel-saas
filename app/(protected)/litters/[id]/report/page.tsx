import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type PageProps = {
  params: { id: string };
};

export default async function LitterReportPage({ params }: PageProps) {
  const supabase = await createClient();

  const { data: litter } = await supabase
    .from("litters")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!litter) return notFound();

  const { data: mating } = await supabase
    .from("matings")
    .select("*")
    .eq("id", litter.mating_id)
    .single();

  const { data: heat } = mating?.heat_id
    ? await supabase.from("heats").select("*").eq("id", mating.heat_id).single()
    : { data: null };

  const { data: dam } = heat?.dog_id
    ? await supabase.from("dogs").select("*").eq("id", heat.dog_id).single()
    : { data: null };

  const fileName = `Litter_Report_${litter.status}_${new Date(
    litter.created_at
  ).toISOString().split("T")[0]}`;

  return (
    <div>
      {/* GLOBAL PRINT CSS (NO styled-jsx, NO imports) */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .page { box-shadow: none !important; margin: 0 !important; }
        }

        body {
          font-family: Arial, sans-serif;
          background: #f4f4f4;
        }

        .page {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          padding: 30px;
          border-radius: 12px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #eee;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }

        .logo {
          width: 60px;
          height: 60px;
          background: #ddd;
          border-radius: 8px;
        }

        h1 { margin: 0; font-size: 24px; }
        h2 {
          margin-top: 25px;
          font-size: 18px;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        td, th {
          border: 1px solid #eee;
          padding: 8px;
          font-size: 14px;
          text-align: left;
        }

        .btn {
          background: black;
          color: white;
          padding: 10px 14px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
        }
      `}</style>

      <div className="page">
        {/* HEADER */}
        <div className="header">
          <div>
            <div className="logo" />
            <h1>Kennel Litter Report</h1>
            <p>
              Litter ID: <b>{litter.id}</b>
            </p>
          </div>

          <button
            className="btn no-print"
            onClick={() => {
              document.title = fileName;
              window.print();
            }}
          >
            Print / Save as PDF
          </button>
        </div>

        {/* LITTER INFO */}
        <h2>Litter Details</h2>
        <table>
          <tbody>
            <tr>
              <td>Status</td>
              <td>{litter.status}</td>
            </tr>
            <tr>
              <td>Birth Date</td>
              <td>{litter.birth_date ?? "Not born yet"}</td>
            </tr>
            <tr>
              <td>Male Puppies</td>
              <td>{litter.male_count ?? 0}</td>
            </tr>
            <tr>
              <td>Female Puppies</td>
              <td>{litter.female_count ?? 0}</td>
            </tr>
          </tbody>
        </table>

        {/* PARENTS */}
        <h2>Parents</h2>
        <table>
          <tbody>
            <tr>
              <td>Dam</td>
              <td>{dam?.name ?? "Unknown"}</td>
            </tr>
            <tr>
              <td>Sire</td>
              <td>{mating?.male_name ?? "Unknown"}</td>
            </tr>
            <tr>
              <td>Mating Date</td>
              <td>
                {mating?.mating_date
                  ? new Date(mating.mating_date).toLocaleDateString()
                  : "-"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* HEALTH LOG */}
        <h2>Health Record (Template)</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>—</td>
              <td>Vaccination</td>
              <td>Pending</td>
            </tr>
            <tr>
              <td>—</td>
              <td>De-worming</td>
              <td>Pending</td>
            </tr>
          </tbody>
        </table>

        {/* FOOTER */}
        <p style={{ marginTop: 30, fontSize: 12, color: "#666" }}>
          Generated automatically by Kennel SaaS
        </p>
      </div>
    </div>
  );
}
