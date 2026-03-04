import z from "zod";
import { step1Schema, step2Schema, step3Schema, step4Schema } from "./create-event";
export { step1Schema, step2Schema, step3Schema, step4Schema };

const combinedSchema = z.intersection(
  z.intersection(step1Schema, step2Schema),
  z.intersection(step3Schema, step4Schema)
);

export const createEventSchema = combinedSchema.superRefine((data, ctx) => {
  const { start_registration_date, end_registration_date, tickets } = data;

  tickets.forEach((ticket, index) => {
    if (ticket.start_date_time < start_registration_date) {
      ctx.addIssue({
        code: "custom",
        input: data,
        message: `Tanggal buka tiket tidak boleh sebelum pendaftaran acara dibuka (${start_registration_date.toLocaleDateString("id-ID")})`,
        path: ["tickets", index, "start_date_time"],
      });
    }

    if (ticket.end_date_time > end_registration_date) {
      ctx.addIssue({
        code: "custom",
        input: data,
        message: `Tanggal tutup tiket tidak boleh setelah pendaftaran acara ditutup (${end_registration_date.toLocaleDateString("id-ID")})`,
        path: ["tickets", index, "end_date_time"],
      });
    }
  });
});

export type CreateEventSchema = z.infer<typeof createEventSchema>;