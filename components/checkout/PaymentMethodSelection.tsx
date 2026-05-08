import { AlertCircle } from "lucide-react";
import Image from "next/image";
import { useFormContext, Controller } from "react-hook-form";
import { CheckoutFormValues } from "@/lib/validator/checkout";

export function PaymentMethodSelection() {
  const { control, formState: { errors } } = useFormContext<CheckoutFormValues>();

  return (
    <div className={`bg-white rounded-3xl p-6 shadow-sm border ${errors.payment_method ? 'border-danger/50 ring-1 ring-danger/30' : 'border-slate-100'}`}>
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Pilih Metode Pembayaran <span className="text-danger">*</span>
        </h2>
      </div>
      
      <Controller
        name="payment_method"
        control={control}
        render={({ field }) => (
          <div className="space-y-4">
            {/* Virtual Account */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Virtual Account</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'bca_va', name: 'BCA Virtual Account', iconPath: '/Icon/bca.svg' },
                  { id: 'mandiri_va', name: 'Mandiri Virtual Account', iconPath: '/Icon/mandiri.svg' },
                  { id: 'bni_va', name: 'BNI Virtual Account', iconPath: '/Icon/bni.svg' },
                  { id: 'bri_va', name: 'BRI Virtual Account', iconPath: '/Icon/bri.svg' },
                ].map((method) => (
                  <div 
                    key={method.id}
                    onClick={() => field.onChange(method.id)}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${field.value === method.id ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-slate-100 hover:border-slate-300'}`}
                  >
                    <div className="w-12 h-8 relative rounded-md flex items-center justify-center shrink-0">
                      <Image 
                        src={method.iconPath} 
                        alt={method.name} 
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="font-medium text-slate-700 text-sm leading-tight">{method.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* E-Wallets */}
            <div className="pt-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">E-Wallet</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'gopay', name: 'GoPay', iconPath: '/Icon/gopay.svg' },
                  { id: 'qris', name: 'QRIS', iconPath: '/Icon/qris.svg' },
                ].map((method) => (
                  <div 
                    key={method.id}
                    onClick={() => field.onChange(method.id)}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${field.value === method.id ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-slate-100 hover:border-slate-300'}`}
                  >
                    <div className="w-12 h-8 relative rounded-md flex items-center justify-center shrink-0">
                      <Image 
                        src={method.iconPath} 
                        alt={method.name} 
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="font-medium text-slate-700 text-sm leading-tight">{method.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      />

      {errors.payment_method && (
        <div className="mt-4 flex items-center gap-2 text-danger text-sm font-medium bg-danger-light/50 p-3 rounded-xl border border-danger/20">
          <AlertCircle size={16} />
          {errors.payment_method.message}
        </div>
      )}
    </div>
  );
}
