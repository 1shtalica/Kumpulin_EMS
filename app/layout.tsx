import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import AuthInitializer from "@/components/auth/AuthInitializer";
import { getServerUser } from "@/services/server-auth";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
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
      <body className={`${openSans.variable} antialiased`}>
        <AuthInitializer user={user} />
        {children}
        <Toaster position="top-right" duration={3000} richColors />
      </body>
    </html>
  );
}
