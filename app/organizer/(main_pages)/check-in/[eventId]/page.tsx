"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Keyboard,
  Loader2,
  MapPin,
  QrCode,
  TicketCheck,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EventService,
  OrganizerApiRequestError,
} from "@/services/event-service";
import type { Event } from "@/types/event";
import type {
  OrganizerCheckInHistoryItem,
  OrganizerValidatedTicket,
} from "@/types/organizer-ticketing";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const fmtDate = (iso?: string) => {
  if (!iso) return "-";
  try {
    return format(parseISO(iso), "dd MMM yyyy · HH:mm", { locale: idLocale });
  } catch {
    return "-";
  }
};

const timeAgo = (iso: string) => {
  try {
    return formatDistanceToNow(parseISO(iso), {
      addSuffix: true,
      locale: idLocale,
    });
  } catch {
    return "-";
  }
};

const errMsg = (err: unknown, fb: string) => {
  if (err instanceof OrganizerApiRequestError) return err.message || fb;
  if (err instanceof Error) return err.message;
  return fb;
};

/* ─── QR Scanner hook ─────────────────────────────────────────────────────── */

function useQrScanner(
  active: boolean,
  onScan: (text: string) => void,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    if (!active || !containerRef.current) return;

    let stopped = false;

    const boot = async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (stopped) return;

      const scanner = new Html5Qrcode("qr-reader", { verbose: false });
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 280, height: 280 },
            aspectRatio: 1,
          },
          (decoded) => {
            onScanRef.current(decoded);
          },
          () => { /* ignore errors while scanning */ },
        );
      } catch (err) {
        console.error("QR scanner start failed:", err);
        toast.error("Tidak dapat mengakses kamera. Pastikan izin kamera diaktifkan.");
      }
    };

    const bootPromise = boot();

    return () => {
      stopped = true;
      bootPromise.finally(() => {
        const s = scannerRef.current;
        if (s) {
          scannerRef.current = null;
          try {
            if (s.isScanning) {
              s.stop()
                .then(() => s.clear())
                .catch(() => s.clear());
            } else {
              s.clear();
            }
          } catch (e) {
            s.clear();
          }
        }
      });
    };
  }, [active]);

  return containerRef;
}

/* ─── Types ───────────────────────────────────────────────────────────────── */

type ValidationMode = "qr" | "manual";

type TabKey = "validate" | "history" | "participants";

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function CheckInDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();

  // Event
  const [event, setEvent] = useState<Event | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  // Tabs
  const [tab, setTab] = useState<TabKey>("validate");

  // Validation
  const [mode, setMode] = useState<ValidationMode>("qr");
  const [manualCode, setManualCode] = useState("");
  const [validating, setValidating] = useState(false);
  const [lastResult, setLastResult] = useState<{
    ok: boolean;
    ticket?: OrganizerValidatedTicket;
    error?: string;
  } | null>(null);

  // History sidebar
  const [history, setHistory] = useState<OrganizerCheckInHistoryItem[]>([]);
  const [totalCheckedIn, setTotalCheckedIn] = useState(0);

  /* ── Fetch event ── */
  useEffect(() => {
    if (!eventId) return;
    let active = true;
    (async () => {
      try {
        const data = await EventService.getOrganizerEventDetail(eventId);
        if (active) setEvent(data);
      } catch (err) {
        toast.error(errMsg(err, "Gagal memuat detail event."));
      } finally {
        if (active) setLoadingEvent(false);
      }
    })();
    return () => { active = false; };
  }, [eventId]);

  /* ── Fetch history ── */
  const refreshHistory = useCallback(async () => {
    if (!eventId) return;
    try {
      const data = await EventService.getOrganizerCheckInHistory(eventId, {
        page: 1,
        limit: 10,
      });
      setHistory(data.items ?? []);
      setTotalCheckedIn(data.pagination.total_items);
    } catch { /* silent */ }
  }, [eventId]);

  useEffect(() => {
    void refreshHistory();
  }, [refreshHistory]);

  /* ── Validate ── */
  const handleValidate = useCallback(
    async (code: string, method: ValidationMode) => {
      if (!eventId || !code.trim()) return;
      setValidating(true);
      setLastResult(null);
      try {
        const payload: import("@/types/organizer-ticketing").OrganizerValidateTicketPayload =
          method === "qr"
            ? {
                validation_method: "qr",
                qr_token: code.trim(),
                checkpoint_name: "Gate A",
                device_label: "Scanner Device 1",
              }
            : {
                validation_method: "manual",
                manual_code: code.trim(),
                checkpoint_name: "Gate A",
                device_label: "Scanner Device 1",
              };

        const ticket = await EventService.validateOrganizerTicket(eventId, payload);
        setLastResult({ ok: true, ticket });
        setManualCode("");
        void refreshHistory();
      } catch (err) {
        setLastResult({ ok: false, error: errMsg(err, "Validasi tiket gagal.") });
      } finally {
        setValidating(false);
      }
    },
    [eventId, refreshHistory],
  );

  /* ── QR scanner ── */
  const qrContainerRef = useQrScanner(
    mode === "qr" && tab === "validate",
    (decoded) => {
      if (!validating) {
        void handleValidate(decoded, "qr");
      }
    },
  );

  /* ── Derived ── */
  const totalSold = useMemo(
    () =>
      event?.ticket_categories?.reduce((s, c) => s + (c.booked ?? 0), 0) ??
      event?.total_sold ?? 0,
    [event],
  );

  /* ── Loading ── */
  if (loadingEvent) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-4 px-6 pb-8">
        <BackButton />
        <p className="text-sm text-muted-foreground">Event tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-6 pb-8">
      {/* ── Header ── */}
      <div className="space-y-3">
        <BackButton />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {event.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5 opacity-60" />
                {fmtDate(event.event_start_date)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 opacity-60" />
                {event.is_online
                  ? "Online"
                  : event.address?.title || event.address?.city || "-"}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-baseline gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5">
            <span className="text-xs text-muted-foreground">Total Hadir</span>
            <span className="text-xl font-bold tabular-nums text-primary">
              {totalCheckedIn.toLocaleString("id-ID")}
            </span>
            <span className="text-sm text-muted-foreground">
              / {totalSold.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-border">
        {([
          { key: "validate" as const, label: "Validasi Tiket" },
          { key: "history" as const, label: "Riwayat Check-In" },
          { key: "participants" as const, label: "Partisipan" },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "relative px-4 py-2.5 text-sm font-medium transition-colors",
              tab === key
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
            {tab === key && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {tab === "validate" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          {/* Left – scanner / manual */}
          <div className="space-y-4">
            {/* Mode toggle */}
            <div className="inline-flex rounded-full border border-border bg-muted/30 p-0.5">
              {([
                { key: "qr" as const, icon: QrCode, label: "Scan QR" },
                { key: "manual" as const, icon: Keyboard, label: "Manual" },
              ]).map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => {
                    setMode(key);
                    setLastResult(null);
                    setManualCode("");
                  }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all",
                    mode === key
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Scanner / input card */}
            <div className="rounded-2xl border border-border bg-card p-5">
              {mode === "qr" ? (
                <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground">
                    Arahkan kamera ke QR Code tiket
                  </label>
                  <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-xl border border-border bg-black">
                    <div
                      id="qr-reader"
                      ref={qrContainerRef}
                      className="aspect-square w-full [&_video]:!object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground">
                    Masukkan kode tiket
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="Contoh: TNS-8821-XQ"
                      className="h-10 flex-1 rounded-full bg-background pl-4 font-mono text-sm tracking-wider"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void handleValidate(manualCode, "manual");
                      }}
                    />
                    <Button
                      className="h-10 gap-1.5 rounded-full px-5 text-xs font-semibold"
                      disabled={validating || !manualCode.trim()}
                      onClick={() => void handleValidate(manualCode, "manual")}
                    >
                      {validating ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <TicketCheck className="size-3.5" />
                      )}
                      Validasi
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Result card */}
            {lastResult && <ResultCard result={lastResult} />}
          </div>

          {/* Right – recent history */}
          <HistorySidebar history={history} total={totalCheckedIn} />
        </div>
      )}

      {tab === "history" && (
        <FullHistory eventId={eventId} />
      )}

      {tab === "participants" && (
        <ParticipantsTab eventId={eventId} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* Sub-components                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */

function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/organizer/check-in")}
      className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" /> Kembali
    </button>
  );
}

/* ── Result card ── */

function ResultCard({
  result,
}: {
  result: { ok: boolean; ticket?: OrganizerValidatedTicket; error?: string };
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-4",
        result.ok
          ? "border-success/30 bg-success-light"
          : "border-danger/30 bg-danger-light",
      )}
    >
      {result.ok ? (
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
      ) : (
        <XCircle className="mt-0.5 size-5 shrink-0 text-danger" />
      )}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-semibold",
            result.ok ? "text-success" : "text-danger",
          )}
        >
          {result.ok ? "Check-In Berhasil!" : "Validasi Gagal"}
        </p>
        {result.ok && result.ticket ? (
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-muted-foreground">
            <Detail label="Nama" value={result.ticket.participant_name} />
            <Detail label="No. Tiket" value={result.ticket.ticket_number} mono />
            <Detail label="Metode" value={result.ticket.validation_method} capitalize />
            <Detail label="Waktu" value={fmtDate(result.ticket.checked_in_at)} />
          </div>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">{result.error}</p>
        )}
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  mono,
  capitalize: cap,
}: {
  label: string;
  value: string;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div>
      <span className="block text-[11px]">{label}</span>
      <span
        className={cn(
          "font-medium text-foreground",
          mono && "font-mono",
          cap && "capitalize",
        )}
      >
        {value}
      </span>
    </div>
  );
}

/* ── History sidebar ── */

function HistorySidebar({
  history,
  total,
}: {
  history: OrganizerCheckInHistoryItem[];
  total: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Riwayat Terbaru</h3>
        <span className="text-[11px] text-muted-foreground">{total} total</span>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 px-4 py-10 text-center">
          <Users className="size-5 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">Belum ada riwayat check-in.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {history.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {item.participant_name}
                </p>
                <p className="truncate font-mono text-[11px] text-muted-foreground">
                  {item.ticket_number}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <Badge
                  className={cn(
                    "mb-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    item.result === "success"
                      ? "border-success/20 bg-success-light text-success"
                      : "border-danger/20 bg-danger-light text-danger",
                  )}
                >
                  {item.result === "success" ? "✓ Valid" : "✗ Invalid"}
                </Badge>
                <p className="text-[11px] text-muted-foreground">{timeAgo(item.created_at)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Full history tab ── */

function FullHistory({ eventId }: { eventId: string }) {
  const [items, setItems] = useState<OrganizerCheckInHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPage = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const data = await EventService.getOrganizerCheckInHistory(eventId, {
          page: p,
          limit: 20,
        });
        setItems(data.items ?? []);
        setTotalPages(data.pagination.total_pages);
      } catch {
        toast.error("Gagal memuat riwayat check-in.");
      } finally {
        setLoading(false);
      }
    },
    [eventId],
  );

  useEffect(() => {
    void fetchPage(page);
  }, [fetchPage, page]);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
        <p className="text-sm font-medium text-foreground">Belum ada riwayat</p>
        <p className="text-xs text-muted-foreground">
          Riwayat check-in akan muncul setelah tiket divalidasi.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20 text-left text-xs font-semibold text-muted-foreground">
              <th className="px-4 py-3">Partisipan</th>
              <th className="px-4 py-3">No. Tiket</th>
              <th className="px-4 py-3">Metode</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Waktu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-muted/10">
                <td className="px-4 py-3 font-medium text-foreground">
                  {item.participant_name}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {item.ticket_number}
                </td>
                <td className="px-4 py-3 capitalize text-muted-foreground">
                  {item.validation_method}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      item.result === "success"
                        ? "border-success/20 bg-success-light text-success"
                        : "border-danger/20 bg-danger-light text-danger",
                    )}
                  >
                    {item.result === "success" ? "Valid" : "Invalid"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {fmtDate(item.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-full text-xs"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Sebelumnya
          </Button>
          <span className="text-xs text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-full text-xs"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Selanjutnya
          </Button>
        </div>
      )}
    </div>
  );
}

/* ── Participants tab ── */

function ParticipantsTab({ eventId }: { eventId: string }) {
  const [items, setItems] = useState<
    import("@/types/organizer-ticketing").OrganizerParticipantItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPage = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const data = await EventService.getOrganizerParticipants(eventId, {
          page: p,
          limit: 20,
        });
        setItems(data.items ?? []);
        setTotalPages(data.pagination.total_pages);
      } catch {
        toast.error("Gagal memuat daftar partisipan.");
      } finally {
        setLoading(false);
      }
    },
    [eventId],
  );

  useEffect(() => {
    void fetchPage(page);
  }, [fetchPage, page]);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
        <p className="text-sm font-medium text-foreground">Belum ada partisipan</p>
        <p className="text-xs text-muted-foreground">
          Partisipan akan muncul setelah tiket terjual.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20 text-left text-xs font-semibold text-muted-foreground">
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">No. Tiket</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={item.ticket_id} className="transition-colors hover:bg-muted/10">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{item.participant_name}</p>
                  <p className="text-xs text-muted-foreground">{item.participant_email}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {item.ticket_number}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {item.ticket_category_name}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      item.attendance_state === "checked_in"
                        ? "border-success/20 bg-success-light text-success"
                        : "border-border bg-muted/30 text-muted-foreground",
                    )}
                  >
                    {item.attendance_state === "checked_in" ? "Checked In" : "Belum Hadir"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-full text-xs"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Sebelumnya
          </Button>
          <span className="text-xs text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-full text-xs"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Selanjutnya
          </Button>
        </div>
      )}
    </div>
  );
}
