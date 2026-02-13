import z from "zod";

// Re-export individual steps for partial validation if needed
export { step1Schema, step2Schema, step3Schema, step4Schema } from "./create-event";

import { step1Schema, step2Schema, step3Schema, step4Schema } from "./create-event";

// Combine all steps into one schema
// Combine all steps into one schema using intersection to preserve refinements
export const createEventSchema = step1Schema
  .and(step2Schema)
  .and(step3Schema)
  .and(step4Schema);

export type CreateEventSchema = z.infer<typeof createEventSchema>;
