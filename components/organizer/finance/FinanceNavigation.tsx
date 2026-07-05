"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Landmark, WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/organizer/finance", label: "Saldo", icon: WalletCards },
  { href: "/organizer/finance/ledger", label: "Buku Kas", icon: BarChart3 },
  {
    href: "/organizer/finance/withdrawals",
    label: "Pencairan",
    icon: Landmark,
  },
];

export function FinanceNavigation() {
  const pathname = usePathname();

  return (
    <nav className="rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm shadow-slate-900/5">
      <div className="flex gap-2 overflow-x-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/organizer/finance" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all duration-200",
                active
                  ? "bg-primary text-white shadow-sm shadow-primary/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
