import { error } from "console";
import z from "zod";

// 🌟 Step 1
export const step1Schema = z.object({
  type: z.enum(["external", "internal"], {
    error: "Tipe event wajib dipilih",
  }),
});

// 🌟 Step 2: pada tiptap editor, limitnya dipasang 2000 namun tidak ditunjukkan sebab pmnya ada bug dari sananya yang menyebabkan count characternya kadang kehitung 2 kali dan html tagnya juga kehitung
const max_file_size = 1024 * 1024 * 5;
const accepted_image_formats = ["image/jpeg", "image/png"];

export const step2Schema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: "Judul event wajib diisi" })
    .max(50, { error: "Judul event maksimal 50 karakter" }),
  category: z
    .string()
    .min(1, { error: "Kategori event wajib diisi" })
    .max(30, { error: "Kategori event maksimal 30 karakter" }),
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
  banner_image: z
    .custom<File>((v) => v instanceof File, {
      error: "Banner event wajib diupload",
    })
    .refine((file) => file.size <= max_file_size, {
      error: "Ukuran banner maksimal 5MB",
    })
    .refine((file) => accepted_image_formats.includes(file.type), {
      error: "Format banner harus .jpeg atau .png",
    }),
  banner_image_preview: z.string().nullable().optional(),
  images: z
    .array(
      z
        .custom<File>((v) => v instanceof File, {
          error: "File tidak valid",
        })
        .refine((file) => file.size <= max_file_size, {
          error: "Ukuran file maksimal 5MB",
        })
        .refine((file) => accepted_image_formats.includes(file.type), {
          error: "Format file harus .jpeg atau .png",
        }),
    )
    .min(1, { error: "Minimal 1 poster wajib diupload" })
    .max(5, { error: "Maksimal 5 poster" }),
  image_previews: z.array(z.string()).optional(),
  status: z.enum(["draft", "published", "registration closed", "ongoing", "finished", "archived", "cancelled"]).optional(),
});

// 🌟 Step 3: Jadwal & Lokasi
const rundownSchema = z
  .object({
    _dbId: z.string().optional(),
    title: z
      .string()
      .trim()
      .min(1, { error: "Judul sesi wajib diisi" })
      .max(50, { error: "Judul sesi maksimal 50 karakter" }),
    start_time: z.string(),
    end_time: z.string(),
    description: z
      .string()
      .max(100, { error: "Deskripsi sesi terlalu panjang" })
      .optional(),
    location: z
      .string()
      .max(100, { error: "Lokasi sesi terlalu panjang" })
      .optional(),
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

    if (!data.start_time || data.start_time.length === 0) {
      ctx.addIssue({
        code: "custom",
        input: data,
        message: "Jam mulai wajib diisi",
        path: ["start_time"],
      });
    }

    if (!data.end_time || data.end_time.length === 0) {
      ctx.addIssue({
        code: "custom",
        input: data,
        message: "Jam selesai wajib diisi",
        path: ["end_time"],
      });
    }

    // Same-day time validation: end_time must be after start_time
    if (data.start_time && data.end_time && data.end_time <= data.start_time) {
      ctx.addIssue({
        code: "custom",
        input: data,
        message: "Jam selesai harus setelah jam mulai",
        path: ["end_time"],
      });
    }
  });

export const step3Schema = z
  .object({
    // Combined DateTime fields
    event_start_date: z.date({
      error: "Tanggal mulai event wajib diisi",
    }),
    event_end_date: z.date({
      error: "Tanggal selesai event wajib diisi",
    }),
    start_registration_date: z.date({
      error: "Tanggal mulai pendaftaran wajib diisi",
    }),
    end_registration_date: z.date({
      error: "Tanggal selesai pendaftaran wajib diisi",
    }),

    // Rundown (Minimal 1)
    rundowns: z
      .array(rundownSchema)
      .min(1, { error: "Sesi Rundown harus diisi" })
      .max(20, { error: "Maksimal 20 sesi" }),

    // Lokasi (Online vs Offline Logic)
    is_online: z.boolean(),
    meeting_url: z
      .union([z.url({ error: "URL meeting tidak valid" }), z.literal("")])
      .optional(),
    hide_meeting_url: z.boolean().default(false),
    address: z.object({
      address_id: z.string().optional(),
      title: z
        .string()
        .max(50, { error: "Judul lokasi maksimal 50 karakter" })
        .optional(),
      province: z.string().optional(),
      city: z.string().optional(),
      raw_address: z
        .string()
        .max(200, { error: "Alamat lengkap maksimal 200 karakter" }).optional(),
      postal_code: z
        .string()
        .regex(/^[0-9]{5}$/, { error: "Kode pos harus 5 digit angka" })
        .optional().or(z.literal("")),
      location_url: z
        .union([z.url({ error: "URL lokasi peta tidak valid" }), z.literal("")])
        .optional(),
    }),
  })
  .superRefine((data, ctx) => {
    // Prevent past dates
    const now = new Date();

    if (data.event_start_date < now) {
      ctx.addIssue({
        code: "custom",
        input: data,
        message: "Waktu mulai event tidak boleh di masa lalu",
        path: ["event_start_date"],
      });
    }

    if (data.start_registration_date < now) {
      ctx.addIssue({
        code: "custom",
        input: data,
        message: "Waktu buka pendaftaran tidak boleh di masa lalu",
        path: ["start_registration_date"],
      });
    }

    // Event end must be after start
    if (data.event_end_date <= data.event_start_date) {
      ctx.addIssue({
        code: "custom",
        input: data,
        message: "Waktu selesai event harus setelah waktu mulai",
        path: ["event_end_date"],
      });
    }

    // Registration end must be before event start
    if (data.end_registration_date >= data.event_start_date) {
      ctx.addIssue({
        code: "custom",
        input: data,
        message: "Waktu tutup pendaftaran harus sebelum waktu mulai event",
        path: ["end_registration_date"],
      });
    }

    // Registration end must be after registration start
    if (data.end_registration_date <= data.start_registration_date) {
      ctx.addIssue({
        code: "custom",
        input: data,
        message: "Waktu tutup pendaftaran harus setelah waktu buka pendaftaran",
        path: ["end_registration_date"],
      });
    }

    // Minimum 1-day gap: End Registration to Start Event
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const endRegistrationDate = new Date(data.end_registration_date);
    endRegistrationDate.setHours(0, 0, 0, 0);

    const startEventDate = new Date(data.event_start_date);
    startEventDate.setHours(0, 0, 0, 0);

    const daysDiff =
      (startEventDate.getTime() - endRegistrationDate.getTime()) / oneDayInMs;

    if (daysDiff < 1) {
      ctx.addIssue({
        code: "custom",
        input: data,
        message:
          "Event harus dimulai minimal 1 hari setelah pendaftaran ditutup",
        path: ["event_start_date"],
      });
    }

    // Location validations
    if (data.is_online) {
      if (!data.meeting_url || data.meeting_url.trim().length === 0) {
        ctx.addIssue({
          code: "custom",
          input: data,
          message: "Link meeting wajib diisi untuk event online",
          path: ["meeting_url"],
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
      if (!data.address.raw_address) {
        ctx.addIssue({
          code: "custom",
          input: data,
          message: "Alamat lengkap wajib diisi",
          path: ["address", "raw_address"],
        });
      }
      if (!data.address.location_url || data.address.location_url.trim().length === 0) {
        ctx.addIssue({
          code: "custom",
          input: data,
          message: "Link Google Maps wajib diisi",
          path: ["address", "location_url"],
        });
      }
    }
  });

// 🌟 Step 4: Tiket & Kapasitas
export const step4Schema = z
  .object({
    max_capacity: z.coerce
      .number()
      .min(1, { error: "Kapasitas event wajib diisi" })
      .max(1000, { error: "Batas maksimal event adalah 1000 peserta" }),
    max_ticket_per_user: z.coerce
      .number()
      .min(0, { error: "Batas pembelian tidak boleh negatif" })
      .max(5, { error: "Batas pembelian maksimal adalah 5 tiket" }),
    tickets: z.array(
      z
        .object({
          name: z
            .string()
            .min(1, { error: "Nama tiket wajib diisi" })
            .max(50, { error: "Nama tiket maksimal 50 karakter" }),
          price: z.coerce
            .number()
            .min(0, { error: "Harga tiket tidak boleh negatif" }),
          quota: z.coerce.number().min(1, { error: "Kuota tiket minimal 1" }),
          description: z.string().max(200, { error: "Deskripsi maksimal 200 karakter" }).optional(),
          start_date_time: z.date({
            error: "Tanggal buka penjualan tiket wajib diisi",
          }),
          end_date_time: z.date({
            error: "Tanggal tutup penjualan tiket wajib diisi",
          }),
          type: z.enum(["free", "paid"]),
          _dbId: z.string().optional(),
        })
        .superRefine((data, ctx) => {
          if (data.type === "free" && data.price !== 0) {
            ctx.addIssue({
              code: "custom",
              input: data,
              message: "Harga tiket tidak boleh lebih dari 0 untuk event gratis",
              path: ["price"],
            });
          }

          if (data.type === "paid" && data.price <= 0) {
            ctx.addIssue({
              code: "custom",
              input: data,
              message: "Harga tiket harus lebih dari 0 untuk event berbayar",
              path: ["price"],
            });
          }

          if (data.end_date_time <= data.start_date_time) {
            ctx.addIssue({
              code: "custom",
              input: data,
              message: "Waktu selesai tiket harus setelah waktu mulai tiket",
              path: ["end_date_time"],
            });
          }
        })
    ).min(1, { error: "Minimal 1 tiket wajib ditambahkan" }),
  })
  .superRefine((data, ctx) => {
    // 1. Array Level Check: Total quota of all tickets vs Max Capacity
    const totalQuota = data.tickets.reduce(
      (sum, ticket) => sum + ticket.quota,
      0,
    );

    if (totalQuota > data.max_capacity) {
      ctx.addIssue({
        code: "custom",
        input: data,
        message: `Total kuota tiket (${totalQuota}) tidak boleh melebihi kapasitas event (${data.max_capacity})`,
        path: ["tickets"],
      });
    }

    // 2. Individual Level Check: A single ticket's quota vs Max Capacity
    data.tickets.forEach((ticket, index) => {
      if (ticket.quota > data.max_capacity) {
        ctx.addIssue({
          code: "custom",
          input: data,
          message: `Kuota tiket tunggal (${ticket.quota}) tidak boleh melebihi total kapasitas event (${data.max_capacity})`,
          path: ["tickets", index, "quota"],
        });
      }
    });
  });
