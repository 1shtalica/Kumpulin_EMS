import { Event } from "@/types/event";

// --- 1. EVENT OFFLINE BERBAYAR (PAID) ---
const DUMMY_EVENT_OFFLINE_PAID: Event = {
  id: "evt-offline-paid",
  title: "Tech Conference Indonesia 2026 (Offline Paid)",
  slug: "tech-conference-indonesia-2026",
  description:
    "<p>Bergabunglah dengan konferensi teknologi terbesar di Indonesia tahun ini! Diskusikan masa depan AI, Cloud Computing, dan Web Development bersama para ahli.</p><br><p><strong>Highlight Acara:</strong></p><ul><li>Keynote dari CEO Tech Giant</li><li>Workshop Coding Hands-on</li><li>Networking Session dengan 500+ Developer</li></ul>",
  start_date: new Date("2026-10-15T09:00:00Z").toISOString(),
  end_date: new Date("2026-10-16T17:00:00Z").toISOString(),
  registration_start_date: new Date("2026-08-01T00:00:00Z").toISOString(),
  registration_end_date: new Date("2026-10-14T23:59:59Z").toISOString(),
  is_online: false,
  is_paid: true,
  category: "Technology",
  capacity: 320,
  max_purchases: 5,
  address: {
    province: "DKI Jakarta",
    city: "Jakarta Pusat",
    raw_address:
      "Grand Ballroom Hotel Indonesia Kempinski, Jl. M.H. Thamrin No.1",
    postal_code: "10310",
  },
  banner_url:
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2070",
  posters: [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2070",
    "https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&q=80&w=2070",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=2000",
  ],
  organizer_id: 101,
  organizer: {
    id: 101,
    name: "Komunitas Dev Indo",
    avatar: "https://github.com/shadcn.png",
    description:
      "Komunitas pengembang software terbesar di Indonesia yang berfokus pada kolaborasi dan inovasi.",
    verification_status: "verified",
  },
  ticket_categories: [
    {
      id: 1,
      name: "Early Bird",
      price: 150000,
      quota: 100,
      sold: 100, // Sold out
      description: "Akses penuh selama 2 hari dengan harga spesial.",
    },
    {
      id: 2,
      name: "Regular Pass",
      price: 300000,
      quota: 200,
      sold: 50,
      description: "Akses penuh selama 2 hari + sertifikat digital.",
    },
    {
      id: 3,
      name: "VIP Access",
      price: 750000,
      quota: 20,
      sold: 5,
      description: "Front row seat + Lunch + Exclusive Merchandise.",
    },
  ],
  sold_event: 155,
  rundowns: [
    {
      id: 1,
      title: "Registrasi Ulang",
      description: "Peserta melakukan penukaran tiket dengan ID Card.",
      start_time: "08:00",
      end_time: "09:00",
      location: "Lobby Ballroom",
    },
    {
      id: 2,
      title: "Opening Keynote: The Future of Code",
      description: "Pembicara: Budi Santoso (CTO Startup Unicorn)",
      start_time: "09:00",
      end_time: "10:30",
      location: "Main Stage",
    },
    {
      id: 3,
      title: "Break & Networking",
      start_time: "10:30",
      end_time: "11:00",
      location: "Foyer Area",
    },
    {
      id: 4,
      title: "Workshop: Building Scalable Apps with Next.js",
      description: "Sesi praktik langsung membuat aplikasi web modern.",
      start_time: "11:00",
      end_time: "13:00",
      location: "Meeting Room A",
    },
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// --- 2. EVENT ONLINE BERBAYAR (ONLINE PAID) ---
const DUMMY_EVENT_ONLINE_PAID: Event = {
  id: "evt-online-paid",
  title: "Masterclass Cyber Security (Online)",
  slug: "masterclass-cyber-security",
  description:
    "<p>Pelajari teknik ethical hacking dan cyber security dari praktisi berpengalaman secara online.</p>",
  start_date: new Date("2026-12-05T19:00:00Z").toISOString(),
  end_date: new Date("2026-12-05T21:00:00Z").toISOString(),
  registration_start_date: new Date("2026-11-01T00:00:00Z").toISOString(),
  registration_end_date: new Date("2026-12-04T23:59:59Z").toISOString(),
  is_online: true,
  is_paid: true,
  category: "Technology",
  capacity: 200,
  max_purchases: 1,
  meeting_url: "https://zoom.us/j/1234567890", // Online Meeting URL
  // Address is optional and typically usually omitted for Online events, but types allow it.
  banner_url:
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070",
  posters: [
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070",
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1470",
    "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=2070",
  ],
  organizer_id: 103,
  organizer: {
    id: 103,
    name: "SecureCode Academy",
    avatar: "https://github.com/shadcn.png",
    description: "Lembaga pelatihan keamanan siber terpercaya.",
    verification_status: "verified",
  },
  ticket_categories: [
    {
      id: 10,
      name: "Webinar Pass",
      price: 50000,
      quota: 200,
      sold: 45,
      description: "Link Zoom + E-Certificate + Modul PDF.",
    },
  ],
  sold_event: 45,
  rundowns: [
    {
      id: 1,
      start_time: "19:00",
      end_time: "19:15",
      title: "Opening",
      location: "Zoom Meeting",
      description: "Perkenalan instruktur dan materi.",
    },
    {
      id: 2,
      start_time: "19:15",
      end_time: "20:30",
      title: "Main Session: Introduction to Ethical Hacking",
      location: "Zoom Meeting",
      description: "Pembahasan konsep dasar dan demo live hacking.",
    },
    {
      id: 3,
      start_time: "20:30",
      end_time: "21:00",
      title: "Q&A Session",
      location: "Zoom Meeting",
      description: "Tanya jawab langsung dengan instruktur.",
    },
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// --- 3. EVENT OFFLINE GRATIS TERBATAS (FREE LIMITED) ---
const DUMMY_EVENT_OFFLINE_FREE_LIMITED: Event = {
  id: "evt-offline-free-limited",
  title: "Community Meetup: Open Source (Offline Free Limited)",
  slug: "community-meetup-open-source",
  description:
    "<p>Ajang kumpul komunitas Open Source Indonesia. Sharing session santai mengenai kontribusi di proyek open source.</p>",
  start_date: new Date("2026-11-20T18:00:00Z").toISOString(),
  end_date: new Date("2026-11-20T21:00:00Z").toISOString(),
  registration_start_date: new Date("2026-11-01T00:00:00Z").toISOString(),
  registration_end_date: new Date("2026-11-19T23:59:59Z").toISOString(),
  is_online: false,
  is_paid: false,
  category: "Community",
  capacity: 50, // Kuota terbatas 50 orang
  max_purchases: 2,
  address: {
    province: "DI Yogyakarta",
    city: "Yogyakarta",
    raw_address: "Coworking Space Jogja, Jl. Kaliurang KM 5",
    postal_code: "55281",
  },
  banner_url:
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop",
  posters: [
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070",
  ],
  organizer_id: 102,
  organizer: {
    id: 102,
    name: "Jogja JS",
    avatar: "https://github.com/shadcn.png",
    description: "Komunitas JavaScript Yogyakarta.",
    verification_status: "verified",
  },
  ticket_categories: [], // Kosong karena gratis
  sold_event: 42, // Sisa 8 tiket
  rundowns: [
    {
      id: 1,
      start_time: "18:00",
      end_time: "18:30",
      title: "Registrasi & Networking",
      location: "Lobby Utama",
      description: "Peserta daftar ulang dan networking ringan.",
    },
    {
      id: 2,
      start_time: "18:30",
      end_time: "20:00",
      title: "Main Talk: Why Open Source Matters",
      location: "Meeting Room",
      description: "Diskusi panel tentang dampak open source.",
    },
    {
      id: 3,
      start_time: "20:00",
      end_time: "21:00",
      title: "Dinner & chill",
      location: "Area Kantin",
      description: "Makan malam bersama (disediakan).",
    },
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// --- 4. EVENT GRATIS TIDAK TERBATAS (FREE UNLIMITED) ---
const DUMMY_EVENT_FREE_UNLIMITED: Event = {
  id: "evt-free-unlimited",
  title: "Global Climate Action Webinar (Free Unlimited)",
  slug: "global-climate-action",
  description:
    "<p>Webinar global tentang aksi nyata perubahan iklim. Terbuka untuk umum tanpa batasan peserta.</p>",
  start_date: new Date("2026-11-25T13:00:00Z").toISOString(),
  end_date: new Date("2026-11-25T15:00:00Z").toISOString(),
  registration_start_date: new Date("2026-11-01T00:00:00Z").toISOString(),
  registration_end_date: new Date("2026-11-25T12:00:00Z").toISOString(),
  is_online: true,
  is_paid: false,
  category: "Environment",
  capacity: 0, // 0 = Unlimited
  max_purchases: 10, // Max beli per user tetap bisa ada
  meeting_url: "https://youtube.com/live/xyz123", // Streaming link
  banner_url:
    "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80&w=2070",
  posters: [
    "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80&w=2070",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1574",
  ],
  organizer_id: 105,
  organizer: {
    id: 105,
    name: "Eco World",
    avatar: "https://github.com/shadcn.png",
    description: "Organisasi nirlaba lingkungan hidup.",
    verification_status: "verified",
  },
  ticket_categories: [], // Kosong karena gratis
  sold_event: 1250, // Sudah banyak yang daftar
  rundowns: [
    {
      id: 1,
      start_time: "13:00",
      end_time: "13:10",
      title: "Welcome Remarks",
      location: "YouTube Live",
      description: "Sambutan pembuka.",
    },
    {
      id: 2,
      start_time: "13:10",
      end_time: "14:30",
      title: "Expert Panel Discussion",
      location: "YouTube Live",
      description: "Diskusi panel para ahli lingkungan.",
    },
    {
      id: 3,
      start_time: "14:30",
      end_time: "15:00",
      title: "Q&A from Chat",
      location: "YouTube Live",
      description: "Menjawab pertanyaan dari kolom chat.",
    },
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// 🌟 Ganti variable ini untuk switch testing
export const DUMMY_EVENT_DETAIL = DUMMY_EVENT_OFFLINE_PAID;
// export const DUMMY_EVENT_DETAIL = DUMMY_EVENT_ONLINE_PAID;
// export const DUMMY_EVENT_DETAIL = DUMMY_EVENT_OFFLINE_FREE_LIMITED;
// export const DUMMY_EVENT_DETAIL = DUMMY_EVENT_FREE_UNLIMITED;
