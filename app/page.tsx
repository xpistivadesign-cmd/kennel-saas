"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [dogs, setDogs] = useState<any[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Sima /login-ra küldjük, mert most már a jó helyen van!
      router.push("/login");
    } else {
      setUser(user);
      await loadDogs();
    }
    setLoading(false);
  }

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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return <div style={{ padding: 20, textAlign: "center" }}><h3>Rendszer betöltése...</h3></div>;
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 1200, margin: "0 auto" }}>
      {/* Felső sáv */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #eee", paddingBottom: 10, marginBottom: 20 }}>
        <h1>🐶 Guerrero de las Montanas Dashboard</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <span style={{ fontSize: "0.9rem", color: "#666" }}>👤 {user?.email}</span>
          <button onClick={handleLogout} style={{ background: "#333", color: "white", border: "none", padding: "8px 15px", borderRadius: 4, cursor: "pointer" }}>
            Kijelentkezés
          </button>
        </div>
      </div>

      {/* Statisztikai kártyák */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 30 }}>
        <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 8, background: "#f8f9fa" }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#555" }}>🐶 Összes kutya</h4>
          <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>{dogs.length}</p>
        </div>
        <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 8, background: "#f8f9fa", opacity: 0.6 }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#555" }}>🐾 Aktív almok</h4>
          <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>0</p>
        </div>
        <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 8, background: "#f8f9fa", opacity: 0.6 }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#555" }}>💰 Bevételek</h4>
          <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>$0</p>
        </div>
      </div>

      {/* Kutyák kezelése rész */}
      <h2>🐕 Kutyák kezelése</h2>
      <button onClick={addDog} style={{ padding: "10px 20px", marginBottom: 20, background: "#0070f3", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: "bold" }}>
        + Add Dog
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {dogs.map((d: any) => {
          const hasImage = d.dog_images && d.dog_images.length > 0;
          const imageUrl = hasImage ? d.dog_images[0].image_url : null;

          return (
            <div key={d.id} style={{ border: "1px solid #ddd", padding: 15, borderRadius: 8, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ margin: "0 0 5px 0" }}>{d.name}</h3>
                <p style={{ margin: "0 0 10px 0", color: "#666" }}>Sex: {d.sex}</p>

                {imageUrl && (
                  <div style={{ marginTop: 10, marginBottom: 10 }}>
                    <img src={imageUrl} alt="Dog" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: 6 }} />
                  </div>
                )}
              </div>

              <div>
                <div style={{ marginTop: 10, marginBottom: 15, background: "#f9f9f9", padding: 10, borderRadius: 4, border: "1px solid #eee" }}>
                  <label style={{ display: "block", marginBottom: 5, fontSize: "0.8rem", fontWeight: "bold" }}>
                    {uploading === d.id ? "Feltöltés..." : "Dog Image:"}
                  </label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    disabled={uploading !== null}
                    onChange={(e) => handleImageUpload(e, d.id)} 
                    style={{ fontSize: "0.8rem", width: "100%" }}
                  />
                </div>

                <button onClick={() => deleteDog(d.id)} style={{ background: "#ff4d4d", color: "white", border: "none", padding: "8px 12px", borderRadius: 4, cursor: "pointer", width: "100%" }}>
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
