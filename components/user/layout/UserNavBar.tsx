"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Heart,
  Home,
  LogOut,
  LucideIcon,
  Ticket,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User as AuthUser } from "@/types/user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface UserNavBarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const menuItems: NavItem[] = [
  {
    title: "Tiket Saya",
    href: "/user/my-ticket",
    icon: Ticket,
  },
  {
    title: "Mengikuti",
    href: "/user/following",
    icon: Heart,
  },
];

export const accountItems: NavItem[] = [
  {
    title: "Profil",
    href: "/user/profile",
    icon: User,
  },
];

function getUserDisplayName(user: AuthUser | null) {
  if (!user) return "Pengguna";

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");

  return fullName || user.username || user.email || "Pengguna";
}

function getUserInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "U"
  );
}

interface NavContentProps {
  showLabel?: boolean;
  onClose?: () => void;
  items: NavItem[];
}

export function NavContent({
  showLabel = true,
  onClose,
  items,
}: NavContentProps) {
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
              "h-10 w-full justify-start overflow-hidden whitespace-nowrap rounded-lg transition-all duration-200",
              !showLabel && "justify-center px-2",
              isActive
                ? "bg-primary/10 font-semibold text-primary shadow-none hover:bg-primary/20 hover:text-primary"
                : "font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900",
            )}
            onClick={onClose}
          >
            <Link href={item.href}>
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  isActive ? "text-primary" : "text-slate-400",
                  showLabel && "mr-3",
                )}
              />
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

export default function UserNavBar({ isOpen, toggleSidebar }: UserNavBarProps) {
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const displayName = getUserDisplayName(user);
  const fallback = getUserInitials(displayName);

  const profileTrigger = (
    <Button
      variant="ghost"
      className={cn(
        "min-w-0 justify-start text-left transition-all hover:border-primary/20 hover:bg-primary-light/60 hover:text-slate-950",
        isOpen ? "h-15 w-full p-2.5" : "h-11 w-11 justify-center p-0",
      )}
    >
      <Avatar className="h-10 w-10 shrink-0 rounded-full ring-2 ring-white">
        <AvatarImage src={user?.profile_url} alt={displayName} />
        <AvatarFallback className="rounded-full bg-primary-light text-xs font-semibold text-primary">
          {fallback}
        </AvatarFallback>
      </Avatar>
      {isOpen && (
        <div className="ml-3 min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-slate-950">
            {displayName}
          </p>
          <p className="mt-1 truncate text-xs font-medium text-slate-500">
            {user?.email || "User"}
          </p>
        </div>
      )}
      {isOpen && (
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
      )}
    </Button>
  );

  const accountMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{profileTrigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={isOpen ? "end" : "start"}
        side={isOpen ? "top" : "right"}
        className="w-56 rounded-2xl border-slate-200 p-1.5 shadow-lg shadow-slate-900/10"
      >
        <DropdownMenuItem
          className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 focus:bg-red-50 focus:text-red-700"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen border-r border-slate-100 bg-white",
          "hidden flex-col transition-all duration-300 ease-in-out md:flex",
          isOpen ? "w-64" : "w-20",
        )}
      >
        {/* Header sidebar: Logo + toggle */}
        <div
          className={cn(
            "flex h-18 shrink-0 items-center border-b border-slate-100 px-4",
            isOpen ? "justify-between" : "justify-center",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 overflow-hidden ps-2 pt-2 transition-all",
              !isOpen && "w-0 opacity-0",
            )}
          >
            <button
              type="button"
              onClick={() => router.refresh()}
              className="group flex items-center gap-3 text-left focus-visible:outline-none"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white transition-transform group-hover:scale-105">
                K
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="whitespace-nowrap font-bold leading-tight text-slate-900">
                  kumpul.in
                </span>
                <span className="whitespace-nowrap text-[13px] font-medium text-slate-500">
                  User
                </span>
              </span>
              <span className="text-[13px] text-slate-500 font-medium whitespace-nowrap">
                Akun Saya
              </span>
            </div>
          </div>

          <Button
            onClick={toggleSidebar}
            variant="ghost"
            size="icon"
            className={cn(
              "shrink-0 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600",
              isOpen && "ml-auto",
            )}
          >
            {isOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto overflow-x-hidden p-4">
          <div className="flex flex-col gap-2 overflow-hidden">
            {isOpen && (
              <h2 className="px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Aktivitas
              </h2>
            )}
            <NavContent showLabel={isOpen} items={menuItems} />
          </div>

          <div className="flex flex-col gap-2 overflow-hidden">
            {isOpen && (
              <h2 className="px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Akun
              </h2>
            )}
            <NavContent showLabel={isOpen} items={accountItems} />
          </div>

          <div className="flex-1" />

          <div
            className={cn(
              "border-t border-slate-100 pt-4",
              isOpen ? "flex flex-col gap-2" : "flex flex-col items-center gap-2",
            )}
          >
            {accountMenu}

            <Button
              variant="ghost"
              size={isOpen ? "default" : "icon"}
              className={cn(
                "w-full whitespace-nowrap rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                !isOpen && "h-10 w-10",
              )}
              asChild
            >
              <Link href="/">
                <Home className={cn("h-4 w-4 shrink-0", isOpen && "mr-2")} />
                {isOpen && <span>Kembali ke Beranda</span>}
              </Link>
            </Button>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
