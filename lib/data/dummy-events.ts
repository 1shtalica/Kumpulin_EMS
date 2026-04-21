import { Event } from "@/types/event";

// --- 1. EVENT OFFLINE BERBAYAR (PAID) ---
const DUMMY_EVENT_OFFLINE_PAID: Event = {
  event_id: "evt-offline-paid",
  title: "Tech Conference Indonesia 2026 (Offline Paid)",
  slug: "tech-conference-indonesia-2026",
  description: JSON.stringify({ content:
    "<p>Bergabunglah dengan konferensi teknologi terbesar di Indonesia tahun ini! Diskusikan masa depan AI, Cloud Computing, dan Web Development bersama para ahli.</p><br><p><strong>Highlight Acara:</strong></p><ul><li>Keynote dari CEO Tech Giant</li><li>Workshop Coding Hands-on</li><li>Networking Session dengan 500+ Developer</li></ul>"
  }),
  event_start_date: new Date("2026-10-15T09:00:00Z").toISOString(),
  event_end_date: new Date("2026-10-16T17:00:00Z").toISOString(),
  start_registration_date: new Date("2026-08-01T00:00:00Z").toISOString(),
  end_registration_date: new Date("2026-10-14T23:59:59Z").toISOString(),
  is_online: false,
  category: "Technology",
  type: "public",
  status: "published",
  max_capacity: 320,
  max_ticket_per_user: 5,
  total_sold: 155,
  address: {
    province: "DKI Jakarta",
    city: "Jakarta Pusat",
    raw_address: "Grand Ballroom Hotel Indonesia Kempinski, Jl. M.H. Thamrin No.1",
    postal_code: "10310",
  },
  images: [
    { id: 1, image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2070", is_primary: true },
    { id: 2, image_url: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&q=80&w=2070", is_primary: false },
    { id: 3, image_url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=2000", is_primary: false }
  ],
  // organizer: { ... } // 🌟 belum ada di response BE
  ticket_categories: [
    {
      id: "ticket-1",
      name: "Early Bird",
      price: 150000,
      quota: 100,
      booked: 100, // Sold out
      description: "Akses penuh selama 2 hari dengan harga spesial.",
    },
    {
      id: "ticket-2",
      name: "Regular Pass",
      price: 300000,
      quota: 200,
      booked: 50,
      description: "Akses penuh selama 2 hari + sertifikat digital.",
    },
    {
      id: "ticket-3",
      name: "VIP Access",
      price: 750000,
      quota: 20,
      booked: 5,
      description: "Front row seat + Lunch + Exclusive Merchandise.",
    },
  ],
  rundowns: [
    {
      id: "rundown-1",
      title: "Registrasi Ulang",
      description: "Peserta melakukan penukaran tiket dengan ID Card.",
      start_time: "08:00",
      end_time: "09:00",
      location: "Lobby Ballroom",
    },
    {
      id: "rundown-2",
      title: "Opening Keynote: The Future of Code",
      description: "Pembicara: Budi Santoso (CTO Startup Unicorn)",
      start_time: "09:00",
      end_time: "10:30",
      location: "Main Stage",
    },
    {
      id: "rundown-3",
      title: "Break & Networking",
      start_time: "10:30",
      end_time: "11:00",
      location: "Foyer Area",
    },
    {
      id: "rundown-4",
      title: "Workshop: Building Scalable Apps with Next.js",
      description: "Sesi praktik langsung membuat aplikasi web modern.",
      start_time: "11:00",
      end_time: "13:00",
      location: "Meeting Room A",
    },
  ],
};

// --- 2. EVENT ONLINE BERBAYAR (ONLINE PAID) ---
const DUMMY_EVENT_ONLINE_PAID: Event = {
  event_id: "evt-online-paid",
  title: "Masterclass Cyber Security (Online)",
  slug: "masterclass-cyber-security",
  description: JSON.stringify({ content:
    "<p>Pelajari teknik ethical hacking dan cyber security dari praktisi berpengalaman secara online.</p>"
  }),
  event_start_date: new Date("2026-12-05T19:00:00Z").toISOString(),
  event_end_date: new Date("2026-12-05T21:00:00Z").toISOString(),
  start_registration_date: new Date("2026-11-01T00:00:00Z").toISOString(),
  end_registration_date: new Date("2026-12-04T23:59:59Z").toISOString(),
  is_online: true,
  category: "Technology",
  type: "public",
  status: "published",
  max_capacity: 200,
  max_ticket_per_user: 1,
  total_sold: 45,
  address: {
    raw_address: "",
    city: "",
    province: "",
    postal_code: "",
  },
  images: [
    { id: 1, image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070", is_primary: true },
    { id: 2, image_url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1470", is_primary: false },
    { id: 3, image_url: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=2070", is_primary: false }
  ],
  ticket_categories: [
    {
      id: "ticket-10",
      name: "Webinar Pass",
      price: 50000,
      quota: 200,
      booked: 45,
      description: "Link Zoom + E-Certificate + Modul PDF.",
    },
  ],
  rundowns: [
    {
      id: "rundown-1",
      start_time: "19:00",
      end_time: "19:15",
      title: "Opening",
      location: "Zoom Meeting",
      description: "Perkenalan instruktur dan materi.",
    },
    {
      id: "rundown-2",
      start_time: "19:15",
      end_time: "20:30",
      title: "Main Session: Introduction to Ethical Hacking",
      location: "Zoom Meeting",
      description: "Pembahasan konsep dasar dan demo live hacking.",
    },
    {
      id: "rundown-3",
      start_time: "20:30",
      end_time: "21:00",
      title: "Q&A Session",
      location: "Zoom Meeting",
      description: "Tanya jawab langsung dengan instruktur.",
    },
  ],
};

// --- 3. EVENT OFFLINE GRATIS TERBATAS (FREE LIMITED) ---
const DUMMY_EVENT_OFFLINE_FREE_LIMITED: Event = {
  event_id: "evt-offline-free-limited",
  title: "Community Meetup: Open Source (Offline Free Limited)",
  slug: "community-meetup-open-source",
  description: JSON.stringify({ content:
    "<p>Ajang kumpul komunitas Open Source Indonesia. Sharing session santai mengenai kontribusi di proyek open source.</p>"
  }),
  event_start_date: new Date("2026-11-20T18:00:00Z").toISOString(),
  event_end_date: new Date("2026-11-20T21:00:00Z").toISOString(),
  start_registration_date: new Date("2026-11-01T00:00:00Z").toISOString(),
  end_registration_date: new Date("2026-11-19T23:59:59Z").toISOString(),
  is_online: false,
  category: "Community",
  type: "public",
  status: "published",
  max_capacity: 50,
  max_ticket_per_user: 2,
  total_sold: 42,
  address: {
    province: "DI Yogyakarta",
    city: "Yogyakarta",
    raw_address: "Coworking Space Jogja, Jl. Kaliurang KM 5",
    postal_code: "55281",
  },
  images: [
    { id: 1, image_url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop", is_primary: true },
    { id: 2, image_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070", is_primary: false }
  ],
  ticket_categories: [], // Kosong karena gratis
  rundowns: [
    {
      id: "rundown-1",
      start_time: "18:00",
      end_time: "18:30",
      title: "Registrasi & Networking",
      location: "Lobby Utama",
      description: "Peserta daftar ulang dan networking ringan.",
    },
    {
      id: "rundown-2",
      start_time: "18:30",
      end_time: "20:00",
      title: "Main Talk: Why Open Source Matters",
      location: "Meeting Room",
      description: "Diskusi panel tentang dampak open source.",
    },
    {
      id: "rundown-3",
      start_time: "20:00",
      end_time: "21:00",
      title: "Dinner & chill",
      location: "Area Kantin",
      description: "Makan malam bersama (disediakan).",
    },
  ],
};

// --- 4. EVENT GRATIS TIDAK TERBATAS (FREE UNLIMITED) ---
const DUMMY_EVENT_FREE_UNLIMITED: Event = {
  event_id: "evt-free-unlimited",
  title: "Global Climate Action Webinar (Free Unlimited)",
  slug: "global-climate-action",
  description: JSON.stringify({ content:
    "<p>Webinar global tentang aksi nyata perubahan iklim. Terbuka untuk umum tanpa batasan peserta.</p>"
  }),
  event_start_date: new Date("2026-11-25T13:00:00Z").toISOString(),
  event_end_date: new Date("2026-11-25T15:00:00Z").toISOString(),
  start_registration_date: new Date("2026-11-01T00:00:00Z").toISOString(),
  end_registration_date: new Date("2026-11-25T12:00:00Z").toISOString(),
  is_online: true,
  category: "Environment",
  type: "public",
  status: "published",
  max_capacity: 0, // 0 = Unlimited
  max_ticket_per_user: 10,
  total_sold: 1250,
  address: {
    raw_address: "",
    city: "",
    province: "",
    postal_code: "",
  },
  images: [
    { id: 1, image_url: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80&w=2070", is_primary: true },
    { id: 2, image_url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1574", is_primary: false }
  ],
  ticket_categories: [], // Kosong karena gratis
  rundowns: [
    {
      id: "rundown-1",
      start_time: "13:00",
      end_time: "13:10",
      title: "Welcome Remarks",
      location: "YouTube Live",
      description: "Sambutan pembuka.",
    },
    {
      id: "rundown-2",
      start_time: "13:10",
      end_time: "14:30",
      title: "Expert Panel Discussion",
      location: "YouTube Live",
      description: "Diskusi panel para ahli lingkungan.",
    },
    {
      id: "rundown-3",
      start_time: "14:30",
      end_time: "15:00",
      title: "Q&A from Chat",
      location: "YouTube Live",
      description: "Menjawab pertanyaan dari kolom chat.",
    },
  ],
};

// 🌟 Ganti variable ini untuk switch testing
export const DUMMY_EVENT_DETAIL = DUMMY_EVENT_OFFLINE_PAID;
// export const DUMMY_EVENT_DETAIL = DUMMY_EVENT_ONLINE_PAID;
// export const DUMMY_EVENT_DETAIL = DUMMY_EVENT_OFFLINE_FREE_LIMITED;
// export const DUMMY_EVENT_DETAIL = DUMMY_EVENT_FREE_UNLIMITED;
