"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, CheckoutFormValues } from "@/lib/validator/checkout";

import { EventInfoSection } from "@/components/checkout/EventInfoSection";
import { BuyerInfoForm } from "@/components/checkout/BuyerInfoForm";
import { PaymentMethodSelection } from "@/components/checkout/PaymentMethodSelection";
import { OrderSummarySection } from "@/components/checkout/OrderSummarySection";
import { MeshGradientBackground } from "@/components/reusable/mesh-gradient-background";

import { AuthService } from "@/services/auth-service";
import { OrderService } from "@/services/order-service";
import type { OrderDataResponse } from "@/types/order";

function formatEventDate(isoString: string): { date: string; time: string } {
  const d = new Date(isoString);
  const date = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(d);
  const time = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(d);
  return { date, time };
}

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ order_id: string }>;
}) {
  const { order_id } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState<OrderDataResponse | null>(null);
  const [isFetchingOrder, setIsFetchingOrder] = useState(true);
  const [isFetchingUser, setIsFetchingUser] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

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

  // Fetch order detail dari API
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsFetchingOrder(true);
        const data = await OrderService.getOrderDetail(order_id);

        // Jika order sudah expired atau sudah paid, arahkan keluar
        if (data.order.status === "expired") {
          setFetchError("Pesanan ini telah kadaluarsa. Silakan buat pesanan baru.");
          return;
        }
        if (data.order.status === "paid") {
          router.replace(`/payment/${order_id}`);
          return;
        }
        setOrder(data);
      } catch {
        setFetchError("Gagal mengambil data pesanan. Pastikan link valid.");
      } finally {
        setIsFetchingOrder(false);
      }
    };
    fetchOrder();
  }, [order_id, router]);

  // Prefill form dengan data user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await AuthService.me();
        const user = res.data;
        const fullName = [user.first_name, user.last_name]
          .filter(Boolean)
          .join(" ");
        const prefillName = user.username ? user.username : fullName;
        let phoneStr = user.phone_number || "";
        if (phoneStr.startsWith("+62")) phoneStr = phoneStr.substring(3);
        else if (phoneStr.startsWith("62")) phoneStr = phoneStr.substring(2);
        else if (phoneStr.startsWith("0")) phoneStr = phoneStr.replace(/^0+/, "");

        reset({
          buyer_name: prefillName || "",
          buyer_email: user.email || "",
          buyer_phone: phoneStr,
          payment_method: "",
        });
      } catch {
        // Prefill gagal, biarkan user isi manual
      } finally {
        setIsFetchingUser(false);
      }
    };
    fetchUser();
  }, [reset]);

  const onSubmit = (data: CheckoutFormValues) => {
    setIsLoading(true);
    // Order sudah dibuat sebelum masuk ke sini.
    // Redirect ke payment page dengan method yang dipilih.
    router.push(`/payment/${order_id}?method=${data.payment_method}`);
  };

  if (isFetchingOrder) {
    return (
      <MeshGradientBackground className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-600">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="font-medium">Memuat detail pesanan...</p>
        </div>
      </MeshGradientBackground>
    );
  }

  if (fetchError || !order) {
    return (
      <MeshGradientBackground className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Pesanan Tidak Ditemukan</h2>
          <p className="text-slate-500 mb-6">{fetchError}</p>
          <Button onClick={() => router.push("/")} className="w-full">
            Kembali ke Beranda
          </Button>
        </div>
      </MeshGradientBackground>
    );
  }

  const eventStartDate = order.order.expires_at; // fallback jika tidak ada event detail
  const summaryItems = order.items.map((item) => ({
    ticket_category_name: item.ticket_category_name,
    quantity: item.quantity,
    unit_price: Number(item.unit_price),
    subtotal_amount: Number(item.subtotal_amount),
  }));

  return (
    <MeshGradientBackground className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex flex-col">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-5xl mx-auto w-full"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="ghost"
              size="icon"
              className="rounded-full bg-white shadow-sm border border-slate-200 hover:bg-slate-100"
            >
              <ChevronLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Checkout Tiket</h1>
              <p className="text-sm text-slate-500">
                ID Pesanan:{" "}
                <span className="font-mono">{order.order.order_number}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Kiri: Info Event, Data Pemesan, Metode Bayar */}
            <section className="lg:col-span-2 flex flex-col gap-6">
              <EventInfoSection
                title={`Order #${order.order.order_number}`}
                date={
                  new Intl.DateTimeFormat("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "Asia/Jakarta",
                  }).format(new Date(order.order.created_at))
                }
                time={`Berakhir: ${new Intl.DateTimeFormat("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Jakarta",
                }).format(new Date(order.order.expires_at))} WIB`}
                location={`${order.items.reduce((s, i) => s + i.quantity, 0)} tiket dipilih`}
              />

              {!isFetchingUser && <BuyerInfoForm />}

              <PaymentMethodSelection />
            </section>

            {/* Kanan: Ringkasan Pesanan */}
            <aside className="lg:col-span-1">
              <OrderSummarySection
                items={summaryItems}
                subtotal={Number(order.order.subtotal_amount)}
                total={Number(order.order.total_amount)}
                isLoading={isLoading}
              />
            </aside>
          </div>
        </form>
      </FormProvider>
    </MeshGradientBackground>
  );
}
