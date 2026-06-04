// 🧬 TypeScript Stub a PedigreeTree komponensnek

export interface Dog {
  id?: string;
  name: string;
  reg_number?: string;
  birth_date?: string;
  breed?: string;
  gender?: "male" | "female";
  sire_id?: string;
  dam_id?: string;
}

export interface PedigreeNode extends Dog {
  sire?: PedigreeNode | null;
  dam?: PedigreeNode | null;
  parent1?: PedigreeNode | null;
  parent2?: PedigreeNode | null;
  generation?: number;
}
