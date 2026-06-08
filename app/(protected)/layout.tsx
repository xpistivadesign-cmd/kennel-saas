import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  async function signOut() {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();

    redirect("/login");
  }

  return (
    <div className="min-h-screen flex bg-black text-white">
      <aside className="w-64 border-r border-white/10 p-4 flex flex-col justify-between">
        <div>
          <div className="text-xl font-bold mb-6">Kennel SaaS</div>

          <nav className="space-y-3 text-sm text-white/70">
            <Link href="/protected/dashboard">Dashboard</Link>
            <Link href="/protected/dogs">Dogs</Link>
            <Link href="/protected/litters">Litters</Link>
            <Link href="/protected/finance">Finance</Link>
            <Link href="/protected/shows">Shows</Link>
          </nav>
        </div>

        <form action={signOut}>
          <button className="w-full py-2 border border-white/20 rounded hover:bg-white hover:text-black transition">
            Sign Out
          </button>
        </form>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
