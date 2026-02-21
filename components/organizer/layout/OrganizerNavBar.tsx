"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Calendar,
  ScanQrCode,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


interface OrganizerNavBarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const navItems = [
  {
    title: "Dashboard",
    href: "/organizer/dashboard",
    icon: Home,
  },
  {
    title: "Event Saya",
    href: "/organizer/my-event",
    icon: Calendar,
  },
  {
    title: "Check In",
    href: "/organizer/check-in",
    icon: ScanQrCode,
  },
  {
    title: "Komunitas",
    href: "/organizer/communities",
    icon: Users,
  },
];

// ─── Shared nav content (dipakai ulang di desktop sidebar & mobile sheet) ───

interface NavContentProps {
  /** Apakah teks label ditampilkan (true = expanded) */
  showLabel?: boolean;
  /** Callback setelah klik nav item (untuk menutup Sheet di mobile) */
  onClose?: () => void;
}

export function NavContent({ showLabel = true, onClose }: NavContentProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        const linkButton = (
          <Button
            asChild
            variant="ghost"
            className={cn(
              "w-full justify-start h-10",
              !showLabel && "justify-center px-2",
              isActive
                ? "bg-primary/10 text-primary font-bold hover:bg-primary/20"
                : "text-muted font-medium",
            )}
            onClick={onClose}
          >
            <Link href={item.href}>
              <Icon className={cn("h-5 w-5 shrink-0", showLabel && "mr-3")} />
              {showLabel && (
                <span className="whitespace-nowrap">{item.title}</span>
              )}
            </Link>
          </Button>
        );

        // Mode label tampil: kembalikan tombol tanpa tooltip
        if (showLabel) {
          return <div key={item.href}>{linkButton}</div>;
        }

        // Mode ikon saja: bungkus dengan Tooltip di sisi kanan
        return (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>{linkButton}</TooltipTrigger>
            <TooltipContent side="right">{item.title}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}


// ─── Desktop Sidebar (hidden di mobile) ──────────────────────────────────────

export default function OrganizerNavBar({
  isOpen,
  toggleSidebar,
}: OrganizerNavBarProps) {
  const router = useRouter();

  return (
    // TooltipProvider di sini agar semua Tooltip di dalam sidebar (nav + avatar) bisa berfungsi
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-white border-r",
          "transition-all duration-300 ease-in-out flex-col",
          "hidden md:flex",
          isOpen ? "w-64" : "w-20",
        )}
      >
        {/* ── Header sidebar: Logo + tombol toggle ── */}
        <div
          className={cn(
            "h-16 flex items-center px-4 shrink-0 border-b",
            isOpen ? "justify-between" : "justify-center",
          )}
        >
          {/* Logo — disembunyikan saat sidebar dikecilkan */}
          <div
            className={cn(
              "overflow-hidden transition-all",
              !isOpen && "w-0 opacity-0",
            )}
          >
            <button
              type="button"
              onClick={() => router.refresh()}
              className="flex items-center gap-2 text-xl md:text-2xl group cursor-pointer focus-visible:outline-none"
            >
              <span className="transition-transform group-hover:rotate-12">
                🎉
              </span>
              <span className="font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">
                kumpul.in
              </span>
            </button>
          </div>

          {/* Tombol toggle collapse/expand */}
          <Button
            onClick={toggleSidebar}
            variant="ghost"
            size="icon"
            className={cn("rounded-full shrink-0", isOpen && "ml-auto")}
          >
            {isOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* ── Konten utama: nav items ── */}
        <div className="flex-1 flex flex-col overflow-hidden p-3">
          <NavContent showLabel={isOpen} />
        </div>
      </aside>
    </TooltipProvider>
  );
}
