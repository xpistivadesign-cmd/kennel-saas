import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DogProfileClient from "./dog-profile-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DogProfilePage({ params }: PageProps) {
  const { id } = await params;

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: dog, error } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !dog) {
    return (
      <div className="p-10 text-red-400">
        Dog not found
      </div>
    );
  }

  const { data: allDogs } = await supabase
    .from("dogs")
    .select("id, name, sex")
    .eq("user_id", user.id);

  return (
    <DogProfileClient
      dog={dog}
      userId={user.id}
      allDogs={allDogs || []}
    />
  );
}
