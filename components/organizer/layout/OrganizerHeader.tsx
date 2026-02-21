"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";

interface OrganizerHeaderProps {
  className?: string;
}

export default function OrganizerHeader({ className }: OrganizerHeaderProps) {
  const pathname = usePathname();
  const titlepage = pathname.split("/").pop();
  const router = useRouter();
  const { user, logout } = useAuthStore();
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
      {/* SheetTrigger asChild — burger button membuka Sheet mobile */}
      {/* Bekerja karena OrganizerHeader di-render di dalam Sheet context (layout.tsx) */}
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

      {/* Avatar Profile  */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar size="lg" className="cursor-pointer">
            <AvatarImage src={user?.avatar ?? undefined}/>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel><div className="flex flex-col gap-1">
            <p className="font-semibold text-sm">{user?.username}</p>
            <p className="text-muted-foreground text-xs">{user?.email}</p>
            </div></DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/organizer/profile")}>Profile</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => logout()}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}