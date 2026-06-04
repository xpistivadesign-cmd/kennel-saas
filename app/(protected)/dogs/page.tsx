import DogClient from "./ui/DogClient";
import { getDogs } from "@/lib/supabase/dogs";

export default async function DogsPage() {
  const dogs = await getDogs();

  return <DogClient initialDogs={dogs} />;
}
