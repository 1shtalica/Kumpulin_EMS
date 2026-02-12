import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthInitializer from "@/components/auth/AuthInitializer";
import { getServerUser } from "@/services/server-auth";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Kumpul.in",
  description: "Kumpulin event management system",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getServerUser();

  return (
    <html lang="id">
      <body className={`${inter.className} antialiased`} suppressHydrationWarning={true}>
        <AuthInitializer user={user} />
        {children}
        <Toaster position="top-right" duration={3000} richColors />
      </body>
    </html>
  );
}
