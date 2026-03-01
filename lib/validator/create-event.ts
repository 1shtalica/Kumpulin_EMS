import z from "zod";

// 🌟 Step 1
export const step1Schema = z.object({
  type: z.enum(["external", "internal"], {
    error: "Tipe event wajib dipilih",
  }),
});

// 🌟 Step 2: pada tiptap editor, limitnya dipasang 2000 namun tidak ditunjukkan sebab pmnya ada bug dari sananya yang menyebabkan count characternya kadang kehitung 2 kali
const MAX_FILE_SIZE = 1024 * 1024 * 5;
const ACCEPTED_IMAGE_FORMATS = ["image/jpeg", "image/png"];

export const step2Schema = z.object({
  title: z
    .string()
    .min(1, { error: "Judul event wajib diisi" })
    .max(50, { error: "Judul event maksimal 50 karakter" }),
  category: z.string().min(1, { error: "Kategori event wajib diisi" }),
  description: z
    .string()
    .min(1, { error: "Deskripsi event wajib diisi" })
    .max(2000, { error: "Deskripsi event terlalu panjang" })
    .refine(
      (html) => {
        const tempDiv =
          typeof document !== "undefined"
            ? document.createElement("div")
            : null;

        if (tempDiv) {
          tempDiv.innerHTML = html;
          const textContent = tempDiv.textContent || tempDiv.innerText || "";
          return textContent.trim().length > 0;
        }

        const stripped = html.replace(/<[^>]*>/g, "").trim();
        return stripped.length > 0;
      },
      { error: "Deskripsi event wajib diisi" },
    ),
  bannerImage: z
    .custom<File>((v) => v instanceof File, {
      error: "Banner event wajib diupload",
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      error: "Ukuran banner maksimal 5MB",
    })
    .refine((file) => ACCEPTED_IMAGE_FORMATS.includes(file.type), {
      error: "Format banner harus .jpeg atau .png",
    }),
  bannerImagePreview: z.string().nullable().optional(),
  images: z
    .array(
      z
        .custom<File>((v) => v instanceof File, {
          error: "File tidak valid",
        })
        .refine((file) => file.size <= MAX_FILE_SIZE, {
          error: "Ukuran file maksimal 5MB",
        })
        .refine((file) => ACCEPTED_IMAGE_FORMATS.includes(file.type), {
          error: "Format file harus .jpeg atau .png",
        }),
    )
    .min(1, { error: "Minimal 1 poster wajib diupload" })
    .max(5, { error: "Maksimal 5 poster" }),
  imagePreviews: z.array(z.string()).optional(),
});

// 🌟 Step 3: Jadwal & Lokasi
const rundownSchema = z
  .object({
    title: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    description: z.string().optional(),
    location: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.title || data.title.length === 0) {
      ctx.addIssue({
        code: "custom",
        input: data,
        message: "Judul sesi wajib diisi",
        path: ["title"],
      });
    }

    if (!data.startTime || data.startTime.length === 0) {
      ctx.addIssue({
        code: "custom",
        input: data,
        message: "Jam mulai wajib diisi",
        path: ["startTime"],
      });
    }

    if (!data.endTime || data.endTime.length === 0) {
      ctx.addIssue({
        code: "custom",
        input: data,
        message: "Jam selesai wajib diisi",
        path: ["endTime"],
      });
    }

    // Same-day time validation: end time must be after start time
    if (data.startTime && data.endTime && data.endTime <= data.startTime) {
      ctx.addIssue({
        code: "custom",
        input: data,
        message: "Jam selesai harus setelah jam mulai",
        path: ["endTime"],
      });
    }
  });

export const step3Schema = z
  .object({
    // Combined DateTime fields
    startEventDateTime: z.date({
      error: "Tanggal mulai event wajib diisi",
    }),
    endEventDateTime: z.date({
      error: "Tanggal selesai event wajib diisi",
    }),
    startRegistrationDateTime: z.date({
      error: "Tanggal mulai pendaftaran wajib diisi",
    }),
    endRegistrationDateTime: z.date({
      error: "Tanggal selesai pendaftaran wajib diisi",
    }),

    // Rundown (Minimal 1)
    rundown: z
      .array(rundownSchema)
      .min(1, { error: "Sesi Rundown harus diisi" }),

    // Lokasi (Online vs Offline Logic)
    isOnline: z.boolean(),
    meetingUrl: z.union([z.url({ error: "URL meeting tidak valid" }), z.literal("")]).optional(),
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
        code: "custom",
        input: data,
        message: "Waktu mulai event tidak boleh di masa lalu",
        path: ["startEventDateTime"],
      });
    }

    if (data.startRegistrationDateTime < now) {
      ctx.addIssue({
        code: "custom",
        input: data,
        message: "Waktu buka pendaftaran tidak boleh di masa lalu",
        path: ["startRegistrationDateTime"],
      });
    }

    // Event end must be after start
    if (data.endEventDateTime <= data.startEventDateTime) {
      ctx.addIssue({
        code: "custom",
        input: data,
        message: "Waktu selesai event harus setelah waktu mulai",
        path: ["endEventDateTime"],
      });
    }

    // SAME DAY time validation for event
    const isSameEventDay =
      data.startEventDateTime.toDateString() ===
      data.endEventDateTime.toDateString();

    if (isSameEventDay) {
      const startEventTime = data.startEventDateTime.getTime();
      const endEventTime = data.endEventDateTime.getTime();

      if (endEventTime <= startEventTime) {
        ctx.addIssue({
          code: "custom",
          input: data,
          message: "Waktu selesai event harus setelah waktu mulai",
          path: ["endEventDateTime"],
        });
      }
    }

    // Registration end must be before event start
    if (data.endRegistrationDateTime >= data.startEventDateTime) {
      ctx.addIssue({
        code: "custom",
        input: data,
        message: "Waktu tutup pendaftaran harus sebelum waktu mulai event",
        path: ["endRegistrationDateTime"],
      });
    }

    // Registration end must be after registration start
    if (data.endRegistrationDateTime <= data.startRegistrationDateTime) {
      ctx.addIssue({
        code: "custom",
        input: data,
        message: "Waktu tutup pendaftaran harus setelah waktu buka pendaftaran",
        path: ["endRegistrationDateTime"],
      });
    }

    // SAME DAY time validation for registration
    const isSameRegistrationDay =
      data.startRegistrationDateTime.toDateString() ===
      data.endRegistrationDateTime.toDateString();

    if (isSameRegistrationDay) {
      const startRegisTime = data.startRegistrationDateTime.getTime();
      const endRegisTime = data.endRegistrationDateTime.getTime();

      if (endRegisTime <= startRegisTime) {
        ctx.addIssue({
          code: "custom",
          input: data,
          message:
            "Waktu tutup pendaftaran harus setelah waktu buka pendaftaran",
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

    const daysDiff =
      (startEventDate.getTime() - endRegistrationDate.getTime()) / oneDayInMs;

    if (daysDiff < 1) {
      ctx.addIssue({
        code: "custom",
        input: data,
        message:
          "Event harus dimulai minimal 1 hari setelah pendaftaran ditutup",
        path: ["startEventDateTime"],
      });
    }

    // Location validations
    if (data.isOnline) {
      if (!data.meetingUrl || data.meetingUrl.length < 5) {
        ctx.addIssue({
          code: "custom",
          input: data,
          message: "Link meeting wajib diisi untuk event online",
          path: ["meetingUrl"],
        });
      }
    } else {
      if (!data.address.province) {
        ctx.addIssue({
          code: "custom",
          input: data,
          message: "Provinsi wajib dipilih",
          path: ["address", "province"],
        });
      }
      if (!data.address.city) {
        ctx.addIssue({
          code: "custom",
          input: data,
          message: "Kota wajib dipilih",
          path: ["address", "city"],
        });
      }
      if (!data.address.rawAddress || data.address.rawAddress.length < 5) {
        ctx.addIssue({
          code: "custom",
          input: data,
          message: "Alamat lengkap wajib diisi",
          path: ["address", "rawAddress"],
        });
      }
    }
  });

// 🌟 Step 4: Tiket & Kapasitas
export const ticketSchema = z.object({
  name: z.string().min(1, { error: "Nama tiket wajib diisi" }),
  price: z.coerce.number().min(0, { error: "Harga tiket tidak boleh negatif" }),
  quota: z.coerce.number().min(1, { error: "Kuota tiket minimal 1" }),
  description: z.string().optional(),
  start_date_time: z.date({
      error: "Tanggal buka penjualan tiket wajib diisi",
    }),
    end_date_time: z.date({
      error: "Tanggal tutup penjualan tiket wajib diisi",
    }),
    type: z.enum(["free", "paid"]),
}).superRefine((data, ctx) => {
  if (data.type === "free" && data.price !== 0 ){
    ctx.addIssue({
      code: "custom",
      input: data,
      message: "Harga tiket tidak boleh lebih dari 0 untuk event gratis",
      path: ["price"],
    });
  }

  if (data.type === "paid" && data.price <= 0 ){
    ctx.addIssue({
      code: "custom",
      input: data,
      message: "Harga tiket harus lebih dari 0 untuk event berbayar",
      path: ["price"],
    });
  }

  if (data.end_date_time <= data.start_date_time){
    ctx.addIssue({
      code: "custom",
      input: data,
      message: "Waktu selesai tiket harus setelah waktu mulai tiket",
      path: ["end_date_time"],
    });
  }
});

export const step4Schema = z
  .object({
    maxCapacity: z.coerce
      .number()
      .min(1, { error: "Kapasitas event wajib diisi" })
      .max(1000, { error: "Batas maksimal event adalah 1000 peserta" }),
    tickets: z.array(ticketSchema),
    maxPurchasePerUser: z.coerce
      .number()
      .min(0, { error: "Batas pembelian tidak boleh negatif" })
  })
  .superRefine((data, ctx) => {
    if (data.tickets.length === 0) {
      ctx.addIssue({
        code: "custom",
        input: data,
        message: "Minimal 1 tiket wajib ditambahkan",
        path: ["tickets"],
      });
    }

    const totalQuota = data.tickets.reduce(
      (sum, ticket) => sum + ticket.quota,
      0
    );

    if (totalQuota > data.maxCapacity) {
      ctx.addIssue({
        code: "custom",
        input: data,
        message: `Total kuota tiket (${totalQuota}) tidak boleh melebihi kapasitas event (${data.maxCapacity})`,
        path: ["tickets"],
      });
    }
  });
