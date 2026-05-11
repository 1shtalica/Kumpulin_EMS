import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import AuthInitializer from "@/components/auth/AuthInitializer";
import { getServerUser } from "@/services/server-auth";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800", "900"],
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
            <body
                className={`${poppins.className} antialiased`}
                suppressHydrationWarning={true}
            >
                <AuthInitializer user={user} />
                {children}
                <Toaster position="bottom-right" duration={3000} />
            </body>
        </html>
    );
}
