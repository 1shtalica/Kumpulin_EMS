"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarCheck,
  ChevronLeft,
  Loader2,
  LockKeyhole,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, CheckoutFormValues } from "@/lib/validator/checkout";

import { EventInfoSection } from "@/components/checkout/EventInfoSection";
import { BuyerInfoForm } from "@/components/checkout/BuyerInfoForm";
import { OrderSummarySection } from "@/components/checkout/OrderSummarySection";

import { AuthService } from "@/services/auth-service";
import { EventService } from "@/services/event-service";
import { OrderService } from "@/services/order-service";
import { saveLastOrderId } from "@/lib/order-session";
import type { Event } from "@/types/event";
import type { CreateOrderRequest } from "@/types/order";

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

function getTicketRemaining(ticket: {
  quota: number;
  sold?: number | null;
  booked?: number | null;
}) {
  const sold = ticket.sold ?? 0;
  const booked = ticket.booked ?? 0;
  return Math.max(0, ticket.quota - sold - booked);
}

function CheckoutBackdrop() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.16,
        }}
      />
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 -translate-x-1/3 -translate-y-1/3 rounded-full bg-primary-light/70 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 translate-x-1/3 translate-y-1/3 rounded-full bg-secondary-light/70 blur-3xl" />
    </>
  );
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
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryCooldown, setRetryCooldown] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const pendingOrderRef = useRef<{
    payload: CreateOrderRequest;
    idempotencyKey: string;
  } | null>(null);
  const isSubmittingRef = useRef(false);

  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      buyer_name: "",
      buyer_email: "",
      buyer_phone: "",
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
        });
      } catch {
        // Prefill gagal, biarkan user isi manual
      } finally {
        setIsFetchingUser(false);
      }
    };
    fetchUser();
  }, [reset]);

  useEffect(() => {
    if (retryCooldown <= 0) return;

    const interval = window.setInterval(() => {
      setRetryCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [retryCooldown]);

  const createOrder = async (
    payload: CreateOrderRequest,
    idempotencyKey: string,
  ) => {
    if (!event || isSubmittingRef.current || retryCooldown > 0) return;

    isSubmittingRef.current = true;
    setIsLoading(true);

    try {
      const orderData = await OrderService.createOrder(
        event.event_id,
        payload,
        idempotencyKey,
      );

      pendingOrderRef.current = null;
      const orderId = orderData.order.id;
      saveLastOrderId(orderId);

      if (orderData.payment?.payment_url) {
        window.location.href = orderData.payment.payment_url;
        return;
      }

      router.push(`/orders/${orderId}`);
    } catch (err: unknown) {
      const error = err as {
        response?: { status?: number; data?: { message?: string } };
      };

      if (error.response?.status === 429) {
        setIsRateLimited(true);
        setRetryCooldown(30);
        return;
      }

      const msg = error.response?.data?.message ?? "Gagal membuat pesanan, coba lagi.";
      toast.error(msg);
      pendingOrderRef.current = null;
      setIsRateLimited(false);
    } finally {
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!event || !ticket_id || isSubmittingRef.current || isRateLimited) return;
    const selectedTicket = event.ticket_categories?.find((t) => t.id === ticket_id);
    if (selectedTicket) {
      const remaining = getTicketRemaining(selectedTicket);
      if (remaining <= 0) {
        toast.error("Tiket ini sudah habis.");
        return;
      }
      if (qty > remaining) {
        toast.error(`Sisa tiket hanya ${remaining}.`);
        return;
      }
    }
    const attempt = {
      payload: {
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
      idempotencyKey: `${event.event_id}-${ticket_id}-${qty}-${Date.now()}`,
    };
    pendingOrderRef.current = attempt;
    await createOrder(attempt.payload, attempt.idempotencyKey);
  };

  const retryOrder = () => {
    const pendingOrder = pendingOrderRef.current;
    if (!pendingOrder || retryCooldown > 0) return;

    setIsRateLimited(false);
    void createOrder(pendingOrder.payload, pendingOrder.idempotencyKey);
  };

  if (isFetchingEvent) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f9fafb] px-4">
        <CheckoutBackdrop />
        <div className="relative flex flex-col items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 text-slate-600 shadow-md shadow-slate-900/5">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="font-medium">Memuat detail event...</p>
        </div>
      </main>
    );
  }

  if (fetchError || !event) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f9fafb] p-6">
        <CheckoutBackdrop />
        <div className="relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-md shadow-slate-900/5">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-light text-danger">
            <AlertTriangle size={32} />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-slate-950">Event Tidak Ditemukan</h2>
          <p className="mb-6 text-sm leading-relaxed text-slate-600">{fetchError}</p>
          <Button onClick={() => router.push("/")} className="h-10 w-full rounded-xl text-sm font-semibold">
            Kembali ke Beranda
          </Button>
        </div>
      </main>
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
          booked: 0,
          sold: event.total_sold || 0,
          description: "Tiket masuk untuk event ini.",
        },
      ]
    : (event.ticket_categories ?? []);

  const selectedTicket = effectiveTickets.find((t) => t.id === ticket_id);

  if (!selectedTicket) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f9fafb] p-6">
        <CheckoutBackdrop />
        <div className="relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-md shadow-slate-900/5">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-light text-danger">
            <AlertTriangle size={32} />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-slate-950">Tiket Tidak Ditemukan</h2>
          <p className="mb-6 text-sm leading-relaxed text-slate-600">Pilihan tiket tidak valid.</p>
          <Button
            onClick={() => router.push(`/events/${event.slug || event.event_id}`)}
            className="h-10 w-full rounded-xl text-sm font-semibold"
          >
            Kembali ke Event
          </Button>
        </div>
      </main>
    );
  }

  const summaryItems = [
    {
      ticket_category_name: selectedTicket.name,
      quantity: qty,
      unit_price: selectedTicket.price,
      subtotal_amount: selectedTicket.price * qty,
    },
  ];

  const subtotal = summaryItems.reduce((acc, curr) => acc + curr.subtotal_amount, 0);
  const total = subtotal;
  const eventSchedule = event.event_start_date
    ? formatEventDate(event.event_start_date)
    : { date: "-", time: "-" };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f9fafb] px-5 py-6 sm:px-8 lg:px-12 xl:px-16">
      <CheckoutBackdrop />
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative mx-auto flex w-full max-w-6xl flex-col gap-5"
        >
          <header className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5">
            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <Button
                  type="button"
                  onClick={() => router.back()}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-xl border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary"
                  aria-label="Kembali"
                >
                  <ChevronLeft size={20} />
                </Button>
                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    Checkout tiket
                  </p>
                  <h1 className="text-2xl font-bold leading-tight text-slate-950 md:text-3xl">
                    Konfirmasi pesanan
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                    Periksa tiket, lengkapi data pemesan, lalu lanjutkan ke pembayaran.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:w-[340px]">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-primary-light text-primary">
                    <CalendarCheck size={17} />
                  </div>
                  <p className="text-xs text-slate-500">Jadwal</p>
                  <p className="mt-1 text-[13px] font-semibold leading-snug text-slate-950">{eventSchedule.date}</p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-secondary-light text-success-hover">
                    <LockKeyhole size={17} />
                  </div>
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="mt-1 text-[13px] font-semibold leading-snug text-slate-950">
                    Aman terenkripsi
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="flex flex-col gap-5">
              <EventInfoSection
                title={event.title}
                date={eventSchedule.date}
                time={eventSchedule.time === "-" ? "-" : `${eventSchedule.time} WIB`}
                location={event.is_online ? "Event Online" : (event.address?.city ?? "-")}
              />

              {isFetchingUser ? (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
                  <div className="mb-5 h-5 w-40 rounded-lg bg-slate-100" />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="h-20 rounded-xl bg-slate-50" />
                    <div className="h-20 rounded-xl bg-slate-50" />
                    <div className="h-20 rounded-xl bg-slate-50 md:col-span-2" />
                  </div>
                </div>
              ) : (
                <BuyerInfoForm />
              )}
            </section>

            <aside>
              <OrderSummarySection
                items={summaryItems}
                subtotal={subtotal}
                total={total}
                isLoading={isLoading}
                isRateLimited={isRateLimited}
                retryCooldown={retryCooldown}
                onRetry={retryOrder}
              />
            </aside>
          </div>
        </form>
      </FormProvider>
    </main>
  );
}
