"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    useParams,
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
    ArrowLeft,
    CalendarDays,
    Camera,
    CameraOff,
    CheckCircle2,
    ExternalLink,
    History,
    Keyboard,
    Loader2,
    MapPin,
    QrCode,
    ScanLine,
    Ticket,
    TicketCheck,
    UserCheck,
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
        return format(parseISO(iso), "dd MMM yyyy · HH:mm", {
            locale: idLocale,
        });
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

const cameraErrMsg = (err: unknown) => {
    const name =
        typeof err === "object" && err !== null && "name" in err
            ? String((err as { name?: unknown }).name)
            : "";
    const detail =
        err instanceof Error
            ? `${err.name} ${err.message}`
            : typeof err === "string"
              ? err
              : "";
    const normalized = `${name} ${detail}`.toLowerCase();

    if (typeof window !== "undefined" && !window.isSecureContext) {
        return "Kamera hanya bisa digunakan di HTTPS atau localhost.";
    }
    if (
        normalized.includes("notallowed") ||
        normalized.includes("permissiondenied") ||
        normalized.includes("permission denied")
    ) {
        return "Izin kamera ditolak. Aktifkan izin kamera di browser lalu coba lagi.";
    }
    if (
        normalized.includes("notfound") ||
        normalized.includes("devicesnotfound")
    ) {
        return "Kamera tidak ditemukan pada perangkat ini.";
    }
    if (
        normalized.includes("notreadable") ||
        normalized.includes("trackstart")
    ) {
        return "Kamera sedang digunakan aplikasi lain atau tidak dapat dibuka.";
    }

    return "Tidak dapat mengakses kamera. Pastikan izin kamera diaktifkan.";
};

function PageSurface({ children }: { children: React.ReactNode }) {
    return (
        <main className="relative min-h-[calc(100vh-136px)] overflow-hidden bg-[#f9fafb] px-4 py-6 md:-mx-8 md:px-8">
            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                    opacity: 0.16,
                }}
            />
            <svg
                className="pointer-events-none absolute inset-0 h-full w-full text-primary"
                viewBox="0 0 1440 640"
                preserveAspectRatio="none"
                fill="none"
                aria-hidden="true"
            >
                <path
                    d="M98 448C254 316 398 494 544 354C684 220 804 318 966 206C1108 108 1210 218 1368 112"
                    stroke="currentColor"
                    strokeOpacity="0.07"
                    strokeWidth="2"
                />
                <path
                    d="M124 184C286 246 410 108 568 176C710 238 816 146 970 214C1118 280 1222 386 1366 318"
                    stroke="#10b981"
                    strokeOpacity="0.055"
                    strokeWidth="2"
                />
            </svg>
            <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5">
                {children}
            </div>
        </main>
    );
}

function HeaderGraphic() {
    return (
        <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-80 overflow-hidden text-primary md:block">
            <svg
                viewBox="0 0 320 180"
                className="h-full w-full"
                fill="none"
                aria-hidden="true"
            >
                <path
                    d="M86 42H190C204 42 216 54 216 68V142"
                    stroke="currentColor"
                    strokeOpacity="0.08"
                    strokeWidth="18"
                    strokeLinecap="round"
                />
                <rect
                    x="224"
                    y="24"
                    width="54"
                    height="54"
                    rx="16"
                    fill="currentColor"
                    fillOpacity="0.08"
                />
                <rect
                    x="239"
                    y="39"
                    width="9"
                    height="9"
                    rx="2"
                    fill="currentColor"
                    fillOpacity="0.22"
                />
                <rect
                    x="254"
                    y="39"
                    width="9"
                    height="9"
                    rx="2"
                    fill="currentColor"
                    fillOpacity="0.22"
                />
                <rect
                    x="239"
                    y="54"
                    width="9"
                    height="9"
                    rx="2"
                    fill="currentColor"
                    fillOpacity="0.22"
                />
                <rect
                    x="254"
                    y="54"
                    width="9"
                    height="9"
                    rx="2"
                    fill="#10b981"
                    fillOpacity="0.16"
                />
            </svg>
        </div>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
    accent = false,
}: {
    icon: typeof Ticket;
    label: string;
    value: string;
    accent?: boolean;
}) {
    return (
        <div
            className={cn(
                "rounded-xl border px-4 py-3",
                accent
                    ? "border-primary/10 bg-primary-light/70"
                    : "border-slate-200/80 bg-slate-50/80",
            )}
        >
            <div
                className={cn(
                    "flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider",
                    accent ? "text-primary" : "text-slate-500",
                )}
            >
                <Icon className="h-3.5 w-3.5" />
                {label}
            </div>
            <p
                className={cn(
                    "mt-1 text-2xl font-semibold leading-none tabular-nums",
                    accent ? "text-primary" : "text-slate-950",
                )}
            >
                {value}
            </p>
        </div>
    );
}

/* ─── QR Scanner hook ─────────────────────────────────────────────────────── */

function useQrScanner(active: boolean, onScan: (text: string) => void) {
    const containerRef = useRef<HTMLDivElement>(null);
    const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
    const onScanRef = useRef(onScan);
    onScanRef.current = onScan;
    const lastScanTimeRef = useRef<number>(0);
    const [cameraError, setCameraError] = useState<string | null>(null);

    useEffect(() => {
        if (!active) {
            setCameraError(null);
            return;
        }
        if (!containerRef.current) return;

        let stopped = false;
        setCameraError(null);

        const boot = async () => {
            const { Html5Qrcode } = await import("html5-qrcode");
            if (stopped) return;

            const scanner = new Html5Qrcode("qr-reader", { verbose: false });
            scannerRef.current = scanner;

            try {
                await scanner.start(
                    { facingMode: "environment" },
                    {
                        fps: 15,
                        qrbox: (viewfinderWidth, viewfinderHeight) => {
                            const shortestSide = Math.min(
                                viewfinderWidth,
                                viewfinderHeight,
                            );
                            const size = Math.min(
                                Math.floor(shortestSide * 0.82),
                                520,
                            );

                            return {
                                width: size,
                                height: size,
                            };
                        },
                        aspectRatio: 1,
                    },
                    (decoded) => {
                        const now = Date.now();
                        if (now - lastScanTimeRef.current > 1500) {
                            lastScanTimeRef.current = now;
                            onScanRef.current(decoded);
                        }
                    },
                    () => {
                        /* ignore errors while scanning */
                    },
                );
            } catch (err) {
                console.error("QR scanner start failed:", err);
                const message = cameraErrMsg(err);
                setCameraError(message);
                toast.error(message, { id: "qr-camera-error", duration: 5000 });
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
                    } catch {
                        s.clear();
                    }
                }
            });
        };
    }, [active]);

    return { containerRef, cameraError };
}

/* ─── Types ───────────────────────────────────────────────────────────────── */

const CHECK_IN_BROADCAST_CHANNEL = "kumpulin-check-in";

type ValidationMode = "qr" | "manual";
type TabKey = "validate" | "history" | "participants";

type CheckInBroadcastMessage = {
    type: "ticket-validated";
    eventId: string;
};

type ScannerFeedback = {
    status: "checking" | "success" | "error";
    title: string;
    message: string;
};

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function CheckInDetailPage() {
    const { eventId } = useParams<{ eventId: string }>();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const scannerOnly = searchParams.get("scanner") === "1";
    const scannerTabHref = `${pathname}?scanner=1`;

    // Event
    const [event, setEvent] = useState<Event | null>(null);
    const [loadingEvent, setLoadingEvent] = useState(true);

    // Tabs
    const [tab, setTab] = useState<TabKey>("validate");

    // Validation
    const [mode, setMode] = useState<ValidationMode>("qr");
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [manualCode, setManualCode] = useState("");
    const [validating, setValidating] = useState(false);
    const [lastResult, setLastResult] = useState<{
        ok: boolean;
        ticket?: OrganizerValidatedTicket;
        error?: string;
    } | null>(null);
    const [scannerFeedback, setScannerFeedback] =
        useState<ScannerFeedback | null>(null);
    const scannerFeedbackTimeoutRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null);

    // History sidebar
    const [history, setHistory] = useState<OrganizerCheckInHistoryItem[]>([]);
    const [totalCheckedIn, setTotalCheckedIn] = useState(0);

    /* ── Fetch event ── */
    useEffect(() => {
        if (!eventId) return;
        let active = true;
        (async () => {
            try {
                const data =
                    await EventService.getOrganizerEventDetail(eventId);
                if (active) setEvent(data);
            } catch (err) {
                toast.error(errMsg(err, "Gagal memuat detail event."));
            } finally {
                if (active) setLoadingEvent(false);
            }
        })();
        return () => {
            active = false;
        };
    }, [eventId]);

    /* ── Fetch history ── */
    const refreshHistory = useCallback(async () => {
        if (!eventId) return;
        try {
            const data = await EventService.getOrganizerCheckInHistory(
                eventId,
                {
                    page: 1,
                    limit: 10,
                },
            );
            setHistory(data.items ?? []);
            setTotalCheckedIn(data.pagination.total_items);
        } catch {
            /* silent */
        }
    }, [eventId]);

    useEffect(() => {
        void refreshHistory();
    }, [refreshHistory]);

    const broadcastTicketValidated = useCallback(() => {
        if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
            return;
        }

        const channel = new BroadcastChannel(CHECK_IN_BROADCAST_CHANNEL);
        channel.postMessage({
            type: "ticket-validated",
            eventId,
        } satisfies CheckInBroadcastMessage);
        channel.close();
    }, [eventId]);

    useEffect(() => {
        if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
            return;
        }

        const channel = new BroadcastChannel(CHECK_IN_BROADCAST_CHANNEL);
        channel.onmessage = (event: MessageEvent<CheckInBroadcastMessage>) => {
            if (
                event.data?.type === "ticket-validated" &&
                event.data.eventId === eventId
            ) {
                void refreshHistory();
            }
        };

        return () => {
            channel.close();
        };
    }, [eventId, refreshHistory]);

    const handleOpenScannerPopup = useCallback(() => {
        const width = Math.min(1600, window.screen.availWidth - 64);
        const height = Math.min(920, window.screen.availHeight - 64);
        const left = Math.max((window.screen.width - width) / 2, 0);
        const top = Math.max((window.screen.height - height) / 2, 0);
        const popup = window.open(
            scannerTabHref,
            "kumpulin-check-in-scanner",
            [
                "popup=yes",
                `width=${width}`,
                `height=${height}`,
                `left=${left}`,
                `top=${top}`,
                "resizable=yes",
                "scrollbars=yes",
            ].join(","),
        );

        if (!popup) {
            toast.error(
                "Browser memblokir pop-up scanner. Izinkan pop-up lalu coba lagi.",
                {
                    id: "scanner-popup-open-failed",
                    duration: 5000,
                },
            );
            return;
        }

        popup.opener = null;
        popup.focus();
        setCameraEnabled(false);
        setLastResult(null);
        setScannerFeedback(null);
    }, [scannerTabHref]);

    /* ── Validate ── */
    const showScannerFeedback = useCallback(
        (feedback: ScannerFeedback, autoHide = true) => {
            if (scannerFeedbackTimeoutRef.current) {
                clearTimeout(scannerFeedbackTimeoutRef.current);
                scannerFeedbackTimeoutRef.current = null;
            }

            setScannerFeedback(feedback);

            if (autoHide) {
                scannerFeedbackTimeoutRef.current = setTimeout(() => {
                    setScannerFeedback(null);
                    scannerFeedbackTimeoutRef.current = null;
                }, feedback.status === "success" ? 2200 : 2600);
            }
        },
        [],
    );

    useEffect(() => {
        return () => {
            if (scannerFeedbackTimeoutRef.current) {
                clearTimeout(scannerFeedbackTimeoutRef.current);
            }
        };
    }, []);

    const handleValidate = useCallback(
        async (code: string, method: ValidationMode) => {
            if (!eventId || !code.trim()) return;
            setValidating(true);
            setLastResult(null);
            if (method === "qr") {
                showScannerFeedback(
                    {
                        status: "checking",
                        title: "Memvalidasi tiket",
                        message: "QR terbaca. Mencocokkan data tiket...",
                    },
                    false,
                );
            }
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

                const ticket = await EventService.validateOrganizerTicket(
                    eventId,
                    payload,
                );
                setLastResult({ ok: true, ticket });
                setManualCode("");
                if (method === "qr") {
                    showScannerFeedback({
                        status: "success",
                        title: "Check-in berhasil",
                        message: `${ticket.participant_name} - ${ticket.ticket_number}`,
                    });
                }
                void refreshHistory();
                broadcastTicketValidated();
            } catch (err) {
                const message = errMsg(err, "Validasi tiket gagal.");
                if (method === "qr") {
                    toast.error(message, {
                        id: "qr-validation-error",
                        duration: 5000,
                    });
                    showScannerFeedback({
                        status: "error",
                        title: "Validasi gagal",
                        message,
                    });
                } else {
                    toast.error(message, {
                        id: "manual-validation-error",
                        duration: 5000,
                    });
                }
                setLastResult({ ok: false, error: message });
            } finally {
                setValidating(false);
            }
        },
        [broadcastTicketValidated, eventId, refreshHistory, showScannerFeedback],
    );

    /* ── QR scanner ── */
    const { containerRef: qrContainerRef, cameraError } = useQrScanner(
        mode === "qr" && (tab === "validate" || scannerOnly) && cameraEnabled,
        (decoded) => {
            if (!validating) {
                void handleValidate(decoded, "qr");
            }
        },
    );

    /* ── Derived ── */
    const totalSold = useMemo(
        () =>
            event?.ticket_categories?.reduce(
                (s, c) => s + (c.booked ?? 0),
                0,
            ) ??
            event?.total_sold ??
            0,
        [event],
    );
    const pendingCheckIn = Math.max(totalSold - totalCheckedIn, 0);

    /* ── Loading ── */
    if (loadingEvent) {
        return (
            <PageSurface>
                <div className="flex min-h-[calc(100vh-196px)] items-center justify-center">
                    <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm shadow-slate-900/5">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                </div>
            </PageSurface>
        );
    }

    if (!event) {
        return (
            <PageSurface>
                <section className="relative overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm shadow-slate-900/5">
                    <HeaderGraphic />
                    <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                        <QrCode className="h-7 w-7" strokeWidth={2.2} />
                    </div>
                    <h1 className="relative mt-5 text-xl font-semibold text-slate-950">
                        Event tidak ditemukan
                    </h1>
                    <p className="relative mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                        Event ini tidak tersedia atau Anda tidak memiliki akses
                        untuk mengelolanya.
                    </p>
                    <div className="relative mt-6 flex justify-center">
                        <BackButton />
                    </div>
                </section>
            </PageSurface>
        );
    }

    if (scannerOnly) {
        return (
            <main className="h-screen overflow-hidden bg-[#f9fafb] px-4 py-4">
                <div className="mx-auto grid h-full w-full max-w-[1600px] grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_450px]">
                    <section className="flex min-h-0 flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                                    Scanner check-in
                                </p>
                                <h1 className="mt-1 truncate text-xl font-semibold text-slate-950">
                                    {event.title}
                                </h1>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 w-fit rounded-xl border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm shadow-slate-900/5 hover:border-primary/30 hover:text-primary"
                                onClick={() => {
                                    setCameraEnabled((enabled) => !enabled);
                                    setLastResult(null);
                                    setScannerFeedback(null);
                                }}
                            >
                                {cameraEnabled ? (
                                    <CameraOff className="h-4 w-4" />
                                ) : (
                                    <Camera className="h-4 w-4" />
                                )}
                                {cameraEnabled ? "Tutup kamera" : "Buka kamera"}
                            </Button>
                        </div>

                        <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-900/10 bg-slate-950 shadow-md shadow-slate-900/10">
                            <div
                                id="qr-reader"
                                ref={qrContainerRef}
                                className="h-full min-h-full w-full [&_video]:h-full! [&_video]:object-cover!"
                            />
                            <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-full border border-white/10 bg-slate-950/60 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-slate-950/20 backdrop-blur">
                                Arahkan QR ke area scan
                            </div>
                            {!cameraEnabled && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950/90 px-6 text-center">
                                    <CameraOff className="h-10 w-10 text-slate-300" />
                                    <div>
                                        <p className="text-sm font-semibold text-white">
                                            Kamera ditutup
                                        </p>
                                        <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-300">
                                            Buka kamera untuk mulai scan QR
                                            lagi.
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-9 rounded-xl border-white/20 bg-white/10 px-4 text-xs font-semibold text-white hover:bg-white/15 hover:text-white"
                                        onClick={() => setCameraEnabled(true)}
                                    >
                                        <Camera className="h-4 w-4" />
                                        Buka kamera
                                    </Button>
                                </div>
                            )}
                            {cameraEnabled && cameraError && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950/90 px-6 text-center">
                                    <XCircle className="h-10 w-10 text-danger" />
                                    <div>
                                        <p className="text-sm font-semibold text-white">
                                            Kamera tidak tersedia
                                        </p>
                                        <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-300">
                                            {cameraError}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {cameraEnabled && !cameraError && scannerFeedback && (
                                <ScannerFeedbackOverlay feedback={scannerFeedback} />
                            )}
                            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
                            <div className="pointer-events-none absolute inset-8 rounded-2xl border border-white/15" />
                            <div className="pointer-events-none absolute left-8 top-8 h-12 w-12 rounded-tl-2xl border-l-4 border-t-4 border-primary" />
                            <div className="pointer-events-none absolute right-8 top-8 h-12 w-12 rounded-tr-2xl border-r-4 border-t-4 border-primary" />
                            <div className="pointer-events-none absolute bottom-8 left-8 h-12 w-12 rounded-bl-2xl border-b-4 border-l-4 border-primary" />
                            <div className="pointer-events-none absolute bottom-8 right-8 h-12 w-12 rounded-br-2xl border-b-4 border-r-4 border-primary" />
                        </div>

                        {lastResult && (
                            <div className="mt-4">
                                <ResultCard result={lastResult} />
                            </div>
                        )}
                    </section>

                    <HistorySidebar history={history} total={totalCheckedIn} />
                </div>
            </main>
        );
    }

    return (
        <PageSurface>
            {/* ── Header ── */}
            <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5">
                <HeaderGraphic />
                <div className="relative space-y-5">
                    <BackButton />

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="min-w-0 max-w-3xl">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                                Check-in workspace
                            </p>
                            <h1 className="mt-2 text-2xl font-bold leading-[1.12] text-slate-950 md:text-3xl">
                                {event.title}
                            </h1>
                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                                <span className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 text-slate-400" />
                                    {fmtDate(event.event_start_date)}
                                </span>
                                <span className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-slate-400" />
                                    {event.is_online
                                        ? "Online"
                                        : event.address?.title ||
                                          event.address?.city ||
                                          "-"}
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-3 lg:w-130">
                            <StatCard
                                icon={Ticket}
                                label="Tiket"
                                value={totalSold.toLocaleString("id-ID")}
                            />
                            <StatCard
                                icon={UserCheck}
                                label="Hadir"
                                value={totalCheckedIn.toLocaleString("id-ID")}
                                accent
                            />
                            <StatCard
                                icon={Users}
                                label="Belum"
                                value={pendingCheckIn.toLocaleString("id-ID")}
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Tabs ── */}
            <div className="flex overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-1 shadow-sm shadow-slate-900/5">
                {[
                    {
                        key: "validate" as const,
                        label: "Validasi Tiket",
                        icon: ScanLine,
                    },
                    {
                        key: "history" as const,
                        label: "Riwayat Check-In",
                        icon: History,
                    },
                    {
                        key: "participants" as const,
                        label: "Partisipan",
                        icon: Users,
                    },
                ].map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={cn(
                            "flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-medium transition-all",
                            tab === key
                                ? "bg-primary-light text-primary shadow-sm shadow-primary/5"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* ── Tab content ── */}
            {tab === "validate" && (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
                    {/* Left – scanner / manual */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-5">
                        {/* Mode toggle */}
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-950">
                                    Validasi tiket
                                </h2>
                                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                                    Gunakan kamera untuk QR atau masukkan kode
                                    tiket secara manual.
                                </p>
                            </div>

                            <div className="inline-flex w-fit rounded-xl border border-slate-200 bg-slate-50 p-1">
                                {[
                                    {
                                        key: "qr" as const,
                                        icon: QrCode,
                                        label: "Scan QR",
                                    },
                                    {
                                        key: "manual" as const,
                                        icon: Keyboard,
                                        label: "Manual",
                                    },
                                ].map(({ key, icon: Icon, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            setMode(key);
                                            setLastResult(null);
                                            setScannerFeedback(null);
                                            setManualCode("");
                                        }}
                                        className={cn(
                                            "flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-medium transition-all",
                                            mode === key
                                                ? "bg-white text-slate-950 shadow-sm shadow-slate-900/5"
                                                : "text-slate-500 hover:text-slate-900",
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Scanner / input card */}
                        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                            {mode === "qr" ? (
                                <div className="space-y-3">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                            Arahkan kamera ke QR Code tiket
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-9 rounded-xl border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm shadow-slate-900/5 hover:border-primary/30 hover:text-primary"
                                                onClick={() => {
                                                    setCameraEnabled(
                                                        (enabled) => !enabled,
                                                    );
                                                    setLastResult(null);
                                                    setScannerFeedback(null);
                                                }}
                                            >
                                                {cameraEnabled ? (
                                                    <CameraOff className="h-4 w-4" />
                                                ) : (
                                                    <Camera className="h-4 w-4" />
                                                )}
                                                {cameraEnabled
                                                    ? "Tutup kamera"
                                                    : "Buka kamera"}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-9 rounded-xl border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm shadow-slate-900/5 hover:border-primary/30 hover:text-primary"
                                                onClick={handleOpenScannerPopup}
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                Buka pop-up
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-900/10 bg-slate-950 shadow-md shadow-slate-900/10">
                                        <div
                                            id="qr-reader"
                                            ref={qrContainerRef}
                                            className="aspect-square w-full [&_video]:object-cover!"
                                        />
                                        {!cameraEnabled && (
                                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950/90 px-6 text-center">
                                                <CameraOff className="h-9 w-9 text-slate-300" />
                                                <div>
                                                    <p className="text-sm font-semibold text-white">
                                                        Kamera ditutup
                                                    </p>
                                                    <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-300">
                                                        Buka kamera untuk mulai
                                                        scan QR lagi.
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-9 rounded-xl border-white/20 bg-white/10 px-4 text-xs font-semibold text-white hover:bg-white/15 hover:text-white"
                                                    onClick={() =>
                                                        setCameraEnabled(true)
                                                    }
                                                >
                                                    <Camera className="h-4 w-4" />
                                                    Buka kamera
                                                </Button>
                                            </div>
                                        )}
                                        {cameraEnabled && cameraError && (
                                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950/90 px-6 text-center">
                                                <XCircle className="h-9 w-9 text-danger" />
                                                <div>
                                                    <p className="text-sm font-semibold text-white">
                                                        Kamera tidak tersedia
                                                    </p>
                                                    <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-300">
                                                        {cameraError}
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-9 rounded-xl border-white/20 bg-white/10 px-4 text-xs font-semibold text-white hover:bg-white/15 hover:text-white"
                                                    onClick={() => {
                                                        setMode("manual");
                                                        setLastResult(null);
                                                        setScannerFeedback(null);
                                                    }}
                                                >
                                                    Gunakan manual
                                                </Button>
                                            </div>
                                        )}
                                        {cameraEnabled &&
                                            !cameraError &&
                                            scannerFeedback && (
                                                <ScannerFeedbackOverlay
                                                    feedback={scannerFeedback}
                                                />
                                            )}
                                        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
                                        <div className="pointer-events-none absolute inset-8 rounded-2xl border border-white/15" />
                                        <div className="pointer-events-none absolute left-8 top-8 h-10 w-10 rounded-tl-2xl border-l-4 border-t-4 border-primary" />
                                        <div className="pointer-events-none absolute right-8 top-8 h-10 w-10 rounded-tr-2xl border-r-4 border-t-4 border-primary" />
                                        <div className="pointer-events-none absolute bottom-8 left-8 h-10 w-10 rounded-bl-2xl border-b-4 border-l-4 border-primary" />
                                        <div className="pointer-events-none absolute bottom-8 right-8 h-10 w-10 rounded-br-2xl border-b-4 border-r-4 border-primary" />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                        Masukkan kode tiket
                                    </label>
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <Input
                                            value={manualCode}
                                            onChange={(e) =>
                                                setManualCode(e.target.value)
                                            }
                                            placeholder="Contoh: TNS-8821-XQ"
                                            className="h-11 flex-1 rounded-xl border-slate-200 bg-white pl-4 font-mono text-sm tracking-wider focus-visible:border-primary/40 focus-visible:ring-primary/20"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter")
                                                    void handleValidate(
                                                        manualCode,
                                                        "manual",
                                                    );
                                            }}
                                        />
                                        <Button
                                            className="h-11 gap-1.5 rounded-xl px-5 text-sm font-semibold"
                                            disabled={
                                                validating || !manualCode.trim()
                                            }
                                            onClick={() =>
                                                void handleValidate(
                                                    manualCode,
                                                    "manual",
                                                )
                                            }
                                        >
                                            {validating ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <TicketCheck className="h-4 w-4" />
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

            {tab === "history" && <FullHistory eventId={eventId} />}

            {tab === "participants" && <ParticipantsTab eventId={eventId} />}
        </PageSurface>
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
            className="flex w-fit items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm shadow-slate-900/5 transition-colors hover:border-primary/30 hover:text-primary"
        >
            <ArrowLeft className="h-4 w-4" /> Kembali
        </button>
    );
}

/* ── Result card ── */

function ScannerFeedbackOverlay({ feedback }: { feedback: ScannerFeedback }) {
    const isSuccess = feedback.status === "success";
    const isError = feedback.status === "error";
    const Icon = isSuccess ? CheckCircle2 : isError ? XCircle : Loader2;

    return (
        <div
            className={cn(
                "pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6 text-center backdrop-blur-[2px] animate-in fade-in duration-200",
                isSuccess && "bg-success/85",
                isError && "bg-danger/85",
                feedback.status === "checking" && "bg-slate-950/75",
            )}
        >
            <div
                className={cn(
                    "flex max-w-sm flex-col items-center rounded-2xl border border-white/20 bg-white/12 px-6 py-6 text-white shadow-xl shadow-slate-950/20 ring-1 ring-white/10 backdrop-blur-md",
                    "animate-in zoom-in-95 duration-200",
                )}
            >
                <div
                    className={cn(
                        "mb-4 flex h-18 w-18 items-center justify-center rounded-full bg-white text-slate-950 shadow-lg shadow-slate-950/20",
                        isSuccess && "text-success",
                        isError && "text-danger",
                        feedback.status === "checking" && "text-primary",
                    )}
                >
                    <Icon
                        className={cn(
                            "h-10 w-10",
                            feedback.status === "checking" && "animate-spin",
                        )}
                    />
                </div>
                <p className="text-xl font-semibold leading-tight">
                    {feedback.title}
                </p>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/85">
                    {feedback.message}
                </p>
            </div>
        </div>
    );
}

function ResultCard({
    result,
}: {
    result: { ok: boolean; ticket?: OrganizerValidatedTicket; error?: string };
}) {
    return (
        <div
            className={cn(
                "mt-4 flex items-start gap-3 rounded-2xl border p-4 shadow-sm",
                result.ok
                    ? "border-success/20 bg-success-light/80 shadow-success/5"
                    : "border-danger/20 bg-danger-light/80 shadow-danger/5",
            )}
        >
            {result.ok ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
            ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
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
                    <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                        <Detail
                            label="Nama"
                            value={result.ticket.participant_name}
                        />
                        <Detail
                            label="No. Tiket"
                            value={result.ticket.ticket_number}
                            mono
                        />
                        <Detail
                            label="Metode"
                            value={result.ticket.validation_method}
                            capitalize
                        />
                        <Detail
                            label="Waktu"
                            value={fmtDate(result.ticket.checked_in_at)}
                        />
                    </div>
                ) : (
                    <p className="mt-1 text-xs text-muted-foreground">
                        {result.error}
                    </p>
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
        <div className="rounded-xl border border-white/60 bg-white/60 px-3 py-2">
            <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-500">
                {label}
            </span>
            <span
                className={cn(
                    "mt-1 block font-medium text-slate-950",
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
        <aside className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
            <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-3">
                <div>
                    <h3 className="text-base font-semibold text-slate-950">
                        Riwayat terbaru
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                        10 aktivitas terakhir
                    </p>
                </div>
                <span className="rounded-full bg-primary-light px-2.5 py-1 text-[11px] font-semibold text-primary">
                    {total} total
                </span>
            </div>

            {history.length === 0 ? (
                <div className="flex flex-col items-center gap-1.5 px-4 py-10 text-center">
                    <History className="h-5 w-5 text-slate-400" />
                    <p className="text-xs text-slate-500">
                        Belum ada riwayat check-in.
                    </p>
                </div>
            ) : (
                <ul className="divide-y divide-slate-100">
                    {history.map((item) => (
                        <li
                            key={item.id}
                            className="flex items-center justify-between gap-3 px-4 py-3"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-950">
                                    {item.participant_name}
                                </p>
                                <p className="truncate font-mono text-[11px] text-slate-500">
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
                                    {item.result === "success"
                                        ? "Valid"
                                        : "Invalid"}
                                </Badge>
                                <p className="text-[11px] text-slate-500">
                                    {timeAgo(item.created_at)}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </aside>
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
                const data = await EventService.getOrganizerCheckInHistory(
                    eventId,
                    {
                        page: p,
                        limit: 20,
                    },
                );
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
            <div className="flex min-h-55 items-center justify-center rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm shadow-slate-900/5">
                <History className="h-7 w-7 text-slate-400" />
                <p className="mt-2 text-base font-semibold text-slate-950">
                    Belum ada riwayat
                </p>
                <p className="text-sm text-slate-500">
                    Riwayat check-in akan muncul setelah tiket divalidasi.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200/80 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">Partisipan</th>
                            <th className="px-4 py-3">No. Tiket</th>
                            <th className="px-4 py-3">Metode</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Waktu</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((item) => (
                            <tr
                                key={item.id}
                                className="transition-colors hover:bg-slate-50/70"
                            >
                                <td className="px-4 py-3 font-medium text-slate-950">
                                    {item.participant_name}
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                                    {item.ticket_number}
                                </td>
                                <td className="px-4 py-3 capitalize text-slate-600">
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
                                        {item.result === "success"
                                            ? "Valid"
                                            : "Invalid"}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-500">
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
                        className="h-9 rounded-xl border-slate-200 bg-white px-4 text-xs font-medium text-slate-600 shadow-sm shadow-slate-900/5 hover:border-primary/30 hover:text-primary"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Sebelumnya
                    </Button>
                    <span className="text-xs font-medium text-slate-500">
                        {page} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-xl border-slate-200 bg-white px-4 text-xs font-medium text-slate-600 shadow-sm shadow-slate-900/5 hover:border-primary/30 hover:text-primary"
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
                const data = await EventService.getOrganizerParticipants(
                    eventId,
                    {
                        page: p,
                        limit: 20,
                    },
                );
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
            <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm shadow-slate-900/5">
                <Users className="h-7 w-7 text-slate-400" />
                <p className="mt-2 text-base font-semibold text-slate-950">
                    Belum ada partisipan
                </p>
                <p className="text-sm text-slate-500">
                    Partisipan akan muncul setelah tiket terjual.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200/80 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">Nama</th>
                            <th className="px-4 py-3">No. Tiket</th>
                            <th className="px-4 py-3">Kategori</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((item) => (
                            <tr
                                key={item.ticket_id}
                                className="transition-colors hover:bg-slate-50/70"
                            >
                                <td className="px-4 py-3">
                                    <p className="font-medium text-slate-950">
                                        {item.participant_name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {item.participant_email}
                                    </p>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                                    {item.ticket_number}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {item.ticket_category_name}
                                </td>
                                <td className="px-4 py-3">
                                    <Badge
                                        className={cn(
                                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                            item.attendance_state ===
                                                "checked_in"
                                                ? "border-success/20 bg-success-light text-success"
                                                : "border-slate-200 bg-slate-100 text-slate-500",
                                        )}
                                    >
                                        {item.attendance_state === "checked_in"
                                            ? "Checked In"
                                            : "Belum Hadir"}
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
                        className="h-9 rounded-xl border-slate-200 bg-white px-4 text-xs font-medium text-slate-600 shadow-sm shadow-slate-900/5 hover:border-primary/30 hover:text-primary"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Sebelumnya
                    </Button>
                    <span className="text-xs font-medium text-slate-500">
                        {page} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-xl border-slate-200 bg-white px-4 text-xs font-medium text-slate-600 shadow-sm shadow-slate-900/5 hover:border-primary/30 hover:text-primary"
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
