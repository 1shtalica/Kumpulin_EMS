import SupportDashboardLayoutShell from "@/components/support/SupportDashboardLayoutShell";

export default function DashboardSupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SupportDashboardLayoutShell>{children}</SupportDashboardLayoutShell>;
}
