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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
  );
}
