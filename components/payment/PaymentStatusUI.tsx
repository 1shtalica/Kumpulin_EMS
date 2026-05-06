import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export type PaymentStatus = "success" | "failed" | "sold_out";

interface PaymentStatusUIProps {
  status: PaymentStatus;
  orderId: string;
}

export function PaymentStatusUI({ status, orderId }: PaymentStatusUIProps) {
  const router = useRouter();

  // Konfigurasi berdasarkan status
  const config = {
    success: {
      icon: <CheckCircle2 size={48} />,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-500",
      title: "Pembayaran Berhasil!",
      desc: "Terima kasih, pembayaran Anda telah kami terima dan tiket telah diterbitkan.",
      actionText: "Lihat Tiket Saya",
      actionAction: () => router.push("/user/my-ticket")
    },
    failed: {
      icon: <XCircle size={48} />,
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      title: "Pembayaran Gagal",
      desc: "Maaf, transaksi Anda ditolak atau waktu pembayaran telah habis. Silakan coba pesanan baru.",
      actionText: "Kembali ke Beranda",
      actionAction: () => router.push("/")
    },
    sold_out: {
      icon: <AlertCircle size={48} />,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-500",
      title: "Pembayaran Berhasil, Namun Tiket Habis",
      desc: "Dana Anda telah masuk, namun sayangnya kuota tiket untuk event ini baru saja habis. Dana Anda akan di-refund secara otomatis dalam 1x24 jam.",
      actionText: "Hubungi Customer Service",
      actionAction: () => router.push("/") // Arahkan ke CS atau halaman bantuan
    }
  };

  const currentConfig = config[status];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center flex flex-col items-center animate-in fade-in zoom-in duration-500">
        
        <div className={`w-24 h-24 ${currentConfig.iconBg} ${currentConfig.iconColor} rounded-full flex items-center justify-center mb-6`}>
          {currentConfig.icon}
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{currentConfig.title}</h1>
        <p className="text-slate-500 mb-6 px-2">{currentConfig.desc}</p>
        
        <div className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-8">
          <p className="text-sm text-slate-500 mb-1">Order ID</p>
          <p className="font-mono font-medium text-slate-800">{orderId}</p>
        </div>

        <Button 
          onClick={currentConfig.actionAction}
          className="w-full h-12 rounded-xl text-md font-semibold"
          variant={status === "success" ? "default" : "outline"}
        >
          {currentConfig.actionText}
        </Button>

      </div>
    </div>
  );
}
