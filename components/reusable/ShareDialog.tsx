"use client";

import { useState, type ReactElement } from "react";
import {
  Check,
  Copy,
  Facebook,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ShareDialogProps = {
  children: ReactElement;
  title: string;
  description?: string;
  imageUrl?: string;
  url?: string;
  contentType?: string;
};

const truncate = (value: string, length = 130) =>
  value.length > length ? `${value.slice(0, length).trimEnd()}…` : value;

export default function ShareDialog({
  children,
  title,
  description,
  imageUrl,
  url,
  contentType = "konten",
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (!url || url.startsWith("/")) {
      return `${window.location.origin}${url || window.location.pathname}`;
    }
    return url;
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      toast.success("Link berhasil disalin.");
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error("Gagal menyalin link.");
    }
  };

  const openShareWindow = (shareUrl: string) => {
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const shareText = description ? `${title}\n\n${truncate(description)}` : title;

  const shareActions = [
    {
      label: copied ? "Tersalin" : "Salin link",
      icon: copied ? Check : Copy,
      onClick: () => void copyLink(),
      active: copied,
    },
    {
      label: "WhatsApp",
      icon: MessageCircle,
      onClick: () =>
        openShareWindow(
          `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${getShareUrl()}`)}`,
        ),
    },
    {
      label: "Facebook",
      icon: Facebook,
      onClick: () =>
        openShareWindow(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`,
        ),
    },
    {
      label: "Email",
      icon: Mail,
      onClick: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${shareText}\n\n${getShareUrl()}`)}`;
      },
    },
  ];

  shareActions.push({
    label: "Lainnya",
    icon: MoreHorizontal,
    onClick: () => {
      if ("share" in navigator) {
        void navigator
          .share({ title, text: description, url: getShareUrl() })
          .catch(() => undefined);
        return;
      }
      void copyLink();
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="gap-5 rounded-3xl border-slate-200 bg-white p-5 sm:max-w-md sm:p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl text-slate-950">
            Bagikan {contentType}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Pilih cara untuk membagikan {contentType} ini.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
          <div
            className="h-40 bg-cover bg-center sm:h-48"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(2, 60, 240, 0.18), rgba(1, 181, 108, 0.1)), url(${imageUrl || "/kumpulin_wordmark.svg"})`,
            }}
          />
          <div className="bg-slate-950 px-4 py-3.5">
            <p className="text-xs font-medium text-slate-400">Kumpul.in</p>
            <p className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-white">
              {title}
            </p>
            {description ? (
              <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-slate-300">
                {truncate(description, 100)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {shareActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className="group flex min-w-0 flex-col items-center gap-2 text-center hover:cursor-pointer"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all group-hover:-translate-y-0.5 group-hover:shadow-sm ${
                    action.active
                      ? "border-primary/25 bg-primary text-white"
                      : "border-slate-200 bg-slate-50 text-slate-600 group-hover:border-primary/20 group-hover:bg-primary-light group-hover:text-primary"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="truncate text-[11px] font-medium text-slate-600">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          <Share2 className="h-3.5 w-3.5 shrink-0 text-primary" />
          Link akan mengarah ke halaman {contentType} ini.
        </div>
      </DialogContent>
    </Dialog>
  );
}
