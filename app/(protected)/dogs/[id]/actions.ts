"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

async function getSession() {
const supabase =
createServerSupabase();

const {
data: { user },
} =
await supabase.auth.getUser();

if (!user) {
throw new Error(
"Unauthorized"
);
}

return {
supabase,
user,
};
}

export async function addHeatAction(
formData: FormData
): Promise<void> {
const {
supabase,
user,
} =
await getSession();

const dogId =
String(
formData.get(
"dogId"
) ?? ""
);

const startDate =
String(
formData.get(
"startDate"
) ?? ""
);

const progesterone =
Number(
formData.get(
"progesterone"
) ?? 0
);

const notes =
String(
formData.get(
"notes"
) ?? ""
);

if (
!dogId ||
!startDate
) {
throw new Error(
"Missing fields"
);
}

const {
error,
} =
await supabase
.from(
"heats"
)
.insert({
user_id:
user.id,
dog_id:
dogId,
start_date:
startDate,
progesterone,
notes,
});

if (error) {
throw error;
}

revalidatePath(
`/dogs/${dogId}`
);
}

export async function addMatingAction(
formData: FormData
): Promise<void> {
const {
supabase,
user,
} =
await getSession();

const femaleId =
String(
formData.get(
"femaleId"
) ?? ""
);

const maleName =
String(
formData.get(
"maleName"
) ?? ""
);

const matingDate =
String(
formData.get(
"matingDate"
) ?? ""
);

const notes =
String(
formData.get(
"notes"
) ?? ""
);

if (
!femaleId ||
!matingDate
) {
throw new Error(
"Missing fields"
);
}

const {
error,
} =
await supabase
.from(
"matings"
)
.insert({
user_id:
user.id,
female_id:
femaleId,
male_name:
maleName,
date:
matingDate,
notes,
});

if (error) {
throw error;
}

revalidatePath(
`/dogs/${femaleId}`
);
}

export async function addWhelpingAction(
formData: FormData
): Promise<void> {
const {
supabase,
user,
} =
await getSession();

const damId =
String(
formData.get(
"damId"
) ?? ""
);

const birthDate =
String(
formData.get(
"birthDate"
) ?? ""
);

const litterName =
String(
formData.get(
"litterName"
) ?? ""
);

const livePuppies =
Number(
formData.get(
"livePuppies"
) ?? 0
);

const deadPuppies =
Number(
formData.get(
"deadPuppies"
) ?? 0
);

if (
!damId ||
!birthDate
) {
throw new Error(
"Missing fields"
);
}

const {
error,
} =
await supabase
.from(
"litters"
)
.insert({
user_id:
user.id,
dam_id:
damId,
name:
litterName,
birth_date:
birthDate,
live_puppies:
livePuppies,
dead_puppies:
deadPuppies,
status:
"Active",
});

if (error) {
throw error;
}

revalidatePath(
"/litters"
);

revalidatePath(
`/dogs/${damId}`
);
}
