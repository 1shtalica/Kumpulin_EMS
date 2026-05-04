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
import { Home, LogOut, Plus } from "lucide-react";
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
          className="w-64 flex flex-col gap-0 p-0"
          aria-describedby={undefined}
        >
          <SheetHeader className="h-[72px] flex flex-row items-center border-b border-slate-100 shrink-0 p-0">
            <SheetTitle className="flex-1 px-4 text-left">
              <button
                type="button"
                className="flex items-center gap-3 group cursor-pointer focus-visible:outline-none"
                onClick={() => { setIsSheetOpen(false); router.refresh(); }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white font-bold text-lg">
                  K
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-slate-900 leading-tight whitespace-nowrap">kumpul.in</span>
                  <span className="text-[13px] text-slate-500 font-medium whitespace-nowrap">Organizer</span>
                </div>
              </button>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden p-4 gap-6">

            <div className="flex flex-col gap-1 overflow-hidden">
              <NavContent
                showLabel={true}
                onClose={() => setIsSheetOpen(false)}
                items={menuItems}
              />
            </div>

            <div className="flex flex-col gap-1 overflow-hidden">
              <NavContent
                showLabel={true}
                onClose={() => setIsSheetOpen(false)}
                items={accountItems}
              />
              <Button
                variant="ghost"
                className="w-full justify-start h-10 rounded-lg whitespace-nowrap overflow-hidden transition-all duration-200 text-slate-500 font-medium hover:text-slate-900 hover:bg-slate-50"
                onClick={() => { setIsSheetOpen(false); logout(); }}
              >
                <LogOut className="h-[18px] w-[18px] shrink-0 text-slate-400 mr-3" />
                <span>Keluar</span>
              </Button>
            </div>

            <div className="flex-1" />
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
            "px-6 md:px-8 pb-8 flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-x-hidden",
            "md:ml-20",
            isOpen ? "md:ml-64" : "md:ml-20",
            "pt-[calc(72px+2rem)]"
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
