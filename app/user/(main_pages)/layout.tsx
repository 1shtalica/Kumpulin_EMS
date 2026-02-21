"use client";

import { useState } from "react";
import UserHeader from "@/components/user/layout/UserHeader";
import UserNavBar, {
  NavContent,
} from "@/components/user/layout/UserNavBar";
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

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <div className="min-h-screen bg-white flex">
        {/* ── Mobile Sheet ── */}
        <SheetContent
          side="left"
          className="w-64 flex flex-col gap-0"
          aria-describedby={undefined}
        >
          <SheetHeader
            className="h-16 flex flex-row items-center border-b shrink-0 p-0"
          >
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

          <div className="flex-1 flex flex-col overflow-hidden p-3 gap-3">
            <NavContent
              showLabel={true}
              onClose={() => setIsSheetOpen(false)}
            />
          </div>
        </SheetContent>

        {/* ── Desktop Sidebar ── */}
        <UserNavBar
          isOpen={isOpen}
          toggleSidebar={() => setIsOpen(!isOpen)}
        />

        {/* ── Main Content ── */}
        <div
          className={cn(
            "flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-x-hidden",
            "md:ml-20",
            isOpen ? "md:ml-64" : "md:ml-20",
            "pt-16"
          )}
        >
          <UserHeader
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
