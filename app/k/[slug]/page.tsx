"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function KennelSlugPage({ params }: { params: { slug: string } }) {
  const [kennel, setKennel] = useState<any>(null);
  const [dogs, setDogs] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    load();
  }, [params.slug]);

  async function load() {
    const { data: kennelData } = await supabase
      .from("kennels")
      .select("*")
      .eq("slug", params.slug)
      .maybeSingle();

    if (!kennelData) return;

    setKennel(kennelData);

    const { data: dogsData } = await supabase
      .from("dogs")
      .select("*")
      .eq("kennel_id", kennelData.id);

    setDogs(dogsData || []);
  }

  if (!kennel) {
    return (
      <div style={{ padding: 20 }}>
        <h2>❌ Kennel nem található</h2>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      
      <div style={{ background: kennel.primary_color, color: "white", padding: 30 }}>
        {kennel.logo_url && (
          <img src={kennel.logo_url} style={{ width: 80, borderRadius: "50%" }} />
        )}
        <h1>{kennel.name}</h1>
        <p>{kennel.description}</p>
      </div>

      <div style={{ padding: 20 }}>
        <h2>🐕 Kutyák</h2>

        {dogs.map((dog) => (
          <div key={dog.id} style={{ marginBottom: 10 }}>
            <b>{dog.name}</b>{" "}
            {dog.status === "active" ? "🟢" : "⚫"}
          </div>
        ))}
      </div>

    </div>
  );
}
