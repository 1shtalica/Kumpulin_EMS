"use client";

import { useState } from "react";
import UserHeader from "@/components/user/layout/UserHeader";
import UserNavBar, {
  NavContent,
  menuItems,
} from "@/components/user/layout/UserNavBar";
import { useAuthStore } from "@/stores/auth-store";
import { ChevronsUpDown, LogOut, User, Home } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { logout, user } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    user?.email ||
    "User";
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "U";

  // Hydration fallback untuk mencegah ID mismatch pada Radix components (Sheet, Dropdown)
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex">
        <aside className="hidden md:flex fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-100 flex-col animate-pulse">
           <div className="h-18 border-b border-slate-100 bg-slate-50" />
           <div className="p-4 space-y-4">
              <div className="h-10 bg-slate-50 rounded-xl" />
              <div className="h-10 bg-slate-50 rounded-xl" />
           </div>
        </aside>
        <div className="flex-1 flex flex-col md:ml-64 pt-26">
          <header className="fixed top-0 left-0 md:left-64 right-0 z-30 h-18 bg-white border-b border-slate-100 flex items-center px-6 animate-pulse">
            <div className="h-8 w-32 bg-slate-50 rounded-lg" />
            <div className="flex-1" />
            <div className="h-10 w-10 rounded-full bg-slate-50" />
          </header>
          <main className="px-6 md:px-8 pb-8">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <div className="min-h-screen bg-white flex">
        {/* ── Mobile Sheet ── */}
        <SheetContent
          side="left"
          className="w-64 flex flex-col gap-0 p-0"
          aria-describedby={undefined}
        >
          <SheetHeader className="h-18 flex flex-row items-center border-b border-slate-100 shrink-0 p-0">
            <SheetTitle className="flex-1 px-4 text-left">
              <button
                type="button"
                className="flex items-center gap-3 group cursor-pointer focus-visible:outline-none"
                onClick={() => {
                  setIsSheetOpen(false);
                  router.refresh();
                }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white font-bold text-lg">
                  K
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-slate-900 leading-tight whitespace-nowrap">
                    kumpul.in
                  </span>
                  <span className="text-[13px] text-slate-500 font-medium whitespace-nowrap">
                    Akun Saya
                  </span>
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

            <div className="flex-1" />

            {/* Tombol Beranda */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => { setIsSheetOpen(false); router.push("/"); }}
                className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <Home className="h-4 w-4 shrink-0 text-slate-400" />
                Beranda
              </button>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-15 w-full min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-left shadow-sm shadow-slate-900/5 transition-colors hover:border-primary/20 hover:bg-primary-light/60"
                  >
                    <Avatar className="h-10 w-10 shrink-0 rounded-full ring-2 ring-white">
                      <AvatarImage src={user?.profile_url} alt={displayName} />
                      <AvatarFallback className="rounded-full bg-primary-light text-xs font-semibold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold leading-tight text-slate-950">
                        {displayName}
                      </p>
                      <p className="mt-1 truncate text-xs font-medium text-slate-500">
                        {user?.email || "User"}
                      </p>
                    </div>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  side="top"
                  className="w-56 rounded-2xl border-slate-200 p-1.5 shadow-lg shadow-slate-900/10"
                >
                  <DropdownMenuItem
                    className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 focus:bg-red-50 focus:text-red-700"
                    onClick={() => {
                      setIsSheetOpen(false);
                      logout();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
            "px-6 md:px-8 pb-8 flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-x-hidden",
            "md:ml-20",
            isOpen ? "md:ml-64" : "md:ml-20",
            "pt-26",
          )}
        >
          <UserHeader
            className={cn(
              "transition-all duration-300 ease-in-out",
              isOpen ? "md:left-64" : "md:left-20",
            )}
          />
          {children}
        </div>
      </div>
    </Sheet>
  );
}
