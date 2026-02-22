"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";

interface UserHeaderProps {
  className?: string;
}

export default function UserHeader({ className }: UserHeaderProps) {
  const pathname = usePathname();
  const titlepage = pathname.split("/").pop();
  const { user } = useAuthStore();
  const initials = user?.username?.charAt(0)?.toUpperCase() ?? "?";

  const formattedTitle = titlepage
    ? titlepage
        .replace(/-/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "";

  return (
    <header
      className={cn(
        "fixed top-0 z-30 h-16 bg-white border-b flex items-center gap-4 px-6 shadow-xs",
        "left-0 right-0",
        className
      )}
    >
      {/* Burger — membuka Sheet mobile */}
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

      {/* Judul halaman */}
      <h1 className="flex-1 text-xl font-bold">{formattedTitle}</h1>

      {/* Avatar — tanpa dropdown, klik ke profile */}
      <Avatar>
        <AvatarImage src={user?.avatar ?? undefined} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    </header>
  );
}