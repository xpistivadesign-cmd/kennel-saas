import "server-only";
import { createClient } from "./server";

export interface Dog {
  id?: string;
  name: string;
  breed: string;
  gender: "male" | "female";
  reg_number?: string;
  birth_date?: string;
}
