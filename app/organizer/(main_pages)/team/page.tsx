"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import {
    AtSign,
    Loader2,
    MailPlus,
    ShieldCheck,
    Trash2,
    UserRoundPlus,
    UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { OrganizerTeamService } from "@/services/support-service";
import type { OrganizerTeamMember } from "@/types/support";

type InviteMode = "email" | "user_id";

type ApiErrorBody = {
    message?: string;
    errors?: Array<string | { message?: string }>;
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<ApiErrorBody>;
    const firstError = axiosError.response?.data?.errors?.[0];
    if (typeof firstError === "string") return firstError;
    if (firstError?.message) return firstError.message;
    return (
        axiosError.response?.data?.message ||
        (error instanceof Error ? error.message : fallback)
    );
};

const formatDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
};

const getMemberLabel = (member: OrganizerTeamMember) =>
    member.name ||
    member.email ||
    member.user_email ||
    (member.user_id ? `User ${member.user_id}` : "Support member");

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
            <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5">
                {children}
            </div>
        </main>
    );
}

export default function OrganizerTeamPage() {
    const [members, setMembers] = useState<OrganizerTeamMember[]>([]);
    const [inviteMode, setInviteMode] = useState<InviteMode>("email");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [revokingId, setRevokingId] = useState<string | null>(null);

    const supportMembers = useMemo(
        () => members.filter((member) => member.role === "support"),
        [members],
    );

    const activeSupportCount = useMemo(
        () =>
            supportMembers.filter((member) => member.status === "active")
                .length,
        [supportMembers],
    );

    const loadMembers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await OrganizerTeamService.listMembers();
            setMembers(data);
        } catch (error) {
            toast.error(
                getApiErrorMessage(
                    error,
                    "Gagal mengambil daftar support staff.",
                ),
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadMembers();
    }, [loadMembers]);

    const handleInviteModeChange = (mode: InviteMode) => {
        setInviteMode(mode);
        setEmail("");
    };

    const handleAddMember = async () => {
        const trimmedEmail = email.trim();

        if (inviteMode === "email" && !trimmedEmail) {
            toast.error("Isi email support member.");
            return;
        }

        const payload = { email: trimmedEmail };

        setSubmitting(true);
        try {
            await OrganizerTeamService.addSupportMember(payload);
            setEmail("");
            toast.success(
                "Support member added. Invitation email has been sent.",
            );
            await loadMembers();
        } catch (error) {
            toast.error(
                getApiErrorMessage(error, "Gagal menambahkan support member."),
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleRevoke = async (member: OrganizerTeamMember) => {
        if (
            !window.confirm(
                `Revoke support access for ${getMemberLabel(member)}?`,
            )
        ) {
            return;
        }

        setRevokingId(member.id);
        try {
            await OrganizerTeamService.revokeMember(member.id);
            toast.success("Support member access revoked.");
            await loadMembers();
        } catch (error) {
            toast.error(
                getApiErrorMessage(
                    error,
                    "Gagal mencabut akses support member.",
                ),
            );
        } finally {
            setRevokingId(null);
        }
    };

    return (
        <PageSurface>
            <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5">
                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                            Organizer workspace
                        </p>
                        <h1 className="mt-2 text-2xl font-bold leading-[1.12] text-slate-950 md:text-3xl">
                            Support Staff
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                            Undang assistant untuk membantu scan tiket dan
                            mengelola komunitas.
                        </p>
                    </div>
                    <div className="rounded-xl border border-primary/10 bg-primary-light/70 px-4 py-3">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                            Support aktif
                        </p>
                        <p className="mt-1 text-2xl font-semibold leading-none text-primary">
                            {activeSupportCount}
                        </p>
                    </div>
                </div>
            </header>

            <section className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
                <form
                    className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5"
                    onSubmit={(event) => {
                        event.preventDefault();
                        void handleAddMember();
                    }}
                >
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                            <UserRoundPlus className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-semibold text-slate-950">
                                Add support member
                            </h2>
                            <p className="mt-1 text-sm leading-relaxed text-slate-500">
                                Backend will send the invitation email after
                                this member is added.
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                            Invite method
                        </p>
                        <div className="mt-2 grid grid-cols-1 gap-2">
                            <button
                                type="button"
                                onClick={() => handleInviteModeChange("email")}
                                className={cn(
                                    "flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition",
                                    inviteMode === "email"
                                        ? "border-primary/20 bg-white text-primary shadow-sm shadow-slate-900/5"
                                        : "border-slate-200 bg-transparent text-slate-500 hover:bg-white",
                                )}
                            >
                                <AtSign className="h-4 w-4" />
                                Email
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="support-email">
                                Support member email
                            </Label>
                            <Input
                                id="support-email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="supporter@example.com"
                                className="h-10 rounded-xl border-slate-200 bg-slate-50"
                                autoComplete="email"
                            />
                        </div>

                        <div className="rounded-xl border border-primary/10 bg-primary-light/60 px-3 py-2.5">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-xs font-medium text-slate-600">
                                    Role
                                </span>
                                <Badge className="rounded-full border-primary/15 bg-white px-2.5 py-1 text-[11px] font-semibold text-primary">
                                    <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                                    support
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="mt-5 h-10 w-full rounded-xl text-sm font-semibold"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <MailPlus className="mr-2 h-4 w-4" />
                        )}
                        Add Support Member
                    </Button>
                </form>

                <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
                    <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 px-5 py-4">
                        <div>
                            <h2 className="text-base font-semibold text-slate-950">
                                Support staff list
                            </h2>
                            <p className="text-sm text-slate-500">
                                Active and revoked support members are shown
                                here.
                            </p>
                        </div>
                        <UsersRound className="h-5 w-5 text-slate-300" />
                    </div>

                    {loading ? (
                        <div className="flex min-h-56 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : supportMembers.length ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200/80 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        <th className="px-5 py-3">Member</th>
                                        <th className="px-5 py-3">Role</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">Added</th>
                                        <th className="px-5 py-3 text-right">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {supportMembers.map((member) => (
                                        <tr
                                            key={member.id}
                                            className="hover:bg-slate-50/70"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-950">
                                                    {getMemberLabel(member)}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {member.email ||
                                                        member.user_email}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
                                                    <ShieldCheck className="h-4 w-4 text-primary" />
                                                    support
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <Badge
                                                    className={cn(
                                                        "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                                                        member.status ===
                                                            "active"
                                                            ? "border-success/20 bg-success-light text-success"
                                                            : "border-slate-200 bg-slate-100 text-slate-500",
                                                    )}
                                                >
                                                    {member.status}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-4 text-slate-500">
                                                {formatDate(member.created_at)}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-9 rounded-xl border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                    disabled={
                                                        member.status ===
                                                            "revoked" ||
                                                        revokingId === member.id
                                                    }
                                                    onClick={() =>
                                                        handleRevoke(member)
                                                    }
                                                >
                                                    {revokingId ===
                                                    member.id ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                    )}
                                                    Revoke
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="px-6 py-14 text-center">
                            <UsersRound className="mx-auto h-8 w-8 text-slate-300" />
                            <h3 className="mt-4 text-base font-semibold text-slate-950">
                                No support members yet
                            </h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Add a support member to help with event
                                operations.
                            </p>
                        </div>
                    )}
                </section>
            </section>
        </PageSurface>
    );
}
