import type { Metadata } from "next";
import UserMainPagesLayout from "@/components/user/layout/UserMainPagesLayout";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function MyOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserMainPagesLayout>{children}</UserMainPagesLayout>;
}
