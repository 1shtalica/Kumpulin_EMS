"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { SupportService } from "@/services/support-service";
import { useAuthStore } from "@/stores/auth-store";

export default function SupportAccessGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;
    const fallbackPath = user?.role === "organizer" ? "/organizer/dashboard" : "/";

    (async () => {
      try {
        const access = await SupportService.getSupportAccess();
        if (!active) return;

        if (access.events || access.community) {
          setAllowed(true);
          return;
        }

        router.replace(fallbackPath);
      } catch {
        if (active) router.replace(fallbackPath);
      }
    })();

    return () => {
      active = false;
    };
  }, [router, user?.role]);

  if (!allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </main>
    );
  }

  return <>{children}</>;
}
