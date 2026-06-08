import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dogs", label: "Dogs" },
    { href: "/heats", label: "Heats" },
    { href: "/litters", label: "Litters" },
    { href: "/shows", label: "Shows" },
    { href: "/finance", label: "Finance" },
  ];

  async function signOut() {
    "use server";
    const supabase = createServerSupabase();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between p-6">
        <div>
          <div className="text-xl font-semibold mb-8 tracking-wide">
            Kennel SaaS
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-sm text-zinc-300 hover:text-white transition border border-zinc-800"
          >
            Sign Out
          </button>
        </form>
      </aside>

      <main className="flex-1 p-8 bg-black">{children}</main>
    </div>
  );
}
