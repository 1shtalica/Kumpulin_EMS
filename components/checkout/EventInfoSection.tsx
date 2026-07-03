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

      <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
            <Ticket className="h-4 w-4 text-primary" />
            Informasi event
          </div>
          <h2 className="max-w-2xl text-lg font-semibold leading-snug text-slate-950 md:text-xl">
            {title}
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:w-[360px] md:grid-cols-1">
          <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs text-slate-500">Tanggal dan waktu</p>
              <p className="mt-1 text-[13px] font-semibold leading-snug text-slate-900">
                {date} <span className="font-medium text-slate-500">{time}</span>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs text-slate-500">Lokasi</p>
              <p className="mt-1 text-[13px] font-semibold leading-snug text-slate-900">{location}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
