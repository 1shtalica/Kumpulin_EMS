"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getLastOrderId } from "@/lib/order-session";

export default function OrdersReturnPage() {
  const router = useRouter();
  const [hasStoredOrder, setHasStoredOrder] = useState(true);

  useEffect(() => {
    const orderId = getLastOrderId();

    if (orderId) {
      router.replace(`/orders/${orderId}`);
      return;
    }

    window.setTimeout(() => setHasStoredOrder(false), 0);
  }, [router]);

  if (hasStoredOrder) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f9fafb] px-4">
        <div className="flex flex-col items-center gap-4 text-slate-600">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="font-medium">Membuka status pesanan...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f9fafb] p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-md shadow-slate-900/5">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-danger-light text-danger">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-950">
          Pesanan Tidak Ditemukan
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Tidak ada order terakhir di sesi browser ini. Buka halaman tiket atau ulangi proses pembelian.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button asChild className="h-10 flex-1 rounded-xl text-sm font-semibold">
            <Link href="/user/my-ticket">Tiket Saya</Link>
          </Button>
          <Button asChild variant="outline" className="h-10 flex-1 rounded-xl text-sm font-semibold">
            <Link href="/events">Cari Event</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}