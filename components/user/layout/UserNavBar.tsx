"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Ticket,
  Heart,
  User,
  LogOut,
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
    title: "Profile",
    href: "/user/profile",
    icon: User,
  },
];

interface NavContentProps {
  showLabel?: boolean;
  onClose?: () => void;
  items: NavItem[];
}

export function NavContent({ showLabel = true, onClose, items }: NavContentProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 overflow-hidden">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        const linkButton = (
          <Button
            asChild
            variant="ghost"
            className={cn(
              "w-full justify-start h-10 whitespace-nowrap overflow-hidden",
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
  const { logout } = useAuthStore();

  const logoutButton = (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start h-10 whitespace-nowrap overflow-hidden text-danger hover:text-danger hover:bg-danger/10",
        !isOpen && "justify-center px-2",
      )}
      onClick={logout}
    >
      <LogOut className={cn("h-5 w-5 shrink-0", isOpen && "mr-3")} />
      {isOpen && <span className="whitespace-nowrap">Keluar</span>}
    </Button>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-white border-r",
          "transition-all duration-300 ease-in-out flex-col",
          "hidden md:flex",
          isOpen ? "w-64" : "w-20",
        )}
      >
        <div
          className={cn(
            "h-16 flex items-center px-4 shrink-0 border-b",
            isOpen ? "justify-between" : "justify-center",
          )}
        >
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

        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden p-4 gap-4">

          <div className="flex flex-col gap-2 overflow-hidden">
            <h2 className={cn("text-xs font-semibold text-muted", !isOpen && "text-center")}>Menu</h2>
            <NavContent showLabel={isOpen} items={menuItems} />
          </div>

          <div className="flex flex-col gap-2 overflow-hidden">
            <h2 className={cn("text-xs font-semibold text-muted", !isOpen && "text-center")}>Akun</h2>
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

        <div className="p-4 border-t shrink-0">
          <Button
            variant="brand"
            size="lg"
            className={cn(
              "w-full whitespace-nowrap",
              isOpen && "ml-auto",
            )}
            asChild
          >
            <Link href="/">
              <Home className="h-5 w-5 shrink-0" />
              {isOpen && <span>Kembali ke Beranda</span>}
            </Link>
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}

