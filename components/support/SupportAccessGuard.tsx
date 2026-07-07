"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { SupportService } from "@/services/support-service";

export default function SupportAccessGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const access = await SupportService.getSupportAccess();
        if (!active) return;

        if (access.events || access.community) {
          setAllowed(true);
          return;
        }

        router.replace("/");
      } catch {
        if (active) router.replace("/");
      }
    })();

    return () => {
      active = false;
    };
  }, [router]);

  if (!allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </main>
    );
  }

  return <>{children}</>;
}
