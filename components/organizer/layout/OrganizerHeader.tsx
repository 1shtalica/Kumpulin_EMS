"use client";

import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

interface OrganizerHeaderProps {
    className?: string;
}

export default function OrganizerHeader({ className }: OrganizerHeaderProps) {
    const pathname = usePathname();

    const getPageTitle = () => {
        if (pathname.startsWith("/organizer/dashboard")) return "Dashboard";
        if (pathname.startsWith("/organizer/my-event")) return "Event Saya";
        if (pathname.startsWith("/organizer/check-in")) return "Check In";
        if (pathname.startsWith("/organizer/communities")) return "Komunitas";
        if (pathname.startsWith("/organizer/profile")) return "Profile";
        if (pathname.startsWith("/organizer/create-event")) return "Buat Event";
        return "Organizer Dashboard";
    };

    return (
        <header
            className={cn(
                "fixed top-0 z-30 h-18 bg-white border-b border-slate-100 flex items-center gap-4 px-6 md:px-8",
                "left-0 right-0",
                className,
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
