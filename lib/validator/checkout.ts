import * as z from "zod";

export const checkoutSchema = z.object({
  buyer_name: z.string().min(3, { error: "Nama lengkap wajib diisi (min. 3 karakter)" }),
  buyer_email: z.string().email({ error: "Format email tidak valid" }),
  buyer_phone: z
    .string()
    .trim()
    .regex(/^8[0-9]+$/, { error: "Nomor harus diawali angka 8 dan hanya boleh angka" })
    .min(9, { error: "Nomor HP minimal 9 digit" })
    .max(13, { error: "Nomor HP maksimal 13 digit" }),
  payment_method: z.string().min(1, { error: "Silakan pilih metode pembayaran terlebih dahulu" }),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
