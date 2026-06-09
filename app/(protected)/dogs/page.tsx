"use client";

import { createClient } from "@/lib/supabase/server";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";

export default function DogsPage() {
  const router = useRouter();
  const [dogs, setDogs] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = await createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("dogs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setDogs(data || []);
    };

    load();
  }, []);

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-2xl font-bold">Dogs</h1>

      <div className="space-y-3">
        {dogs.map((dog) => (
          <div
            key={dog.id}
            onClick={() => router.push(`/dogs/${dog.id}`)}
            className="cursor-pointer block rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 hover:border-zinc-700 hover:bg-zinc-800/40 transition"
          >
            <div className="font-semibold text-white">{dog.name}</div>
            <div className="text-sm text-zinc-400">
              {dog.breed} • {dog.sex}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
