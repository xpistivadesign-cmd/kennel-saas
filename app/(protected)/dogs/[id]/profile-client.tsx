"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

type Dog = {
  id: string;
  name?: string;
  breed?: string;
  image_url?: string | null;
  microchip_id?: string;
  passport_number?: string;
  color_markings?: string;
  sire_id?: string | null;
  dam_id?: string | null;
};

export default function DogProfileClient({
  dog,
  dogs,
  uploadAction,
  saveAction,
}: {
  dog: Dog;
  dogs: any[];
  uploadAction: (fd: FormData) => Promise<void>;
  saveAction: (fd: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [uploading, startUpload] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="max-w-5xl mx-auto p-8 text-white space-y-8">

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8">
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">

          <div>

            {dog.image_url ? (
              <img
                src={dog.image_url}
                className="w-full h-[320px] object-cover rounded-2xl border border-zinc-800"
                alt={dog.name || "dog"}
              />
            ) : (
              <div className="w-full h-[320px] flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-500">
                No image
              </div>
            )}

            <form
              className="mt-4 space-y-3"
              action={(fd) =>
                startUpload(async () => {
                  await uploadAction(fd);
                  router.refresh();
                  alert("Image uploaded successfully!");
                })
              }
            >
              <input
                type="file"
                name="image"
                accept="image/*"
                className="w-full rounded-xl border border-zinc-800 p-3"
              />

              <button
                disabled={uploading}
                className="w-full rounded-xl bg-amber-500 px-4 py-3 text-black font-semibold"
              >
                {uploading ? "Uploading..." : "Upload Image"}
              </button>
            </form>

          </div>

          <div className="space-y-4">

            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">{dog.name}</h1>
                <p className="text-zinc-400">{dog.breed}</p>
              </div>

              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 rounded-xl border border-zinc-700"
              >
                {editing ? "Cancel" : "Edit"}
              </button>
            </div>

            <form action={saveAction} className="space-y-3">

              <input
                name="name"
                defaultValue={dog.name}
                disabled={!editing}
                className="w-full p-3 rounded-xl bg-zinc-900"
              />

              <input
                name="microchip_id"
                defaultValue={dog.microchip_id || ""}
                disabled={!editing}
                className="w-full p-3 rounded-xl bg-zinc-900"
              />

              <input
                name="passport_number"
                defaultValue={dog.passport_number || ""}
                disabled={!editing}
                className="w-full p-3 rounded-xl bg-zinc-900"
              />

              <textarea
                name="color_markings"
                defaultValue={dog.color_markings || ""}
                disabled={!editing}
                className="w-full p-3 rounded-xl bg-zinc-900"
              />

              <select
                name="sire_id"
                defaultValue={dog.sire_id || ""}
                disabled={!editing}
                className="w-full p-3 rounded-xl bg-zinc-900"
              >
                <option value="">No sire</option>
                {dogs
                  .filter((d) => d.sex === "Male")
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
              </select>

              <select
                name="dam_id"
                defaultValue={dog.dam_id || ""}
                disabled={!editing}
                className="w-full p-3 rounded-xl bg-zinc-900"
              >
                <option value="">No dam</option>
                {dogs
                  .filter((d) => d.sex === "Female")
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
              </select>

              {editing && (
                <button className="bg-emerald-500 text-black px-5 py-3 rounded-xl font-semibold">
                  Save Changes
                </button>
              )}

            </form>

          </div>

        </div>
      </div>
    </div>
  );
}
