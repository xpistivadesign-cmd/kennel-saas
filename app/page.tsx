"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [dogs, setDogs] = useState<any[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    loadDogs();
  }, []);

  async function loadDogs() {
    const { data } = await supabase
      .from("dogs")
      .select(`
        *,
        dog_images (
          image_url
        )
      `);
    setDogs(data || []);
  }

  async function addDog() {
    await supabase.from("dogs").insert({
      name: "New Dog",
      sex: "female"
    });
    loadDogs();
  }

  async function deleteDog(id: any) {
    await supabase.from("dogs").delete().eq("id", id);
    loadDogs();
  }

  async function handleImageUpload(event: any, dogId: any) {
    try {
      setUploading(dogId);
      const file = event.target.files[0];
      if (!file) return;

      const fileName = `${Date.now()}-${file.name}`;

      const { data, error } = await supabase.storage
        .from("dog-images")
        .upload(fileName, file);

      if (error) throw error;

      const url = `https://kktqvuzasdktpytuguef.supabase.co/storage/v1/object/public/dog-images/${fileName}`;

      await supabase.from("dog_images").insert({
        dog_id: dogId,
        image_url: url
      });

      alert("Kép sikeresen feltöltve! 📸");
      loadDogs();
    } catch (error: any) {
      alert("Hiba történt a feltöltés során: " + error.message);
    } finally {
      setUploading(null);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🐶 Kennel SaaS</h1>

      <button onClick={addDog} style={{ padding: "10px 20px", marginBottom: 20, cursor: "pointer" }}>
        + Add Dog
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        {dogs.map((d: any) => {
          const hasImage = d.dog_images && d.dog_images.length > 0;
          const imageUrl = hasImage ? d.dog_images[0].image_url : null;

          return (
            <div key={d.id} style={{ border: "1px solid #ccc", padding: 15, borderRadius: 5, maxWidth: 400 }}>
              <h3>{d.name}</h3>
              <p>Sex: {d.sex}</p>

              {imageUrl && (
                <div style={{ marginTop: 10, marginBottom: 10 }}>
                  <img 
                    src={imageUrl} 
                    alt="Dog" 
                    style={{ width: "100%", maxHeight: "250px", objectFit: "cover", borderRadius: 6 }} 
                  />
                </div>
              )}

              <div style={{ marginTop: 10, marginBottom: 15, background: "#f9f9f9", padding: 10, borderRadius: 4 }}>
                <label style={{ display: "block", marginBottom: 5, fontSize: "0.9rem", fontWeight: "bold" }}>
                  {uploading === d.id ? "Uploading..." : "Dog Image:"}
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  disabled={uploading !== null}
                  onChange={(e) => handleImageUpload(e, d.id)} 
                />
              </div>

              <button onClick={() => deleteDog(d.id)} style={{ background: "#ff4d4d", color: "white", border: "none", padding: "5px 10px", borderRadius: 3, cursor: "pointer" }}>
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
