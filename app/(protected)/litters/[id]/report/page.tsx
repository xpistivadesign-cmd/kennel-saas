import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type PageProps = {
  params: {
    id: string;
  };
};

type Litter = {
  id: string;
  mating_id: string;
  birth_date: string | null;
  male_count: number | null;
  female_count: number | null;
  status: string;
  created_at: string;
};

type Mating = {
  id: string;
  heat_id: string;
  mating_date: string;
  male_name: string | null;
  method: string | null;
};

type Dog = {
  id: string;
  name: string;
  breed: string | null;
  sex: string | null;
  microchip: string | null;
  pedigree_number: string | null;
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

  let sire: Dog | null = null;
  let dam: Dog | null = null;

  if (mating?.stud_dog_id) {
    const { data: sireData } = await supabase
      .from("dogs")
      .select("*")
      .eq("id", mating.stud_dog_id)
      .single();

    sire = sireData;
  }

  if (mating?.heat_id) {
    const { data: heat } = await supabase
      .from("heats")
      .select("*")
      .eq("id", mating.heat_id)
      .single();

    if (heat?.dog_id) {
      const { data: damData } = await supabase
        .from("dogs")
        .select("*")
        .eq("id", heat.dog_id)
        .single();

      dam = damData;
    }
  }

  const fileName = `Litter_Report_${litter.status}_${new Date(
    litter.created_at
  ).toISOString().split("T")[0]}`;

  return (
    <div className="container">
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
          }

          .page {
            box-shadow: none !important;
            margin: 0 !important;
          }
        }

        body {
          font-family: Arial, sans-serif;
          background: #f4f4f4;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }

        .page {
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

        h1 {
          margin: 0;
          font-size: 24px;
        }

        h2 {
          margin-top: 30px;
          font-size: 18px;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        td,
        th {
          border: 1px solid #eee;
          padding: 8px;
          text-align: left;
          font-size: 14px;
        }

        .btn {
          background: black;
          color: white;
          padding: 10px 14px;
          border-radius: 8px;
          cursor: pointer;
          border: none;
        }
      `}</style>

      <div className="page">
        {/* HEADER */}
        <div className="header">
          <div>
            <div className="logo" />
            <h1>Kennel Report</h1>
            <p>
              Litter ID: <strong>{litter.id}</strong>
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

        {/* BASIC INFO */}
        <h2>Litter Information</h2>
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
              <td>Dam (Mother)</td>
              <td>{dam?.name ?? "Unknown"}</td>
            </tr>
            <tr>
              <td>Sire (Father)</td>
              <td>{sire?.name ?? mating?.male_name ?? "Unknown"}</td>
            </tr>
            <tr>
              <td>Mating Date</td>
              <td>
                {mating?.mating_date
                  ? new Date(mating.mating_date).toLocaleDateString()
                  : "-"}
              </td>
            </tr>
            <tr>
              <td>Method</td>
              <td>{mating?.method ?? "-"}</td>
            </tr>
          </tbody>
        </table>

        {/* HEALTH / VACCINATION LOG */}
        <h2>Vaccination & De-worming Log</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Product</th>
              <th>Vet Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>—</td>
              <td>Vaccination</td>
              <td>—</td>
              <td>To be filled</td>
            </tr>
            <tr>
              <td>—</td>
              <td>De-worming</td>
              <td>—</td>
              <td>To be filled</td>
            </tr>
          </tbody>
        </table>

        {/* FOOTER */}
        <p style={{ marginTop: 30, fontSize: 12, color: "#666" }}>
          Generated automatically by Kennel Management System
        </p>
      </div>
    </div>
  );
}
