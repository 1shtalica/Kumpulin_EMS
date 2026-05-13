"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Ticket,
  Heart,
  User,
  LogOut,
  Home,
  ChevronsUpDown,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

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
  }
];

interface NavContentProps {
  showLabel?: boolean;
  onClose?: () => void;
  items: NavItem[];
}

export function NavContent({ showLabel = true, onClose, items }: NavContentProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-3 overflow-hidden">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        const linkButton = (
          <Button
            asChild
            variant="ghost"
            className={cn(
              "w-full justify-start h-12 rounded-lg whitespace-nowrap overflow-hidden transition-all duration-200",
              !showLabel && "justify-center px-2",
              isActive
                ? "bg-primary/10 text-primary font-semibold shadow-none hover:bg-primary/20 hover:text-primary"
                : "text-slate-500 font-medium hover:bg-slate-100 hover:text-slate-900",
            )}
            onClick={onClose}
          >
            <Link href={item.href}>
              <Icon
                className={cn(
                  "h-4.5 w-4.5 shrink-0",
                  isActive ? "text-primary" : "text-slate-400",
                  showLabel && "mr-3"
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

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    user?.email ||
    "User";

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "U";

  const profileTrigger = (
    <Button
      variant="ghost"
      className={cn(
        "min-w-0 justify-start text-left transition-all overflow-hidden",
        isOpen
          ? "h-15 w-full p-2.5 rounded-xl border border-white/40 bg-gradient-to-br from-primary/15 to-secondary/15 backdrop-blur-md shadow-sm hover:from-primary/25 hover:to-secondary/25 hover:shadow-md" 
          : "h-11 w-11 justify-center p-0 mx-auto hover:bg-transparent hover:text-current"
      )}
    >
      <Avatar className="h-10 w-10 shrink-0 rounded-full ring-2 ring-white/80 shadow-sm">
        <AvatarImage src={user?.profile_url} alt={displayName} />
        <AvatarFallback className="rounded-full bg-primary-light text-xs font-semibold text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      {isOpen && (
        <div className="ml-3 min-w-0 flex-1 flex flex-col justify-center">
          <p className="truncate text-sm font-semibold leading-tight text-slate-900">
            {displayName}
          </p>
          <p className="mt-1 truncate text-xs font-medium text-slate-600">
            {user?.email || "User"}
          </p>
        </div>
      )}
      
      {isOpen && (
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-500" />
      )}
    </Button>
  );

  const accountMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{profileTrigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={isOpen ? "end" : "start"}
        side={isOpen ? "top" : "right"}
        className="w-56 rounded-xl border-slate-200 p-1.5 shadow-lg shadow-slate-900/10"
      >
        <DropdownMenuItem
          className="cursor-pointer rounded-lg p-3 text-sm font-medium !text-slate-500 focus:!bg-slate-100 focus:!text-slate-500 transition-colors"
          asChild
        >
          <Link href="/user/account">
            <Settings className="mr-2 h-4 w-4" />
            Pengaturan Akun
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer rounded-lg p-3 text-sm font-medium text-red-600 focus:bg-red-50 focus:text-red-700 transition-colors"
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
          "fixed top-0 left-0 z-40 h-screen bg-white border-r border-slate-100",
          "transition-all duration-300 ease-in-out flex-col",
          "hidden md:flex",
          isOpen ? "w-64" : "w-20",
        )}
      >
        {/* Header sidebar: Logo + toggle */}
        <div
          className={cn(
            "h-18 flex items-center px-4 shrink-0 border-b border-slate-100",
            isOpen ? "justify-between" : "justify-center",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 overflow-hidden transition-all pt-2 ps-2",
              !isOpen && "w-0 opacity-0",
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white font-bold text-lg">
              K
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-slate-900 leading-tight whitespace-nowrap">
                kumpul.in
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
              "rounded-full shrink-0 text-slate-400 hover:text-slate-600 hover:bg-slate-50",
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

        {/* Konten utama */}
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden p-4 gap-6">
          <div className="flex flex-col gap-1 overflow-hidden">
            <NavContent showLabel={isOpen} items={menuItems} />
          </div>

          <div className="flex-1" />

          <div>
            {/* Tombol Beranda */}
            <div className="pt-2">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-12 rounded-lg text-slate-500 font-medium hover:bg-slate-100 hover:text-slate-900",
                  !isOpen && "justify-center px-2"
                )}
                asChild
              >
                <Link href="/">
                  <Home className={cn("h-4.5 w-4.5 shrink-0", isOpen && "mr-3")} />
                  {isOpen && <span>Beranda</span>}
                </Link>
              </Button>
            </div>

            <Separator orientation="horizontal" className="my-3" />

            {/* Kontainer Account Menu */}
            <div
              className={cn(
                "pt-2 flex items-center",
                isOpen ? "justify-start" : "justify-center"
              )}
            >
              {accountMenu}
            </div>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}