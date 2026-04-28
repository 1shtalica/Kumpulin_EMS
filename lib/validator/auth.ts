import z from "zod";

const email_schema = z
  .email({ error: "Format email tidak valid" })
  .trim()
  .toLowerCase()
  .min(1, { error: "Email wajib diisi" })
  .max(254, { error: "Email maksimal 254 karakter" });

const password_schema = z
  .string()
  .min(8, { error: "Password minimal 8 karakter" })
  .max(72, { error: "Password maksimal 72 karakter" })
  .regex(/[A-Z]/, { error: "Password harus mengandung huruf besar" })
  .regex(/[a-z]/, { error: "Password harus mengandung huruf kecil" })
  .regex(/[0-9]/, { error: "Password harus mengandung angka" });

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, { error: "Username minimal 3 karakter" })
      .max(30, { error: "Username maksimal 30 karakter" })
      .regex(/^[a-zA-Z0-9]+$/, {
        error: "Username hanya boleh huruf, angka, dan tanpa spasi",
      }),
    email: email_schema,
    password: password_schema,
    confirm_password: z
      .string()
      .min(1, { error: "Konfirmasi password wajib diisi" })
      .max(72, { error: "Konfirmasi password maksimal 72 karakter" }),
    agree_to_terms: z.boolean().refine((val) => val === true, {
      error: "Anda harus menyetujui syarat dan ketentuan",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirm_password) {
      ctx.addIssue({
        path: ["confirm_password"],
        message: "Password tidak cocok",
        code: "custom",
        input: data.confirm_password,
      });
    }
  });

export const loginSchema = z.object({
  email: email_schema,
  password: z
    .string()
    .min(1, { error: "Password wajib diisi" })
    .max(72, { error: "Password maksimal 72 karakter" }),
});

export const resetPasswordSchema = z
  .object({
    password: password_schema,
    confirm_password: z
      .string()
      .min(1, { error: "Konfirmasi password wajib diisi" })
      .max(72, { error: "Konfirmasi password maksimal 72 karakter" }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirm_password) {
      ctx.addIssue({
        path: ["confirm_password"],
        message: "Password tidak cocok",
        code: "custom",
        input: data.confirm_password,
      });
    }
  });

export const forgotPasswordSchema = z.object({
  email: email_schema,
});

export const phoneSchema = z.object({
  phone_number: z
    .string()
    .trim()
    .regex(/^8[0-9]+$/, { error: "Nomor harus diawali angka 8 dan hanya boleh angka" })
    .min(9, { error: "Nomor HP minimal 9 digit" })
    .max(13, { error: "Nomor HP maksimal 13 digit" }),
});

export const organizerSchema = z.object({
  organizer_name: z
    .string()
    .trim()
    .min(3, { error: "Nama organizer minimal 3 karakter" })
    .max(50, { error: "Nama organizer maksimal 50 karakter" }),
});
