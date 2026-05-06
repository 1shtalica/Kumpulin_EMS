import { User, Mail, Phone, Info } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckoutFormValues } from "@/lib/validator/checkout";
import { cn } from "@/lib/utils";

export function BuyerInfoForm() {
  const { register, setValue, formState: { errors } } = useFormContext<CheckoutFormValues>();

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <User className="text-primary" size={20} />
        Data Pemesan
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="buyer_name" className="text-slate-700">
            Nama Lengkap <span className="text-danger">*</span>
          </Label>
          <Input 
            id="buyer_name"
            type="text" 
            placeholder="Masukkan nama lengkap" 
            {...register("buyer_name")}
            className={errors.buyer_name ? "border-danger" : ""}
          />
          {errors.buyer_name && (
            <p className="text-xs text-danger font-medium">{errors.buyer_name.message}</p>
          )}
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="buyer_email" className="text-slate-700">
            Email Aktif <span className="text-danger">*</span>
          </Label>
          <Input 
            startIcon={<Mail className="h-4 w-4 text-muted-foreground" />}
            id="buyer_email"
            type="email" 
            placeholder="Email untuk pengiriman e-ticket" 
            {...register("buyer_email")}
            className={errors.buyer_email ? "border-danger" : ""}
          />
          {errors.buyer_email && (
            <p className="text-xs text-danger font-medium">{errors.buyer_email.message}</p>
          )}
        </div>

        <div className="grid gap-2 md:col-span-2">
          <Label htmlFor="buyer_phone" className="text-slate-700">
            Nomor WhatsApp <span className="text-danger">*</span>
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                +62
              </span>
              <span className="text-gray-300">|</span>
            </div>

            <Input 
              id="buyer_phone"
              type="tel" 
              placeholder="8xxxxxxxx"
              autoComplete="tel"
              {...register("buyer_phone")}
              className={cn(
                "pl-20",
                errors.buyer_phone && "border-danger",
              )}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, ""); // Hapus non-digit

                // Jika user ketik 0 di awal, hapus semua 0 di depan
                if (value.startsWith("0")) {
                  value = value.replace(/^0+/, "");
                }

                // Maksimal 13 digit
                if (value.length > 13) {
                  value = value.slice(0, 13);
                }

                setValue("buyer_phone", value, {
                  shouldValidate: true,
                });
              }}
            />
          </div>
          {errors.buyer_phone && (
            <p className="text-xs text-danger font-medium">{errors.buyer_phone.message}</p>
          )}
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-sm text-amber-800">
        <Info size={18} className="shrink-0 mt-0.5" />
        <p>Pastikan email dan nomor WhatsApp sudah benar. E-ticket akan dikirimkan ke kontak tersebut setelah pembayaran berhasil.</p>
      </div>
    </div>
  );
}
