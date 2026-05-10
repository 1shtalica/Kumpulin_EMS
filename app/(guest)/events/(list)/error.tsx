"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function EventsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Events page error:", error);
  }, [error]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f9fafb]">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            opacity: 0.24,
          }}
        />
        <div className="absolute top-8 right-8 h-[22rem] w-[22rem] rounded-full bg-[#002cee14]" />
        <div className="absolute bottom-8 left-8 h-[18rem] w-[18rem] rounded-full bg-[#6366f112]" />
      </div>
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-accent mb-4">
          Terjadi Kesalahan
        </h2>
        <p className="text-muted mb-6">
          {error.message || "Gagal memuat daftar event. Silakan coba lagi."}
        </p>
        <Button
          onClick={reset}
          className="bg-linear-to-r from-primary to-secondary hover:opacity-90"
        >
          Coba Lagi
        </Button>
      </div>
      </div>
    </div>
  );
}
