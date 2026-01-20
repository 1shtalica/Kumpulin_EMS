import Image from "next/image";

export default function EventHero() {
  return (
    <div className="w-full flex justify-center py-8 bg-slate-50">
      {/* Container Utama Hero */}
      <div className="relative w-full max-w-4xl h-[300px] md:h-[400px] flex items-center justify-center">
        {/* Container Gambar "Mengambang" 
          - Kita butuh 'relative' di sini agar Image dengan prop 'fill' bisa menyesuaikan diri.
          - 'overflow-hidden' dan 'rounded-2xl' agar sudut gambar ikut melengkung.
        */}
        <div className="relative w-[60%] h-[80%] shadow-xl rounded-2xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1740&auto=format&fit=crop"
            alt="Ilustrasi Event Teknologi dan Networking"
            fill // Props 'fill' membuat gambar memenuhi container parent-nya (div w-[60%])
            className="object-cover hover:scale-105 transition-transform duration-500" // object-cover agar gambar tidak gepeng, plus efek zoom sedikit saat hover
            priority // Prioritaskan loading karena ini gambar hero (di atas lipatan)
          />

          {/* Opsional: Overlay agar teks di atasnya nanti lebih terbaca */}
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
      </div>
    </div>
  );
}
