import { Info, Mail, Phone, User } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckoutFormValues } from "@/lib/validator/checkout";
import { cn } from "@/lib/utils";

export function BuyerInfoForm() {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<CheckoutFormValues>();

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
            <User className="h-4 w-4 text-primary" />
            Data pemesan
          </div>
          <h2 className="text-lg font-semibold text-slate-950">Kontak e-ticket</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="buyer_name" className="text-[13px] font-medium text-slate-700">
            Nama Lengkap <span className="text-danger">*</span>
          </Label>
          <Input
            id="buyer_name"
            type="text"
            placeholder="Masukkan nama lengkap"
            {...register("buyer_name")}
            className={cn(
              "h-10 rounded-xl border-slate-200 bg-slate-50 text-[13px] focus-visible:border-primary/40 focus-visible:ring-primary/20",
              errors.buyer_name && "border-danger focus-visible:border-danger focus-visible:ring-danger/20",
            )}
          />
          {errors.buyer_name && (
            <p className="text-xs font-medium text-danger">{errors.buyer_name.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="buyer_email" className="text-[13px] font-medium text-slate-700">
            Email Aktif <span className="text-danger">*</span>
          </Label>
          <Input
            startIcon={<Mail className="h-4 w-4 text-slate-400" />}
            id="buyer_email"
            type="email"
            placeholder="Email untuk pengiriman e-ticket"
            {...register("buyer_email")}
            className={cn(
              "h-10 rounded-xl border-slate-200 bg-slate-50 text-[13px] focus-visible:border-primary/40 focus-visible:ring-primary/20",
              errors.buyer_email && "border-danger focus-visible:border-danger focus-visible:ring-danger/20",
            )}
          />
          {errors.buyer_email && (
            <p className="text-xs font-medium text-danger">{errors.buyer_email.message}</p>
          )}
        </div>

        <div className="grid gap-2 md:col-span-2">
          <Label htmlFor="buyer_phone" className="text-[13px] font-medium text-slate-700">
            Nomor WhatsApp <span className="text-danger">*</span>
          </Label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400" />
              <span className="text-[13px] font-semibold text-slate-700">+62</span>
              <span className="text-slate-300">|</span>
            </div>

            <Input
              id="buyer_phone"
              type="tel"
              placeholder="8xxxxxxxx"
              autoComplete="tel"
              {...register("buyer_phone")}
              className={cn(
                "h-10 rounded-xl border-slate-200 bg-slate-50 pl-20 text-[13px] focus-visible:border-primary/40 focus-visible:ring-primary/20",
                errors.buyer_phone && "border-danger focus-visible:border-danger focus-visible:ring-danger/20",
              )}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, "");

                if (value.startsWith("0")) {
                  value = value.replace(/^0+/, "");
                }

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
            <p className="text-xs font-medium text-danger">{errors.buyer_phone.message}</p>
          )}
        </div>
      </div>

      <div className="mt-5 flex gap-3 rounded-xl border border-warning/20 bg-warning-light/50 p-3 text-[13px] text-slate-700">
        <Info size={18} className="mt-0.5 shrink-0 text-warning-hover" />
        <p className="leading-relaxed">
          Pastikan email dan nomor WhatsApp sudah benar. E-ticket akan dikirimkan ke kontak tersebut setelah pembayaran berhasil.
        </p>
      </div>
    </section>
  );
}
