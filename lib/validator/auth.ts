import z from "zod";

export const registerSchema = z
  .object({
    userName: z
      .string()
      .min(3, { message: "Username minimal 3 karakter" })
      .max(30, { message: "Username maksimal 30 karakter" })
      .regex(/^[a-zA-Z0-9]+$/, {
        message: "Username hanya boleh huruf, angka, dan tanpa spasi",
      }),
    email: z
      .string()
      .min(1, { message: "Email wajib diisi" })
      .email({ message: "Format email tidak valid" }),
    password: z
      .string()
      .min(8, { message: "Password minimal 8 karakter" })
      .regex(/[A-Z]/, { message: "Password harus mengandung huruf besar" })
      .regex(/[a-z]/, { message: "Password harus mengandung huruf kecil" })
      .regex(/[0-9]/, { message: "Password harus mengandung angka" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Konfirmasi password wajib diisi" }),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "Anda harus menyetujui syarat dan ketentuan",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        message: "Password tidak cocok",
        code: z.ZodIssueCode.custom,
      });
    }
  });

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email Wajib diisi" })
    .email({ message: "Format email tidak valid" }),
  password: z.string().min(8, { message: "Password minimal 8 karakter" }),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password minimal 8 karakter" })
      .regex(/[A-Z]/, { message: "Password harus mengandung huruf besar" })
      .regex(/[a-z]/, { message: "Password harus mengandung huruf kecil" })
      .regex(/[0-9]/, { message: "Password harus mengandung angka" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password tidak cocok",
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email wajib diisi" })
    .email({ message: "Format email tidak valid" }),
});

export const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^8/, {
      message: "Nomor harus diawali angka 8",
    })
    .min(9, { message: "Nomor HP minimal 9 digit" })
    .max(13, { message: "Nomor HP maksimal 13 digit" })
    .regex(/^[0-9]+$/, {
      message: "Hanya boleh angka",
    }),
});

export const organizerSchema = z.object({
  organizerName: z
    .string()
    .min(3, { message: "Nama organizer minimal 3 karakter" })
    .max(30, { message: "Nama organizer maksimal 30 karakter" }),
});

