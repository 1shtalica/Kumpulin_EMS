"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck2, Home, MessageSquareText, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

const supportItems = [
  {
    title: "Support Events",
    href: "/dashboard/support/events",
    icon: CalendarCheck2,
  },
  {
    title: "Support Community",
    href: "/dashboard/support/community",
    icon: MessageSquareText,
  },
];

export default function SupportShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-white md:flex">
      <aside className="border-b border-slate-100 bg-white px-4 py-3 md:fixed md:left-0 md:top-0 md:flex md:h-screen md:w-64 md:flex-col md:border-b-0 md:border-r">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold leading-tight text-slate-950">Support</p>
            <p className="truncate text-xs text-slate-500">
              {user?.email ?? "Organizer assistant"}
            </p>
          </div>
        </div>

        <nav className="mt-3 flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
          {supportItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                className={cn(
                  "h-10 shrink-0 justify-start rounded-xl px-3 text-sm font-medium",
                  active
                    ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
                )}
              >
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="hidden flex-1 md:block" />
        <Button
          asChild
          variant="ghost"
          className="mt-2 hidden h-10 justify-start rounded-xl px-3 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:flex"
        >
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Beranda
          </Link>
        </Button>
      </aside>

      <div className="min-w-0 flex-1 md:ml-64">{children}</div>
    </div>
  );
}
