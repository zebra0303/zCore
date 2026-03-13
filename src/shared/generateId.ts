import { uuidv7 } from "uuidv7";

/** Generate a time-sortable UUID v7 identifier. */
export function generateId(): string {
  return uuidv7();
}
