export async function addHeatCycleAction(formData: FormData) {
  const dog_id = formData.get("dog_id") as string;
  const start_date = formData.get("start_date") as string;

  const supabase = await createClient();

  await supabase.from("heat_cycles").insert({
    dog_id,
    start_date,
  });
}

export async function addMatingAction(formData: FormData) {
  const female_id = formData.get("female_id") as string;
  const male_id = formData.get("male_id") as string;

  const supabase = await createClient();

  await supabase.from("matings").insert({
    female_id,
    male_id,
  });
}

export async function addProgesteroneTestAction(formData: FormData) {
  const dog_id = formData.get("dog_id") as string;
  const value = formData.get("value") as string;

  const supabase = await createClient();

  await supabase.from("progesterone_tests").insert({
    dog_id,
    value: Number(value),
  });
}

export async function addLitterAction(formData: FormData) {
  const female_id = formData.get("female_id") as string;
  const birth_date = formData.get("birth_date") as string;

  const supabase = await createClient();

  await supabase.from("litters").insert({
    female_id,
    birth_date,
  });
}
