export type DogSex = "Male" | "Female";

export interface Dog {
  id: string;
  user_id: string;
  name: string;
  breed: string | null;
  sex: DogSex;
  color: string | null;
  birth_date: string | null;
  microchip_number: string | null;
  passport_number: string | null;
  registration_number: string | null;
  image_url: string | null;
  sire_id: string | null;
  dam_id: string | null;
}

export interface Heat {
  id: string;
  dog_id: string;
  start_date: string;
  progesterone: number;
  notes: string | null;
}

export interface Mating {
  id: string;
  female_id: string;
  male_name: string;
  date: string;
  notes: string | null;
}

export interface Litter {
  id: string;
  dam_id: string;
  birth_date: string;
  live_puppies: number;
  dead_puppies: number;
  status: "Active" | "Archived";
}

export interface MedicalRecord {
  id: string;
  dog_id: string;
  date: string;
  type: string;
  notes: string | null;
}

export interface DogShow {
  id: string;
  dog_id: string;
  show_name: string;
  date: string;
  location: string | null;
  placement: string | null;
}
