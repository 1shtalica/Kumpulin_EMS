"use client";

import { usePathname, useSearchParams } from "next/navigation";

import UserMainPagesLayout from "@/components/user/layout/UserMainPagesLayout";
import SupportAccessGuard from "./SupportAccessGuard";

export default function SupportDashboardLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supportCheckIn = pathname.startsWith("/dashboard/support/check-in/");
  const scannerOnly = supportCheckIn && searchParams.get("scanner") === "1";

  return (
    <SupportAccessGuard>
      {scannerOnly ? (
        <div className="min-h-screen bg-[#f9fafb]">{children}</div>
      ) : (
        <UserMainPagesLayout
          variant={supportCheckIn ? "workspace" : "default"}
          workspaceLabel="Support"
        >
          {children}
        </UserMainPagesLayout>
      )}
    </SupportAccessGuard>
  );
}