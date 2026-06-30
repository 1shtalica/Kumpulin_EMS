"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, CheckoutFormValues } from "@/lib/validator/checkout";

import { EventInfoSection } from "@/components/checkout/EventInfoSection";
import { BuyerInfoForm } from "@/components/checkout/BuyerInfoForm";
import { OrderSummarySection } from "@/components/checkout/OrderSummarySection";
import { MeshGradientBackground } from "@/components/reusable/mesh-gradient-background";

import { AuthService } from "@/services/auth-service";
import { EventService } from "@/services/event-service";
import { OrderService } from "@/services/order-service";
import type { Event } from "@/types/event";

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

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.startsWith("62")) return `+${digits}`;
  return `+62${digits}`;
}

export default function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ event_id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { event_id } = use(params);
  const resolvedSearchParams = use(searchParams);
  const ticket_id = resolvedSearchParams.ticket_id as string;
  const qty = parseInt((resolvedSearchParams.qty as string) || "1", 10);
  
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [isFetchingEvent, setIsFetchingEvent] = useState(true);
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

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsFetchingEvent(true);
        const data = await EventService.getEventById(event_id);
        if (!data) {
          setFetchError("Event tidak ditemukan.");
          return;
        }
        setEvent(data);
      } catch {
        setFetchError("Gagal mengambil data event. Pastikan link valid.");
      } finally {
        setIsFetchingEvent(false);
      }
    };
    fetchEvent();
  }, [event_id]);

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

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!event || !ticket_id) return;
    setIsLoading(true);

    try {
      const idempotencyKey = `${event.event_id}-${ticket_id}-${qty}-${Date.now()}`;
      const orderData = await OrderService.createOrder(
        event.event_id,
        {
          items: [
            {
              ticket_category_id: ticket_id,
              quantity: qty,
            },
          ],
          participants: [
            {
              ticket_category_id: ticket_id,
              full_name: data.buyer_name.trim(),
              email: data.buyer_email.trim(),
              phone: normalizePhone(data.buyer_phone),
            },
          ],
        },
        idempotencyKey,
      );

      if (orderData.payment?.payment_url) {
        window.location.href = orderData.payment.payment_url;
        return;
      }
      
      router.push(`/payment/${orderData.order.id}`);
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
      };
      const msg = error?.response?.data?.message ?? "Gagal membuat pesanan, coba lagi.";
      toast.error(msg);
      setIsLoading(false);
    }
  };

  if (isFetchingEvent) {
    return (
      <MeshGradientBackground className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-600">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="font-medium">Memuat detail event...</p>
        </div>
      </MeshGradientBackground>
    );
  }

  if (fetchError || !event) {
    return (
      <MeshGradientBackground className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Event Tidak Ditemukan</h2>
          <p className="text-slate-500 mb-6">{fetchError}</p>
          <Button onClick={() => router.push("/")} className="w-full">
            Kembali ke Beranda
          </Button>
        </div>
      </MeshGradientBackground>
    );
  }

  const isPaid = event.ticket_categories?.some((t) => t.price > 0) || false;
  const isFreeEventWithNoTickets = !isPaid && (event.ticket_categories?.length ?? 0) === 0;

  const effectiveTickets = isFreeEventWithNoTickets
      ? [
            {
                id: "free-virtual",
                name: "Tiket Gratis",
                price: 0,
                quota: event.max_capacity || 0,
                booked: event.total_sold || 0,
                description: "Tiket masuk untuk event ini.",
            },
        ]
      : (event.ticket_categories ?? []);

  const selectedTicket = effectiveTickets.find(t => t.id === ticket_id);

  if (!selectedTicket) {
    return (
      <MeshGradientBackground className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Tiket Tidak Ditemukan</h2>
          <p className="text-slate-500 mb-6">Pilihan tiket tidak valid.</p>
          <Button onClick={() => router.push(`/events/${event.slug || event.event_id}`)} className="w-full">
            Kembali ke Event
          </Button>
        </div>
      </MeshGradientBackground>
    );
  }

  const summaryItems = [
    {
      ticket_category_name: selectedTicket.name,
      quantity: qty,
      unit_price: selectedTicket.price,
      subtotal_amount: selectedTicket.price * qty,
    }
  ];

  const subtotal = summaryItems.reduce((acc, curr) => acc + curr.subtotal_amount, 0);
  const total = subtotal; // Assuming no additional fees

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
                Konfirmasi data pemesan Anda
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Kiri: Info Event, Data Pemesan, Metode Bayar */}
            <section className="lg:col-span-2 flex flex-col gap-6">
              <EventInfoSection
                title={event.title}
                date={
                  event.event_start_date 
                  ? new Intl.DateTimeFormat("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      timeZone: "Asia/Jakarta",
                    }).format(new Date(event.event_start_date))
                  : "-"
                }
                time={
                  event.event_start_date
                  ? `Mulai: ${new Intl.DateTimeFormat("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Jakarta",
                    }).format(new Date(event.event_start_date))} WIB`
                  : "-"
                }
                location={event.is_online ? "Event Online" : (event.address?.city ?? "-")}
              />

              {!isFetchingUser && <BuyerInfoForm />}
            </section>

            {/* Kanan: Ringkasan Pesanan */}
            <aside className="lg:col-span-1">
              <OrderSummarySection
                items={summaryItems}
                subtotal={subtotal}
                total={total}
                isLoading={isLoading}
              />
            </aside>
          </div>
        </form>
      </FormProvider>
    </MeshGradientBackground>
  );
}
