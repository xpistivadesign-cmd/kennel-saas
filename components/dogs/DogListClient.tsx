"use client";

import Link from "next/link";

export default function DogListClient({ dogs }: any) {
  return (
    <div className="p-4 space-y-2">
      <h1 className="text-lg font-bold">Kutyák</h1>

      <div className="grid gap-2">
        {dogs.map((dog: any) => (
          <Link
            key={dog.id}
            href={`/dogs/${dog.id}`}
            className="p-3 border rounded hover:bg-gray-50"
          >
            <div className="font-medium">{dog.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
