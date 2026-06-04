"use client";

type Dog = {
  id: string;
  name: string;
};

type DogClientProps = {
  initialDogs: Dog[];
};

export default function DogClient({ initialDogs }: DogClientProps) {
  return (
    <div>
      <h2>Kutyák listája</h2>

      {initialDogs.map((dog) => (
        <div key={dog.id}>
          {dog.name}
        </div>
      ))}
    </div>
  );
}
