import { add } from "date-fns";

export function createCodeExpirationDate(hours: number = 24): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}
