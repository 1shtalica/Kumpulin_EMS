import z from "zod";

// 🌟 Step 1
export const step1Schema = z.object({
  type: z.enum(["external", "internal"], {
    message: "Tipe event wajib dipilih",
  }),
});

// 🌟 Step 2: pada tiptap editor, limitnya dipasang 2000 namun tidak ditunjukkan sebab pmnya ada bug dari sananya yang menyebabkan count characternya kadang kehitung 2 kali
const MAX_FILE_SIZE = 1024 * 1024 * 5;
const ACCEPTED_IMAGE_FORMATS = ["image/jpeg", "image/png"];

export const step2Schema = z.object({
  title: z
    .string()
    .min(1, "Judul event wajib diisi")
    .max(50, "Judul event maksimal 50 karakter"),
  category: z.string().min(1, "Kategori event wajib diisi"),
  description: z
    .string()
    .min(1, "Deskripsi event wajib diisi")
    .max(2000, "Deskripsi event terlalu panjang")
    .refine(
      (html) => {
        const tempDiv = typeof document !== 'undefined'
          ? document.createElement('div')
          : null;

        if (tempDiv) {
          tempDiv.innerHTML = html;
          const textContent = tempDiv.textContent || tempDiv.innerText || '';
          return textContent.trim().length > 0;
        }

        const stripped = html.replace(/<[^>]*>/g, '').trim();
        return stripped.length > 0;
      },
      { message: "Deskripsi event wajib diisi" }
    ),
  bannerImage: z
    .custom<File>((v) => v instanceof File, {
      message: "Banner event wajib diupload",
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "Ukuran banner maksimal 5MB",
    })
    .refine((file) => ACCEPTED_IMAGE_FORMATS.includes(file.type), {
      message: "Format banner harus .jpeg atau .png",
    }),
  bannerImagePreview: z.string().nullable().optional(),
  images: z
    .array(
      z
        .custom<File>((v) => v instanceof File, {
          message: "File tidak valid",
        })
        .refine((file) => file.size <= MAX_FILE_SIZE, {
          message: "Ukuran file maksimal 5MB",
        })
        .refine((file) => ACCEPTED_IMAGE_FORMATS.includes(file.type), {
          message: "Format file harus .jpeg atau .png",
        })
    )
    .min(1, "Minimal 1 poster wajib diupload")
    .max(5, "Maksimal 5 poster"),
  imagePreviews: z.array(z.string()).optional(),
});

// 🌟 Step 3: Jadwal & Lokasi
const rundownSchema = z
  .object({
    title: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    description: z.string().optional(),
    location: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.title || data.title.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Judul sesi wajib diisi",
        path: ["title"],
      });
    }

    if (!data.start_time || data.start_time.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Jam mulai wajib diisi",
        path: ["start_time"],
      });
    }

    if (!data.end_time || data.end_time.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Jam selesai wajib diisi",
        path: ["end_time"],
      });
    }

    // Same-day time validation: end time must be after start time
    if (data.start_time && data.end_time && data.end_time <= data.start_time) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Jam selesai harus setelah jam mulai",
        path: ["end_time"],
      });
    }
  });

export const step3Schema = z
  .object({
    // Combined DateTime fields
    startEventDateTime: z.date({
      message: "Tanggal mulai event wajib diisi",
    }),
    endEventDateTime: z.date({
      message: "Tanggal selesai event wajib diisi",
    }),
    startRegistrationDateTime: z.date({
      message: "Tanggal mulai pendaftaran wajib diisi",
    }),
    endRegistrationDateTime: z.date({
      message: "Tanggal selesai pendaftaran wajib diisi",
    }),

    // Rundown (Minimal 1)
    rundown: z.array(rundownSchema).min(1, "Sesi Rundown harus diisi"),

    // Lokasi (Online vs Offline Logic)
    isOnline: z.boolean(),
    meetingUrl: z
      .string()
      .url("URL meeting tidak valid")
      .optional()
      .or(z.literal("")),
    address: z.object({
      title: z.string(),
      province: z.string(),
      city: z.string(),
      rawAddress: z.string(),
      postalCode: z.string().optional(),
    }),
  })
  .superRefine((data, ctx) => {
    // Prevent past dates
    const now = new Date();

    if (data.startEventDateTime < now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Waktu mulai event tidak boleh di masa lalu",
        path: ["startEventDateTime"],
      });
    }

    if (data.startRegistrationDateTime < now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Waktu buka pendaftaran tidak boleh di masa lalu",
        path: ["startRegistrationDateTime"],
      });
    }

    // Event end must be after start
    if (data.endEventDateTime <= data.startEventDateTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Waktu selesai event harus setelah waktu mulai",
        path: ["endEventDateTime"],
      });
    }

    // SAME DAY time validation for event
    const isSameEventDay =
      data.startEventDateTime.toDateString() === data.endEventDateTime.toDateString();

    if (isSameEventDay) {
      const startEventTime = data.startEventDateTime.getTime();
      const endEventTime = data.endEventDateTime.getTime();

      if (endEventTime <= startEventTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Waktu selesai event harus setelah waktu mulai",
          path: ["endEventDateTime"],
        });
      }
    }

    // Registration end must be before event start
    if (data.endRegistrationDateTime >= data.startEventDateTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Waktu tutup pendaftaran harus sebelum waktu mulai event",
        path: ["endRegistrationDateTime"],
      });
    }

    // Registration end must be after registration start
    if (data.endRegistrationDateTime <= data.startRegistrationDateTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Waktu tutup pendaftaran harus setelah waktu buka pendaftaran",
        path: ["endRegistrationDateTime"],
      });
    }

    // SAME DAY time validation for registration
    const isSameRegistrationDay =
      data.startRegistrationDateTime.toDateString() === data.endRegistrationDateTime.toDateString();

    if (isSameRegistrationDay) {
      const startRegisTime = data.startRegistrationDateTime.getTime();
      const endRegisTime = data.endRegistrationDateTime.getTime();

      if (endRegisTime <= startRegisTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Waktu tutup pendaftaran harus setelah waktu buka pendaftaran",
          path: ["endRegistrationDateTime"],
        });
      }
    }

    // Minimum 1-day gap: End Registration to Start Event
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const endRegistrationDate = new Date(data.endRegistrationDateTime);
    endRegistrationDate.setHours(0, 0, 0, 0);

    const startEventDate = new Date(data.startEventDateTime);
    startEventDate.setHours(0, 0, 0, 0);

    const daysDiff = (startEventDate.getTime() - endRegistrationDate.getTime()) / oneDayInMs;

    if (daysDiff < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Event harus dimulai minimal 1 hari setelah pendaftaran ditutup",
        path: ["startEventDateTime"],
      });
    }

    // Location validations
    if (data.isOnline) {
      if (!data.meetingUrl || data.meetingUrl.length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Link meeting wajib diisi untuk event online",
          path: ["meetingUrl"],
        });
      }
    } else {
      if (!data.address.province) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Provinsi wajib dipilih",
          path: ["address", "province"],
        });
      }
      if (!data.address.city) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Kota wajib dipilih",
          path: ["address", "city"],
        });
      }
      if (!data.address.rawAddress || data.address.rawAddress.length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Alamat lengkap wajib diisi",
          path: ["address", "rawAddress"],
        });
      }
    }
  });

// 🌟 Step 4: Tiket & Kapasitas
const ticketSchema = z.object({
  name: z.string().min(1, "Nama tiket wajib diisi"),
  price: z.coerce.number().min(1, "Harga tiket harus lebih dari 0"),
  quota: z.coerce.number().min(1, "Kuota tiket minimal 1"),
  description: z.string().optional(),
});

export const step4Schema = z
  .object({
    isPaid: z.boolean(),
    maxCapacity: z.coerce.number().min(0, "Kapasitas tidak boleh negatif"),
    tickets: z.array(ticketSchema),
    maxPurchasePerUser: z.coerce
      .number()
      .min(0, "Batas pembelian tidak boleh negatif")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isPaid) {
      if (data.tickets.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Event berbayar wajib memiliki minimal 1 tiket",
          path: ["tickets"],
        });
      }

      // Validate maxPurchasePerUser for paid events - must be defined but can be 0
      if (
        data.maxPurchasePerUser === undefined ||
        data.maxPurchasePerUser === null
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Batas pembelian per user wajib diisi untuk event berbayar",
          path: ["maxPurchasePerUser"],
        });
      }
    }
  });
