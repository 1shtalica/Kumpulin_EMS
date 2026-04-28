"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CreditCard, 
  Wallet, 
  Landmark, 
  Copy, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Building2,
  Lock,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// --- DUMMY DATA ---
const DUMMY_TOTAL = 2230000;

export default function PaymentPage({ params }: { params: Promise<{ order_id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [selectedMethod, setSelectedMethod] = useState<string>("bca_va");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes

  // Format countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const handleMockPay = () => {
    setIsProcessing(true);
    // Simulate payment API call
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Redirect to ticket page after showing success
      setTimeout(() => {
        router.push("/user/my-ticket");
      }, 2500);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center flex flex-col items-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Pembayaran Berhasil!</h1>
          <p className="text-slate-500 mb-6">Terima kasih, tiket Anda telah diterbitkan.</p>
          <div className="w-full p-4 bg-slate-50 rounded-2xl mb-6">
            <p className="text-sm text-slate-500 mb-1">Order ID</p>
            <p className="font-mono font-medium text-slate-800">{resolvedParams.order_id}</p>
          </div>
          <div className="w-6 h-6 border-2 border-slate-200 border-t-primary rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 mt-4">Mengarahkan ke tiket Anda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Header / Timer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 text-amber-800">
            <Clock size={20} className="animate-pulse" />
            <span className="font-medium text-sm">Selesaikan pembayaran sebelum</span>
          </div>
          <div className="text-lg font-mono font-bold text-amber-600 bg-white px-3 py-1 rounded-lg shadow-xs">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Amount Header */}
          <div className="p-8 text-center bg-slate-900 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider font-semibold">Total Tagihan</p>
            <h1 className="text-4xl font-black tracking-tight">{formatRupiah(DUMMY_TOTAL)}</h1>
            <p className="text-slate-400 text-xs mt-3 font-mono">Order ID: {resolvedParams.order_id}</p>
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Pilih Metode Pembayaran</h2>
            
            {/* Payment Methods */}
            <div className="space-y-4 mb-8">
              {/* Bank Transfer / VA */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Virtual Account</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'bca_va', name: 'BCA Virtual Account', icon: Landmark, color: 'text-blue-600' },
                    { id: 'mandiri_va', name: 'Mandiri Virtual Account', icon: Landmark, color: 'text-yellow-500' },
                    { id: 'bni_va', name: 'BNI Virtual Account', icon: Landmark, color: 'text-teal-600' },
                    { id: 'bri_va', name: 'BRI Virtual Account', icon: Landmark, color: 'text-blue-800' },
                  ].map((method) => (
                    <div 
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${selectedMethod === method.id ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-slate-100 hover:border-slate-300'}`}
                    >
                      <div className={`p-2 bg-white rounded-xl shadow-xs border border-slate-100 ${method.color}`}>
                        <method.icon size={20} />
                      </div>
                      <span className="font-medium text-slate-700 text-sm">{method.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* E-Wallets */}
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">E-Wallet</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'gopay', name: 'GoPay', icon: Smartphone, color: 'text-green-500' },
                    { id: 'qris', name: 'QRIS', icon: Wallet, color: 'text-red-500' },
                  ].map((method) => (
                    <div 
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${selectedMethod === method.id ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-slate-100 hover:border-slate-300'}`}
                    >
                      <div className={`p-2 bg-white rounded-xl shadow-xs border border-slate-100 ${method.color}`}>
                        <method.icon size={20} />
                      </div>
                      <span className="font-medium text-slate-700 text-sm">{method.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Instruction / Mock Pay Action */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800">Simulasi Pembayaran (Dummy)</h3>
                <div className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Sandbox</div>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Ini adalah halaman dummy. Di production, instruksi pembayaran akan muncul di sini. Untuk keperluan testing, silakan klik tombol di bawah untuk mensimulasikan bahwa Anda telah berhasil membayar.
              </p>
              
              <Button 
                onClick={handleMockPay}
                disabled={isProcessing}
                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShieldCheck size={20} />
                    Simulasi Pembayaran Berhasil
                  </span>
                )}
              </Button>
            </div>

          </div>
        </div>
        
        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Lock size={12} />
          <p>Powered by Mock Payment Gateway. All transactions are simulated.</p>
        </div>
      </div>
    </div>
  );
}
