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

  const { data: dog } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!dog) {
    return (
      <div className="p-10 text-white">
        <div className="mb-4">Dog not found</div>

        <Link
          href="/dogs"
          className="text-amber-400"
        >
          Back to Dogs
        </Link>
      </div>
    );
  }

  async function uploadAction(formData: FormData) {
    "use server";

    const fileName = String(formData.get("fileName") || "");

    if (!fileName) {
      throw new Error("Missing filename");
    }

    await updateDogImage(
      id,
      user.id,
      fileName
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 text-white">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold">
            {dog.name}
          </h1>

          <p className="text-zinc-500">
            {dog.breed || "Unknown breed"}
          </p>
        </div>

        <Link
          href="/dogs"
          className="rounded-xl border border-zinc-800 px-5 py-3 hover:bg-zinc-900"
        >
          Back to Dogs
        </Link>
      </div>

      <div className="grid lg:grid-cols-[360px_1fr] gap-8">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="aspect-square overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 mb-5">
            {dog.image_url ? (
              <Image
                src={dog.image_url}
                alt={dog.name}
                width={900}
                height={900}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-600">
                No image
              </div>
            )}
          </div>

          <form
            action={uploadAction}
            className="space-y-4"
          >
            <input
              name="fileName"
              id="fileName"
              type="hidden"
            />

            <input
              id="imageInput"
              type="file"
              accept="image/*"
              className="w-full rounded-xl border border-zinc-800 bg-black p-3"
            />

            <button
              type="button"
              id="uploadBtn"
              className="w-full rounded-xl bg-amber-500 px-4 py-3 font-semibold text-black"
            >
              Upload Image
            </button>
          </form>

          <script
            dangerouslySetInnerHTML={{
              __html: `
(async()=>{

const input=document.getElementById('imageInput');
const btn=document.getElementById('uploadBtn');
const hidden=document.getElementById('fileName');

btn.onclick=async()=>{

const file=input.files?.[0];

if(!file){
alert('Select image');
return;
}

try{

btn.innerText='Uploading...';
btn.disabled=true;

const img=new Image();

img.src=URL.createObjectURL(file);

await new Promise(r=>img.onload=r);

const canvas=document.createElement('canvas');

let w=img.width;
let h=img.height;

if(w>h&&w>1200){
h*=1200/w;
w=1200;
}

if(h>w&&h>1200){
w*=1200/h;
h=1200;
}

canvas.width=w;
canvas.height=h;

canvas.getContext('2d').drawImage(img,0,0,w,h);

const blob=await new Promise(
r=>canvas.toBlob(
r,
'image/jpeg',
0.7
)
);

const name='${user.id}/${id}-'+Date.now()+'.jpg';

const fd=new FormData();

fd.append('file',blob,name);

const res=await fetch(
'/api/upload-dog-image',
{
method:'POST',
body:fd
}
);

if(!res.ok){
throw new Error();
}

hidden.value=name;

btn.closest('form').requestSubmit();

}catch(e){

alert('Upload failed');

}finally{

btn.disabled=false;
btn.innerText='Upload Image';

}

};

})();
`,
            }}
          />
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 space-y-6">
          <div>
            <div className="text-zinc-500 mb-1">
              Microchip
            </div>

            <div>
              {dog.microchip_id || "-"}
            </div>
          </div>

          <div>
            <div className="text-zinc-500 mb-1">
              Passport
            </div>

            <div>
              {dog.passport_number || "-"}
            </div>
          </div>

          <div>
            <div className="text-zinc-500 mb-1">
              Color markings
            </div>

            <div>
              {dog.color_markings || "-"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
