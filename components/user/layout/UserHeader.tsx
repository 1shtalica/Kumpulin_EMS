"use client";

import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { SheetTrigger } from "@/components/ui/sheet";

interface UserHeaderProps {
  className?: string;
}

export default function UserHeader({ className }: UserHeaderProps) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname.startsWith("/my-orders")) return "Riwayat Pesanan";
    if (pathname.startsWith("/user/my-ticket")) return "Tiket Saya";
    if (pathname.startsWith("/user/following")) return "Mengikuti";
    if (pathname.startsWith("/user/wishlist")) return "Wishlist Saya";
    if (pathname.startsWith("/user/profile")) return "Profil Saya";
    return "User Account";
  };

  return (
    <header
      className={cn(
        "fixed top-0 z-30 h-18 bg-white border-b border-slate-100 flex items-center gap-4 px-6 md:px-8",
        "left-0 right-0",
        className
      )}
    >
      {/* Burger â€” membuka Sheet mobile */}
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0"
          aria-label="Buka menu navigasi"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      {/* Page Title */}
      <div className="hidden md:block">
        <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
          {getPageTitle()}
        </h1>
      </div>

      {/* Spacer */}
      <div className="flex-1" />
    </header>
  );
}


