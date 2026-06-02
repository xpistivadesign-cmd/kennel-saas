export default function DogEditPage({ params }: { params: { id: string } }) {
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>🐕 Kutya szerkesztése (ID: {params.id})</h1>
      <p>Ez az oldal fogja kezelni a kutya adatainak módosítását.</p>
    </div>
  );
}
