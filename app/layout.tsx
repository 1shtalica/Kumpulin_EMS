import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import AuthInitializer from "@/components/auth/AuthInitializer";
import { getServerUser } from "@/services/server-auth";
import { Toaster } from "@/components/ui/sonner";
import { SITE_URL, SITE_URL_OBJECT } from "@/lib/site-url";
import "./globals.css";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
    metadataBase: SITE_URL_OBJECT,
    title: "Kumpul.in | Temukan Event Seru di Indonesia",
    description: "Temukan, ikuti, dan kelola event seru di Indonesia bersama Kumpul.in.",
    alternates: {
        canonical: "/",
    },
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        title: "Kumpul.in | Temukan Event Seru di Indonesia",
        description: "Temukan, ikuti, dan kelola event seru di Indonesia bersama Kumpul.in.",
        url: SITE_URL,
        siteName: "Kumpul.in",
        locale: "id_ID",
        type: "website",
        images: [
            {
                url: "/kumpulin_wordmark.svg",
                width: 1175,
                height: 327,
                alt: "Logo Kumpulin",
                type: "image/svg+xml",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Kumpul.in | Temukan Event Seru di Indonesia",
        description: "Temukan, ikuti, dan kelola event seru di Indonesia bersama Kumpul.in.",
        images: ["/kumpulin_wordmark.svg"],
    },
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
