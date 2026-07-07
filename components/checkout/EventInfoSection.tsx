import { CalendarDays, MapPin, Ticket } from "lucide-react";

interface EventInfoProps {
  title: string;
  date: string;
  time: string;
  location: string;
}

export function EventInfoSection({ title, date, time, location }: EventInfoProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
      <svg
        className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 text-primary"
        viewBox="0 0 160 160"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M29 111C50 73 76 52 132 45"
          stroke="currentColor"
          strokeOpacity="0.1"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <rect x="84" y="76" width="40" height="40" rx="12" fill="currentColor" fillOpacity="0.07" />
        <rect x="108" y="28" width="24" height="24" rx="7" fill="#10b981" fillOpacity="0.1" />
      </svg>

      <div className="relative flex flex-col gap-6">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary-light/50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            <Ticket className="h-3.5 w-3.5" />
            Informasi Event
          </div>
          <h2 className="text-xl font-bold leading-tight text-slate-950 md:text-2xl">
            {title}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-4 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 transition-colors hover:border-slate-300/80">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm shadow-slate-900/5">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col pt-0.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Jadwal Pelaksanaan</span>
              <span className="mt-1 text-[13px] font-semibold leading-snug text-slate-900">
                {date}
              </span>
              <span className="mt-0.5 text-xs font-medium text-slate-500">
                {time}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 transition-colors hover:border-slate-300/80">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm shadow-slate-900/5">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col pt-0.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Lokasi Event</span>
              <span className="mt-1 text-[13px] font-semibold leading-snug text-slate-900">
                {location}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
