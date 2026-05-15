"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GoToTopButton() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 300);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleClick = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <button
            id="go-to-top-btn"
            onClick={handleClick}
            aria-label="Kembali ke atas"
            className={cn(
                "fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full",
                "bg-primary text-white shadow-lg shadow-primary/30 cursor-pointer",
                "transition-all duration-300 ease-in-out",
                "hover:bg-primary/90 hover:scale-110 hover:shadow-xl hover:shadow-primary/40",
                "active:scale-95",
                visible
                    ? "translate-y-0 opacity-100 pointer-events-auto"
                    : "translate-y-6 opacity-0 pointer-events-none",
            )}
        >
            <ArrowUp size={18} strokeWidth={2.5} />
        </button>
    );
}
