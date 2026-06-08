import Link from "next/link";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r p-4 space-y-4">
        <div className="font-bold text-lg">Kennel OS</div>

        <nav className="space-y-2 text-sm">
          <Link href="/protected/dashboard" className="block">Dashboard</Link>
          <Link href="/protected/dogs" className="block">Dogs</Link>
          <Link href="/protected/heats" className="block">Heats</Link>
          <Link href="/protected/litters" className="block">Litters</Link>
          <Link href="/protected/shows" className="block">Shows</Link>
          <Link href="/protected/finance" className="block">Finance</Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
