"use client";

import { useState } from "react";
import OrganizerHeader from "@/components/organizer/layout/OrganizerHeader";
import OrganizerNavBar, {
  NavContent,
  menuItems,
  accountItems,
} from "@/components/organizer/layout/OrganizerNavBar";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function MainPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();
  const { logout } = useAuthStore();

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <div className="min-h-screen bg-white flex">
        {/* ── Mobile Sheet ── */}
        <SheetContent
          side="left"
          className="w-64 flex flex-col gap-0"
          aria-describedby={undefined}
        >
          <SheetHeader className="h-16 flex flex-row items-center border-b shrink-0 p-0">
            <SheetTitle className="flex-1 px-4 font-bold">
              <button
                type="button"
                className="flex items-center gap-2 text-xl group cursor-pointer focus-visible:outline-none"
                onClick={() => { setIsSheetOpen(false); router.refresh(); }}
              >
                <span className="transition-transform group-hover:rotate-12">🎉</span>
                <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">
                  kumpul.in
                </span>
              </button>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden p-4 gap-4">

            {/* Section Menu */}
            <div className="flex flex-col gap-2 overflow-hidden">
              <h2 className="text-xs font-semibold text-muted px-1">Menu</h2>
              <NavContent
                showLabel={true}
                onClose={() => setIsSheetOpen(false)}
                items={menuItems}
              />
            </div>

            {/* Section Akun */}
            <div className="flex flex-col gap-2 overflow-hidden">
              <h2 className="text-xs font-semibold text-muted px-1">Akun</h2>
              <NavContent
                showLabel={true}
                onClose={() => setIsSheetOpen(false)}
                items={accountItems}
              />
              <Button
                variant="ghost"
                className="w-full justify-start h-10 whitespace-nowrap overflow-hidden text-danger hover:text-danger hover:bg-danger/10"
                onClick={() => { setIsSheetOpen(false); logout(); }}
              >
                <LogOut className="h-5 w-5 shrink-0 mr-3 text-danger" />
                <span>Keluar</span>
              </Button>
            </div>

            <div className="flex-1" />
          </div>

          {/* Tombol Beranda */}
          <div className="p-4 border-t shrink-0">
            <Button variant="brand" size="lg" className="w-full whitespace-nowrap" asChild>
              <Link href="/" onClick={() => setIsSheetOpen(false)}>
                <Home className="h-5 w-5 shrink-0" />
                <span>Kembali ke Beranda</span>
              </Link>
            </Button>
          </div>
        </SheetContent>

        {/* ── Desktop Sidebar ── */}
        <OrganizerNavBar
          isOpen={isOpen}
          toggleSidebar={() => setIsOpen(!isOpen)}
        />

        {/* ── Main Content ── */}
        <div
          className={cn(
            "px-12 flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-x-hidden",
            "md:ml-20",
            isOpen ? "md:ml-64" : "md:ml-20",
            "pt-16"
          )}
        >
          <OrganizerHeader
            className={cn(
              "transition-all duration-300 ease-in-out",
              isOpen ? "md:left-64" : "md:left-20"
            )}
          />
          {children}
        </div>
      </div>
    </Sheet>
  );
}
