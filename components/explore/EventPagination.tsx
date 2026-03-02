"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  totalItems: number;
  limit: number;
  currentOffset: number;
}

export default function EventPagination({ totalItems, limit, currentOffset }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const currentPage = Math.floor(currentOffset / limit) + 1;

  if (totalPages <= 1) return null; // Sembunyikan jika cuma 1 page

  const goToPage = (page: number) => {
    // 🔏 Aman dari manipulasi langsung
    const safePage = Math.max(1, Math.min(page, totalPages));
    const newOffset = (safePage - 1) * limit;

    const params = new URLSearchParams(searchParams.toString());
    params.set("offset", String(newOffset));
    
    // Gunakan 'router.push' tanpa interupsi reload server (React Server Actions handling)
    // Server Component <ExplorePage> akan dipanggil ulang secara diam-diam.
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === 1}
        onClick={() => goToPage(currentPage - 1)}
        className="h-10 w-10 shrink-0"
      >
        <span className="sr-only">Previous page</span>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1.5 overflow-x-auto px-2 scrollbar-none">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "brand" : "outline"}
            size="icon"
            onClick={() => goToPage(page)}
            className="h-10 w-10 shrink-0"
          >
            {page}
          </Button>
        ))}
      </div>

      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === totalPages}
        onClick={() => goToPage(currentPage + 1)}
        className="h-10 w-10 shrink-0"
      >
        <span className="sr-only">Next page</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
