"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, CheckoutFormValues } from "@/lib/validator/checkout";

import { EventInfoSection } from "@/components/checkout/EventInfoSection";
import { BuyerInfoForm } from "@/components/checkout/BuyerInfoForm";
import { PaymentMethodSelection } from "@/components/checkout/PaymentMethodSelection";
import { OrderSummarySection } from "@/components/checkout/OrderSummarySection";
import { AuthService } from "@/services/auth-service";
import { MeshGradientBackground } from "@/components/reusable/mesh-gradient-background";

// --- DUMMY ORDER DATA ---
// Nanti bisa diganti dengan order-service.getById(order_id)
const DUMMY_ORDER = {
  order_id: "ORD-123456789",
  event_title: "Tech Conference 2026: Future of AI",
  date: "24 Mei 2026",
  time: "09:00 - 17:00 WIB",
  location: "Jakarta Convention Center, Senayan",
  tickets: [
    { id: 1, name: "VIP Pass", quantity: 1, price: 1500000 },
    { id: 2, name: "Workshop Add-on", quantity: 1, price: 500000 }
  ],
  subtotal: 2000000,
  tax: 220000, // 11% tax
  platform_fee: 10000,
  total: 2230000,
};

export default function CheckoutPage({ params }: { params: Promise<{ order_id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUser, setIsFetchingUser] = useState(true);

  // Inisialisasi React Hook Form dengan Zod Resolver
  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      buyer_name: "",
      buyer_email: "",
      buyer_phone: "",
      payment_method: "",
    },
    mode: "onSubmit",
  });

  const { reset, handleSubmit } = methods;

  // Fetching user data dari API backend untuk prefill
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await AuthService.me();
        const user = res.data;
        
        // Logika prioritas: username -> gabungan first_name & last_name
        const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
        const prefillName = user.username ? user.username : fullName;

        // Membersihkan awalan nomor telepon (+62, 62, atau 0)
        let phoneStr = user.phone_number || "";
        if (phoneStr.startsWith("+62")) {
          phoneStr = phoneStr.substring(3);
        } else if (phoneStr.startsWith("62")) {
          phoneStr = phoneStr.substring(2);
        } else if (phoneStr.startsWith("0")) {
          phoneStr = phoneStr.replace(/^0+/, "");
        }

        // Gunakan fungsi reset untuk mengisi ulang defaultValue form
        reset({
          buyer_name: prefillName || "",
          buyer_email: user.email || "",
          buyer_phone: phoneStr,
          payment_method: "", // Biarkan kosong agar user memilih
        });

      } catch (error) {
        console.error("Gagal mengambil data user:", error);
      } finally {
        setIsFetchingUser(false);
      }
    };
    fetchUserData();
  }, [reset]);

  const onSubmit = (data: CheckoutFormValues) => {
    setIsLoading(true);
    
    // Di backend sungguhan, kirim data (buyer_name, phone, dll) ke endpoint pembayaran
    console.log("Data siap disubmit:", data);

    setTimeout(() => {
      // Menyertakan method di URL agar halaman payment tahu (bisa juga via state manager)
      router.push(`/payment/${resolvedParams.order_id}?method=${data.payment_method}`);
    }, 1500);
  };

  return (
    <MeshGradientBackground className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex flex-col">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-5xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/events/dummy-slug">
              <Button type="button" variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-slate-200 hover:bg-slate-100">
                <ChevronLeft size={20} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Checkout Tiket</h1>
              <p className="text-sm text-slate-500">Selesaikan pesanan Anda dalam waktu 15:00 menit</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Kiri: Informasi Event, Data Pemesan, Pemilihan Pembayaran */}
            <section className="lg:col-span-2 flex flex-col gap-6">
              <EventInfoSection 
                title={DUMMY_ORDER.event_title}
                date={DUMMY_ORDER.date}
                time={DUMMY_ORDER.time}
                location={DUMMY_ORDER.location}
              />

              {!isFetchingUser && (
                <BuyerInfoForm />
              )}

              <PaymentMethodSelection />
            </section>

            {/* Kanan: Ringkasan Pesanan */}
            <aside className="lg:col-span-1">
              <OrderSummarySection 
                tickets={DUMMY_ORDER.tickets}
                subtotal={DUMMY_ORDER.subtotal}
                tax={DUMMY_ORDER.tax}
                platformFee={DUMMY_ORDER.platform_fee}
                total={DUMMY_ORDER.total}
                isLoading={isLoading}
              />
            </aside>
          </div>
        </form>
      </FormProvider>
    </MeshGradientBackground>
  );
}
