"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DogEditPage({ params }: { params: { id: string } }) {
  const [name, setName] = useState("");
  const [sex, setSex] = useState("female");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const dogId = params.id;

  useEffect(() => {
    loadDog();
  }, []);

  async function loadDog() {
    const { data } = await supabase
      .from("dogs")
      .select("*")
      .eq("id", dogId)
      .single();

    if (data) {
      setName(data.name);
      setSex(data.sex);
    }

    setLoading(false);
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    await supabase
      .from("dogs")
      .update({ name, sex })
      .eq("id", dogId);

    setSaving(false);
    router.push("/");
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Edit Dog</h1>

      <form onSubmit={handleSave}>
        <input value={name} onChange={(e) => setName(e.target.value)} />

        <select value={sex} onChange={(e) => setSex(e.target.value)}>
          <option value="female">female</option>
          <option value="male">male</option>
        </select>

        <button>{saving ? "Saving..." : "Save"}</button>
      </form>
    </div>
  );
}