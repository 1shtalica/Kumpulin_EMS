import { Building2, Check, Globe2, ShieldCheck, Users } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CreateEventSchema } from "@/lib/validator/create-event.schema";

const eventTypes = [
  {
    value: "external" as const,
    title: "Event Publik",
    subtitle: "Terbuka untuk umum",
    description:
      "Tampilkan event di halaman eksplorasi dan jangkau peserta dari luar komunitas.",
    Icon: Globe2,
    accent: "primary",
    points: [
      "Tampil di pencarian publik",
      "Cocok untuk konser, seminar, workshop, dan festival",
      "Mendukung tiket gratis atau berbayar",
    ],
  },
  {
    value: "internal" as const,
    title: "Event Internal",
    subtitle: "Khusus anggota komunitas",
    description:
      "Buat agenda terbatas untuk peserta tertentu dengan kontrol akses lebih rapat.",
    Icon: ShieldCheck,
    accent: "secondary",
    points: [
      "Akses event lebih terbatas",
      "Cocok untuk agenda komunitas atau organisasi",
      "Lebih mudah menjaga privasi acara",
    ],
  },
];

export default function EventTypeStep() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateEventSchema>();
  const selectedType = watch("type");

  const onSelectType = (type: "external" | "internal") => {
    setValue("type", type, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <Users className="h-3.5 w-3.5" />
          Akses peserta
        </div>
        <h2 className="text-2xl font-bold leading-tight text-slate-950">
          Pilih tipe event
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 md:text-base">
          Tipe event menentukan bagaimana peserta menemukan dan mengakses event
          yang kamu buat.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {eventTypes.map((type) => {
          const isSelected = selectedType === type.value;
          const Icon = type.Icon;
          const isPrimary = type.accent === "primary";

          return (
            <Button
              key={type.value}
              type="button"
              variant="ghost"
              onClick={() => onSelectType(type.value)}
              className={cn(
                "group relative flex h-full min-h-80 w-full flex-col items-start justify-between overflow-hidden rounded-2xl border p-5 text-left whitespace-normal transition-all duration-200",
                "hover:-translate-y-0.5 hover:bg-white hover:shadow-md hover:shadow-slate-900/10",
                isSelected
                  ? isPrimary
                    ? "border-primary/40 bg-primary-light/70 shadow-md shadow-primary/10 hover:bg-primary-light/70"
                    : "border-secondary/50 bg-secondary-light/60 shadow-md shadow-slate-900/10 hover:bg-secondary-light/60"
                  : "border-slate-200 bg-white",
                errors.type && "border-danger",
              )}
            >
              <div
                className={cn(
                  "pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full transition-transform duration-300 group-hover:scale-110",
                  isPrimary ? "bg-primary/10" : "bg-secondary/20",
                )}
              />

              {isSelected && (
                <div
                  className={cn(
                    "absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm",
                    isPrimary ? "bg-primary" : "bg-secondary",
                  )}
                >
                  <Check className="h-4 w-4" />
                </div>
              )}

              <div className="relative space-y-5">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200 transition-colors",
                    isPrimary ? "text-primary" : "text-secondary",
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <div className="space-y-2 pr-8">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">
                      {type.title}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {type.subtitle}
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {type.description}
                  </p>
                </div>
              </div>

              <div className="relative w-full space-y-2 rounded-xl border border-slate-200/80 bg-white/70 p-3">
                {type.points.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-2 text-sm leading-relaxed text-slate-600"
                  >
                    <span
                      className={cn(
                        "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                        isPrimary ? "bg-primary" : "bg-secondary",
                      )}
                    />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </Button>
          );
        })}
      </div>

      {errors.type && (
        <p className="rounded-xl border border-danger/20 bg-danger-light/50 px-4 py-3 text-sm font-medium text-danger">
          {errors.type.message}
        </p>
      )}

      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary ring-1 ring-slate-200">
            <Building2 className="h-[18px] w-[18px]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Tipe masih bisa disesuaikan sebelum event dipublikasikan.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Pilih publik untuk event terbuka. Pilih internal jika event hanya
              untuk komunitas atau peserta tertentu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
