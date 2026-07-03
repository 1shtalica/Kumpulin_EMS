import UserMainPagesLayout from "@/components/user/layout/UserMainPagesLayout";

export default function MyOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserMainPagesLayout>{children}</UserMainPagesLayout>;
}
