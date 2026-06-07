export const dynamic = "force-dynamic";

import LittersClient from "./LittersClient";
import { getLitters } from "@/app/actions/litters";

export default async function LittersPage() {
  const litters = await getLitters();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Litter Management</h1>
      <LittersClient litters={litters} />
    </div>
  );
}
