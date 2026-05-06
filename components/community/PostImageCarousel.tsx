"use client";

import Link from "next/link";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type PostImageCarouselProps = {
    imageUrls?: string[];
    href?: string;
    className?: string;
    imageClassName?: string;
};

export default function PostImageCarousel({
    imageUrls,
    href,
    className,
    imageClassName,
}: PostImageCarouselProps) {
    const images = imageUrls?.filter(Boolean) ?? [];
    if (!images.length) return null;

    const renderImage = (imageUrl: string, index: number) => {
        const image = (
            <img
                src={imageUrl}
                alt=""
                className={cn(
                    "max-h-[520px] w-full bg-slate-50 object-cover",
                    imageClassName,
                )}
            />
        );

        if (!href) return image;

        return (
            <Link
                href={href}
                className="block"
                aria-label={`Buka gambar post ${index + 1}`}
            >
                {image}
            </Link>
        );
    };

    if (images.length === 1) {
        return (
            <div
                className={cn(
                    "overflow-hidden rounded-2xl border border-slate-100 bg-slate-50",
                    className,
                )}
            >
                {renderImage(images[0], 0)}
            </div>
        );
    }

    return (
        <Carousel
            opts={{ align: "start" }}
            className={cn(
                "group overflow-hidden rounded-2xl border border-slate-100 bg-slate-50",
                className,
            )}
        >
            <CarouselContent className="-ml-0">
                {images.map((imageUrl, index) => (
                    <CarouselItem key={`${imageUrl}-${index}`} className="pl-0">
                        {renderImage(imageUrl, index)}
                    </CarouselItem>
                ))}
            </CarouselContent>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent" />
            <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
                {images.length} gambar
            </div>
            <CarouselPrevious className="left-3 top-1/2 border-white/70 bg-white/90 text-slate-700 shadow-sm transition hover:bg-white disabled:hidden" />
            <CarouselNext className="right-3 top-1/2 border-white/70 bg-white/90 text-slate-700 shadow-sm transition hover:bg-white disabled:hidden" />
        </Carousel>
    );
}
