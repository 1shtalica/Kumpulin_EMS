"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Landmark, WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/organizer/finance", label: "Saldo", icon: WalletCards },
  { href: "/organizer/finance/ledger", label: "Ledger", icon: BarChart3 },
  {
    href: "/organizer/finance/withdrawals",
    label: "Withdrawal",
    icon: Landmark,
  },
];

export function FinanceNavigation() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
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
              "inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors",
              active
                ? "bg-primary text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}