import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import AddDogForm from "./AddDogForm";

export const dynamic = "force-dynamic";

export default async function DogsPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Összes kutya lekérése a listához és a szülő-választáshoz
  const { data: dogs } = await supabase
    .from("dogs")
    .select("*")
    .order("created_at", { ascending: false });

  const potentialSires = dogs?.filter((d: any) => d.sex === "Male") || [];
  const potentialDams = dogs?.filter((d: any) => d.sex === "Female") || [];

  return (
    <div className="min-h-screen bg-black text-white p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* BAL OLDAL: KUTYÁK LISTÁJA */}
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-2xl font-black uppercase text-amber-400 tracking-wider">Dogs Directory</h1>
        <div className="grid grid-cols-1 gap-3">
          {dogs && dogs.length > 0 ? (
            dogs.map((dog: any) => (
              <Link 
                key={dog.id} 
                href={`/dogs/${dog.id}`}
                className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-xl block hover:border-amber-500/40 transition group"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-white group-hover:text-amber-400 transition">{dog.name}</h2>
                    <p className="text-xs text-zinc-500 mt-1">
                      {dog.breed || "Presa Canario"} • <span className={dog.sex === "Male" ? "text-blue-400" : "text-pink-400"}>{dog.sex}</span>
                    </p>
                  </div>
                  <span className="text-zinc-600 text-xs font-mono group-hover:text-zinc-400 transition">View Core Profile →</span>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-zinc-600 italic text-xs">No dogs registered in your database yet.</p>
          )}
        </div>
      </div>

      {/* JOBB OLDAL: JAVÍTOTT, INTELIGENS ADD NEW DOG KÁRTYA */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl h-fit space-y-4">
        <h2 className="text-base font-black uppercase tracking-wider text-zinc-300">Add New Dog</h2>
        <AddDogForm potentialSires={potentialSires} potentialDams={potentialDams} />
      </div>

    </div>
  );
}
