"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Calendar, 
  ScanQrCode, 
  Users 
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Definisikan tipe props
interface OrganizerNavBarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

// Daftar menu agar kodingan lebih rapi & mudah ditambah
const navItems = [
  {
    title: "Dashboard",
    href: "/organizer/dashboard",
    icon: Home,
  },
  {
    title: "Event Saya", // Ganti "My Event" jadi bhs indo/konsisten
    href: "/organizer/my-event", // Saran: Pakai '/events' bukan '/myevent'
    icon: Calendar,
  },
  {
    title: "Check In",
    href: "/organizer/check-in", // Saran: Pakai kebab-case
    icon: ScanQrCode,
  },
  {
    title: "Komunitas",
    href: "/organizer/communities", // Saran: Pakai plural
    icon: Users,
  },
];

export default function OrganizerNavBar({ isOpen, toggleSidebar }: OrganizerNavBarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 h-screen bg-white border-r transition-all duration-300 ease-in-out flex flex-col",
        isOpen ? "w-64" : "w-20"
      )}
    >
      {/* --- HEADER SIDEBAR --- */}
      <div className="h-16 flex items-center justify-between px-4 border-b shrink-0">
        <div className={cn("overflow-hidden transition-all", !isOpen && "w-0 opacity-0")}>
          <Link href="/" className="flex items-center gap-2 text-xl md:text-2xl group">
          <span className="transition-transform group-hover:rotate-12">
            🎉
          </span>
          <span className="font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">
            kumpul.in
          </span>
        </Link>
        </div>
        
        <Button 
          onClick={toggleSidebar} 
          variant="ghost" 
          size="icon" 
          className="rounded-full shrink-0 ml-auto"
        >
          {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>

      {/* --- NAVIGATION MENU --- */}
      <nav className="flex-1 flex flex-col p-3 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          // Cek apakah link ini aktif (exact match atau nested match)
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Button
              key={item.href}
              asChild // Penting: Agar Button merender Link di dalamnya
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-10 mb-1",
                // Jika sidebar tutup, padding disesuaikan biar icon di tengah
                !isOpen && "justify-center px-2",
                isActive ? "bg-primary/10 text-primary font-bold hover:bg-primary/20" : "text-slate-600 font-medium"
              )}
            >
              <Link href={item.href}>
                <Icon className={cn("h-5 w-5 shrink-0", isOpen && "mr-3")} />
                
                {/* Teks hanya muncul jika isOpen */}
                <span
                  className={cn(
                    "transition-opacity duration-300 whitespace-nowrap",
                    !isOpen ? "opacity-0 w-0 hidden" : "opacity-100"
                  )}
                >
                  {item.title}
                </span>
              </Link>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}