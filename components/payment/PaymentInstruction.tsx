import { Copy } from "lucide-react";
import Image from "next/image";

interface PaymentInstructionProps {
  methodId: string;
  totalAmount: number;
  orderId: string;
}

export function PaymentInstruction({ methodId, totalAmount, orderId }: PaymentInstructionProps) {
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Logika sederhana untuk mendapatkan nama dan icon metode berdasarkan methodId
  const getMethodDetails = (id: string) => {
    if (id.includes('bca')) return { name: 'BCA Virtual Account', iconPath: '/Icon/bca.svg' };
    if (id.includes('mandiri')) return { name: 'Mandiri Virtual Account', iconPath: '/Icon/mandiri.svg' };
    if (id.includes('bni')) return { name: 'BNI Virtual Account', iconPath: '/Icon/bni.svg' };
    if (id.includes('bri')) return { name: 'BRI Virtual Account', iconPath: '/Icon/bri.svg' };
    if (id.includes('gopay')) return { name: 'GoPay', iconPath: '/Icon/gopay.svg' };
    if (id.includes('qris')) return { name: 'QRIS', iconPath: '/Icon/qris.svg' };
    
    // Default fallback
    return { name: 'Transfer Bank', iconPath: '/Icon/bca.svg' }; // Defaulting to BCA or generic bank icon
  };

  const methodDetails = getMethodDetails(methodId);
  const dummyVA = "88000" + orderId.replace(/\D/g, '').substring(0, 8);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6">
      <div className="p-8 text-center bg-slate-900 text-white relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider font-semibold">Total Tagihan</p>
        <h1 className="text-4xl font-black tracking-tight">{formatRupiah(totalAmount)}</h1>
        <p className="text-slate-400 text-xs mt-3 font-mono">Order ID: {orderId}</p>
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="p-1 w-16 h-12 relative flex items-center justify-center shrink-0">
            <Image src={methodDetails.iconPath} alt={methodDetails.name} fill className="object-contain p-1" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Metode Pembayaran</p>
            <p className="font-bold text-slate-800">{methodDetails.name}</p>
          </div>
        </div>

        {methodId.includes('va') ? (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Nomor Virtual Account</p>
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-mono text-xl font-bold text-slate-800 tracking-wider">{dummyVA}</span>
              <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium text-sm px-3 py-1.5 bg-primary/10 rounded-lg">
                <Copy size={16} />
                Salin
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">Transfer tepat sesuai nominal hingga 3 digit terakhir.</p>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-48 h-48 bg-slate-100 rounded-xl mx-auto flex items-center justify-center mb-4 border-2 border-dashed border-slate-300">
              <span className="text-slate-400 font-medium">QR Code Dummy</span>
            </div>
            <p className="text-sm text-slate-600">Scan QR Code ini menggunakan aplikasi e-wallet Anda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
