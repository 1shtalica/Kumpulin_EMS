import { CalendarDays, CheckCircle2, QrCode, Ticket } from "lucide-react";
import React from "react";

const eventRows = [
  { title: "Music showcase", meta: "19.30 WIB", tone: "bg-primary/12" },
  { title: "Tech meetup", meta: "Online", tone: "bg-[#10b981]/16" },
  { title: "Design class", meta: "Jakarta", tone: "bg-slate-200/80" },
];

const dotClusters = [
  { top: "12%", left: "22%", columns: 9, dots: 45, opacity: 0.28 },
  { top: "18%", left: "68%", columns: 7, dots: 35, opacity: 0.22 },
  { top: "70%", left: "24%", columns: 8, dots: 40, opacity: 0.2 },
  { top: "68%", left: "76%", columns: 10, dots: 50, opacity: 0.24 },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#f7f8fb] px-4 py-4 text-slate-950">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(circle at center, black 0%, black 48%, transparent 82%)",
          opacity: 0.24,
        }}
      />

      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {dotClusters.map((cluster, clusterIndex) => (
          <div
            key={clusterIndex}
            className="absolute grid gap-2"
            style={{
              top: cluster.top,
              left: cluster.left,
              gridTemplateColumns: `repeat(${cluster.columns}, 4px)`,
              opacity: cluster.opacity,
            }}
          >
            {Array.from({ length: cluster.dots }).map((_, dotIndex) => (
              <span
                key={dotIndex}
                className={
                  (dotIndex + clusterIndex) % 5 === 0
                    ? "size-1 rounded-full bg-[#10b981]"
                    : "size-1 rounded-full bg-primary"
                }
                style={{
                  opacity:
                    (dotIndex + clusterIndex) % 4 === 0
                      ? 0.28
                      : (dotIndex + clusterIndex) % 3 === 0
                        ? 0.55
                        : 0.9,
                }}
              />
            ))}
          </div>
        ))}

        <p className="absolute left-[15%] top-[31%] hidden font-mono text-[11px] tracking-widest text-slate-300 xl:block">
          :: ticket.queue / 07
        </p>
        <p className="absolute right-[16%] top-[57%] hidden font-mono text-[11px] tracking-widest text-slate-300 xl:block">
          check-in --ready
        </p>
      </div>

      <div
        className="pointer-events-none absolute left-[max(2rem,calc(50%-720px))] top-[54%] hidden w-72 -translate-y-1/2 rotate-[-2deg] rounded-[28px] border border-slate-200/80 bg-white/72 p-4 shadow-lg shadow-slate-900/[0.04] backdrop-blur xl:block"
        aria-hidden="true"
      >
        <div className="mb-4 flex items-center justify-between border-b border-dashed border-slate-300 pb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Today
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              Active schedule
            </p>
          </div>
          <CalendarDays className="size-5 text-primary" />
        </div>

        <div className="space-y-3">
          {eventRows.map((row) => (
            <div
              key={row.title}
              className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-3"
            >
              <span className={`size-9 rounded-xl ${row.tone}`} />
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-slate-700">
                  {row.title}
                </span>
                <span className="mt-0.5 block text-[11px] text-slate-400">
                  {row.meta}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="pointer-events-none absolute right-[max(2rem,calc(50%-700px))] top-[28%] hidden w-56 rotate-[3deg] rounded-[24px] border border-slate-200/80 bg-white/72 p-4 shadow-md shadow-slate-900/[0.04] backdrop-blur xl:block"
        aria-hidden="true"
      >
        <div className="mb-4 flex items-center justify-between border-b border-dashed border-slate-300 pb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Access
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              Check-in pass
            </p>
          </div>
          <Ticket className="size-5 text-primary" />
        </div>

        <div className="space-y-2.5">
          <div className="h-2 w-32 rounded-full bg-primary/12" />
          <div className="h-2 w-20 rounded-full bg-[#10b981]/18" />
          <div className="h-2 w-28 rounded-full bg-slate-200/90" />
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-[17%] right-[max(3rem,calc(50%-760px))] hidden rotate-[-4deg] items-center gap-4 rounded-[26px] border border-slate-200/80 bg-white/72 p-4 shadow-lg shadow-slate-900/[0.04] backdrop-blur xl:flex"
        aria-hidden="true"
      >
        <div className="grid size-20 grid-cols-3 gap-1 rounded-2xl border border-slate-200/80 bg-white/85 p-2.5">
          {Array.from({ length: 9 }).map((_, index) => (
            <span
              key={index}
              className={
                index % 2 === 0
                  ? "rounded-[3px] bg-primary/25"
                  : "rounded-[3px] bg-slate-200/90"
              }
            />
          ))}
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Fast lane
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#047857]">
            <CheckCircle2 className="size-3" />
            Ready
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-7 left-7 hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shadow-sm shadow-slate-900/5 backdrop-blur md:flex">
        <QrCode className="size-4 text-primary" />
        Scan pass
      </div>

      <div className="relative z-10 w-full max-w-[430px]">{children}</div>
    </main>
  );
}
