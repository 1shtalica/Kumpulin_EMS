"use client";

import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";

interface OrganizerHeaderProps {
  className?: string;
}

export default function OrganizerHeader({ className }: OrganizerHeaderProps) {
  const { user } = useAuthStore();
  const initials = user?.username?.charAt(0)?.toUpperCase() ?? "?";

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

      {/* Spacer */}
      <div className="flex-1" />

      {/* Avatar */}
      <Avatar>
        <AvatarImage src={user?.profile_url ?? undefined} />
        <AvatarFallback className="bg-primary text-white font-bold">{initials}</AvatarFallback>
      </Avatar>
    </header>
  );
}