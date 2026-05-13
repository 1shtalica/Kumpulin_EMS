'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import PaymentInterstitial, { PaymentStatus } from "@/components/Interstitial/PaymentInterstitial";
import CheckInInterstitial, { CheckInStatus } from "@/components/Interstitial/CheckInInterstitial";

export default function FollowingPage() {
  const [paymentState, setPaymentState] = useState<{
    isOpen: boolean;
    status: PaymentStatus;
  }>({
    isOpen: false,
    status: "success"
  });

  const [checkInState, setCheckInState] = useState<{
    isOpen: boolean;
    status: CheckInStatus;
  }>({
    isOpen: false,
    status: "success"
  });

  // Handler khusus untuk proses Payment
  const handlePayment = (status: 'success' | 'failed') => {
    console.log(`[Simulasi] Proses Payment: ${status}`);
    setPaymentState({ isOpen: true, status });
  };

  // Handler khusus untuk proses Check-in
  const handleCheckIn = (status: 'success' | 'failed') => {
    console.log(`[Simulasi] Proses Check-in: ${status}`);
    setCheckInState({ isOpen: true, status });
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-12 bg-background">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Testing Interstitial Screen</h1>
        <p className="text-muted-foreground">
          Uji masing-masing proses (Payment & Check-in) secara terpisah.
        </p>
      </div>

      <div className="w-full max-w-2xl space-y-10">
        
        {/* --- Bagian Payment --- */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Simulasi Payment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white py-6 text-base"
              onClick={() => handlePayment('success')}
            >
              Payment Berhasil
            </Button>
            <Button 
              variant="destructive"
              className="py-6 text-base"
              onClick={() => handlePayment('failed')}
            >
              Payment Gagal
            </Button>
          </div>
        </section>

        {/* --- Bagian Check-in --- */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Simulasi Check-in</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white py-6 text-base"
              onClick={() => handleCheckIn('success')}
            >
              Check-in Berhasil
            </Button>
            <Button 
              variant="outline"
              className="border-red-600 text-red-700 hover:bg-red-50 py-6 text-base"
              onClick={() => handleCheckIn('failed')}
            >
              Check-in Gagal
            </Button>
          </div>
        </section>

      </div>

      {/* Komponen Overlay */}
      <PaymentInterstitial
        isOpen={paymentState.isOpen}
        status={paymentState.status}
        orderNumber="ORD-8X912-2026"
        customerName="John"
        onClose={() => setPaymentState(prev => ({ ...prev, isOpen: false }))}
        onPrimaryAction={() => {
          console.log("[Simulasi] Tombol Aksi Payment Ditekan.");
          setPaymentState(prev => ({ ...prev, isOpen: false }));
        }}
      />

      <CheckInInterstitial
        isOpen={checkInState.isOpen}
        status={checkInState.status}
        participantName="Rhein"
        ticketCategory="VIP - Early Bird"
        errorMessage="Tiket sudah digunakan pada 10:45 AM"
        onClose={() => setCheckInState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}