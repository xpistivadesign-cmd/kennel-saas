"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Dog = {
  id: string;
  image_url?: string | null;
  name?: string;
  breed?: string;
  microchip_id?: string;
  passport_number?: string;
  color_markings?: string;
  notes?: string;
  status?: string;
  sire_id?: string | null;
  dam_id?: string | null;
  is_public?: boolean;
  is_for_sale?: boolean;
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

  const uploadRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8">
        <div className="flex flex-col gap-6 lg:flex-row">

          <div className="w-[320px]">

            {dog.image_url ? (
              <img
                src={dog.image_url}
                alt={dog.name}
                className="h-[320px] w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-[320px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-500">
                No image
              </div>
            )}

            <form
              ref={uploadRef}
              className="mt-4 space-y-3"
              action={(fd) =>
                startUpload(async () => {
                  await uploadAction(fd);
                  router.refresh();
                  alert("Image uploaded");
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
                type="submit"
                disabled={uploading}
                className="w-full rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black"
              >
                {uploading
                  ? "Uploading..."
                  : "Upload Image"}
              </button>
            </form>
          </div>

          <div className="flex-1">

            <div className="mb-5 flex justify-between">

              <div>
                <h2 className="text-3xl font-bold">
                  {dog.name}
                </h2>

                <p className="text-zinc-400">
                  {dog.breed}
                </p>
              </div>

              <button
                onClick={() =>
                  setEditing(!editing)
                }
                className="rounded-xl border border-zinc-700 px-4 py-2"
              >
                {editing
                  ? "Cancel"
                  : "Edit Profile"}
              </button>

            </div>

            <form
              action={saveAction}
              className="space-y-5"
            >

              <input
                name="name"
                defaultValue={dog.name}
                disabled={!editing}
                className="w-full rounded-xl bg-zinc-900 p-3"
              />

              <input
                name="microchip_id"
                defaultValue={dog.microchip_id || ""}
                disabled={!editing}
                className="w-full rounded-xl bg-zinc-900 p-3"
              />

              <input
                name="passport_number"
                defaultValue={
                  dog.passport_number || ""
                }
                disabled={!editing}
                className="w-full rounded-xl bg-zinc-900 p-3"
              />

              <textarea
                name="color_markings"
                defaultValue={
                  dog.color_markings || ""
                }
                disabled={!editing}
                className="w-full rounded-xl bg-zinc-900 p-3"
              />

              <select
                name="sire_id"
                disabled={!editing}
                defaultValue={
                  dog.sire_id || ""
                }
                className="w-full rounded-xl bg-zinc-900 p-3"
              >
                <option value="">
                  No sire
                </option>

                {dogs
                  .filter(
                    (d) =>
                      d.sex === "Male"
                  )
                  .map((d) => (
                    <option
                      key={d.id}
                      value={d.id}
                    >
                      {d.name}
                    </option>
                  ))}
              </select>

              <select
                name="dam_id"
                disabled={!editing}
                defaultValue={
                  dog.dam_id || ""
                }
                className="w-full rounded-xl bg-zinc-900 p-3"
              >
                <option value="">
                  No dam
                </option>

                {dogs
                  .filter(
                    (d) =>
                      d.sex === "Female"
                  )
                  .map((d) => (
                    <option
                      key={d.id}
                      value={d.id}
                    >
                      {d.name}
                    </option>
                  ))}
              </select>

              {editing && (
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 px-5 py-3 text-black font-semibold"
                >
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
