import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function signOutAction() {
  "use server";

  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/login");
}

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

  return (
    <div className="min-h-screen flex bg-black text-white">
      <aside className="w-64 border-r border-white/10 p-4 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="text-xl font-semibold">Kennel SaaS</div>

          <nav className="space-y-2 text-sm text-white/70">
            <Link href="/protected/dashboard" className="block hover:text-white">
              Dashboard
            </Link>
            <Link href="/protected/dogs" className="block hover:text-white">
              Dogs
            </Link>
            <Link href="/protected/heats" className="block hover:text-white">
              Heats
            </Link>
            <Link href="/protected/litters" className="block hover:text-white">
              Litters
            </Link>
            <Link href="/protected/shows" className="block hover:text-white">
              Shows
            </Link>
            <Link href="/protected/finance" className="block hover:text-white">
              Finance
            </Link>
          </nav>
        </div>

        <form action={signOutAction}>
          <button className="w-full py-2 text-sm border border-white/20 rounded hover:bg-white hover:text-black transition">
            Sign Out
          </button>
        </form>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
