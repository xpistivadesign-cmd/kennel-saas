import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function updateDogImage(
  dogId: string,
  userId: string,
  fileName: string
) {
  "use server";

  const supabase = await createClient();

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("dog-photos")
    .getPublicUrl(fileName);

  const { error } = await supabase
    .from("dogs")
    .update({
      image_url: publicUrl,
    })
    .eq("id", dogId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dogs/${dogId}`);
}

export default async function DogProfilePage({
  params,
}: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const authenticatedUserId = user.id;

  const { data: dog } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", id)
    .eq("user_id", authenticatedUserId)
    .maybeSingle();

  if (!dog) {
    return (
      <div className="p-10 text-white">
        <div className="mb-5 text-red-400">
          Dog not found
        </div>

        <Link
          href="/dogs"
          className="text-amber-400 underline"
        >
          Back to Dogs
        </Link>
      </div>
    );
  }

  async function uploadAction(
    formData: FormData
  ) {
    "use server";

    const fileName = String(
      formData.get("fileName") || ""
    );

    if (!fileName) {
      throw new Error("Missing file");
    }

    await updateDogImage(
      id,
      authenticatedUserId,
      fileName
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 text-white">

      <div className="flex items-center justify-between mb-10">

        <div>
          <h1 className="text-4xl font-bold">
            {dog.name}
          </h1>

          <div className="text-zinc-500">
            {dog.breed || "-"}
          </div>
        </div>

        <Link
          href="/dogs"
          className="px-5 py-3 rounded-xl border border-zinc-800 hover:bg-zinc-900"
        >
          Back to Dogs
        </Link>

      </div>

      <div className="grid lg:grid-cols-[420px_1fr] gap-8">

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">

          <div className="aspect-square overflow-hidden rounded-2xl border border-zinc-800 mb-6">

            {dog.image_url ? (
              <Image
                src={dog.image_url}
                alt={dog.name}
                width={1200}
                height={1200}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-600">
                No image
              </div>
            )}

          </div>

          <form
            action={uploadAction}
            className="space-y-4"
          >

            <input
              id="fileName"
              name="fileName"
              type="hidden"
            />

            <input
              id="imageInput"
              type="file"
              accept="image/*"
              className="w-full rounded-xl border border-zinc-800 bg-black p-3"
            />

            <button
              id="uploadBtn"
              type="button"
              className="w-full rounded-xl bg-amber-500 px-5 py-3 text-black font-semibold"
            >
              Upload Image
            </button>

          </form>

          <script
            dangerouslySetInnerHTML={{
              __html: `
(async()=>{

const input=document.getElementById("imageInput");
const button=document.getElementById("uploadBtn");
const hidden=document.getElementById("fileName");

button.onclick=async()=>{

const file=input.files?.[0];

if(!file){
alert("Select image");
return;
}

try{

button.disabled=true;
button.innerText="Uploading...";

const image=new window.Image();

image.src=URL.createObjectURL(file);

await new Promise(r=>image.onload=r);

let width=image.width;
let height=image.height;

if(width>height&&width>1200){
height=Math.round(height*(1200/width));
width=1200;
}

if(height>width&&height>1200){
width=Math.round(width*(1200/height));
height=1200;
}

const canvas=document.createElement("canvas");

canvas.width=width;
canvas.height=height;

canvas
.getContext("2d")
.drawImage(
image,
0,
0,
width,
height
);

const blob=await new Promise(
resolve=>
canvas.toBlob(
resolve,
"image/jpeg",
0.7
)
);

const fileName=
"${authenticatedUserId}/${id}-"+
Date.now()+
".jpg";

const form=new FormData();

form.append(
"file",
blob,
fileName
);

const upload=await fetch(
"/api/upload-dog-image",
{
method:"POST",
body:form
}
);

if(!upload.ok){
throw new Error();
}

hidden.value=fileName;

button.closest("form").requestSubmit();

}catch(e){

alert("Upload failed");

}finally{

button.disabled=false;

button.innerText=
"Upload Image";

}

};

})();
`,
            }}
          />

        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 grid md:grid-cols-2 gap-5">

          <Info label="Microchip" value={dog.microchip_id} />
          <Info label="Passport" value={dog.passport_number} />
          <Info label="Sex" value={dog.sex} />
          <Info label="Status" value={dog.status} />
          <Info label="Color" value={dog.color_markings} />
          <Info label="Public" value={dog.is_public ? "Yes" : "No"} />
          <Info label="For Sale" value={dog.is_for_sale ? "Yes" : "No"} />

        </div>

      </div>

    </div>
  );
}

function Info({
  label,
  value,
}:{
label:string;
value:any;
}){

return(
<div className="rounded-2xl border border-zinc-800 bg-black/30 p-5">

<div className="text-zinc-500 mb-2">
{label}
</div>

<div>
{value||"-"}
</div>

</div>
);

}
