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
  User,
  LogOut,
  LayoutDashboard,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  href: string;
  icon: any;
}

interface OrganizerNavBarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const menuItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/organizer/dashboard",
    icon: LayoutDashboard,
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

export const accountItems: NavItem[] = [
  {
    title: "Profile",
    href: "/organizer/profile",
    icon: User,
  },
];

// ─── NavContent (shared) ─────────────────────────────────────────────────────

interface NavContentProps {
  showLabel?: boolean;
  onClose?: () => void;
  items: NavItem[];
}

export function NavContent({ showLabel = true, onClose, items }: NavContentProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 overflow-hidden">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        const linkButton = (
          <Button
            asChild
            variant="ghost"
            className={cn(
              "w-full justify-start h-10 rounded-lg whitespace-nowrap overflow-hidden transition-all duration-200",
              !showLabel && "justify-center px-2",
              isActive
                ? "bg-primary/10 text-primary font-semibold shadow-none hover:bg-primary/20 hover:text-primary"
                : "text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900",
            )}
            onClick={onClose}
          >
            <Link href={item.href}>
              <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-primary" : "text-slate-400", showLabel && "mr-3")} />
              {showLabel && (
                <span className="whitespace-nowrap">{item.title}</span>
              )}
            </Link>
          </Button>
        );

        if (showLabel) {
          return <div key={item.href}>{linkButton}</div>;
        }

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

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────

export default function OrganizerNavBar({ isOpen, toggleSidebar }: OrganizerNavBarProps) {
  const router = useRouter();
  const { logout } = useAuthStore();

  const logoutButton = (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start h-10 rounded-lg whitespace-nowrap overflow-hidden transition-all duration-200 text-slate-500 font-medium hover:text-slate-900 hover:bg-slate-50",
        !isOpen && "justify-center px-2",
      )}
      onClick={logout}
    >
      <LogOut className={cn("h-[18px] w-[18px] shrink-0 text-slate-400", isOpen && "mr-3")} />
      {isOpen && <span className="whitespace-nowrap">Keluar</span>}
    </Button>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-white border-r border-slate-100",
          "transition-all duration-300 ease-in-out flex-col",
          "hidden md:flex",
          isOpen ? "w-64" : "w-20",
        )}
      >
        {/* Header sidebar: Logo + toggle */}
        <div
          className={cn(
            "h-[72px] flex items-center px-4 shrink-0 border-b border-slate-100",
            isOpen ? "justify-between" : "justify-center",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 overflow-hidden transition-all",
              !isOpen && "w-0 opacity-0",
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white font-bold text-lg">
              K
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 leading-tight whitespace-nowrap">kumpul.in</span>
              <span className="text-[13px] text-slate-500 font-medium whitespace-nowrap">Organizer</span>
            </div>
          </div>

          <Button
            onClick={toggleSidebar}
            variant="ghost"
            size="icon"
            className={cn("rounded-full shrink-0 text-slate-400 hover:text-slate-600 hover:bg-slate-50", isOpen && "ml-auto")}
          >
            {isOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Konten utama */}
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden p-4 gap-6">

          <div className="flex flex-col gap-1 overflow-hidden">
            <NavContent showLabel={isOpen} items={menuItems} />
          </div>

          <div className="flex flex-col gap-1 overflow-hidden">
            <NavContent showLabel={isOpen} items={accountItems} />
            {isOpen ? (
              logoutButton
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>{logoutButton}</TooltipTrigger>
                <TooltipContent side="right">Keluar</TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="flex-1" />
        </div>

        <div className="p-4 shrink-0">
          <Button
            className={cn("w-full whitespace-nowrap overflow-hidden transition-all duration-300 bg-primary hover:bg-primary/90 text-white rounded-lg h-11", isOpen ? "" : "px-0")}
            asChild
          >
            <Link href="/organizer/dashboard">
              <Plus className="h-5 w-5 shrink-0" />
              {isOpen && <span className="ml-2 font-medium">Buat Event</span>}
            </Link>
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
