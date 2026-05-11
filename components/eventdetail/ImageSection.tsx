"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Event } from "@/types/event";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import Autoplay from "embla-carousel-autoplay";

export default function ImageSection({ event }: { event: Event }) {
  const [isVisible, setIsVisible] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [blurOpacity, setBlurOpacity] = useState(1);

  // Gambar dengan is_primary=true sebagai banner utama, sisanya galeri
  // is_primary tersedia di response BE (dari domain.EventImage)
  const allImages = event.images ?? [];
  const primaryImage = allImages.find((img) => img.is_primary)?.image_url
    ?? allImages[0]?.image_url; // fallback ke index 0 jika tidak ada yang is_primary
  const otherImages = allImages
    .filter((img) => !img.is_primary)
    .map((img) => img.image_url);

  const images = primaryImage
    ? [primaryImage, ...otherImages]
    : [
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2070",
      ];

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top < 0) {
        const scrolledPast = Math.abs(rect.top);
        const fadeDistance = windowHeight * 0.8;
        const opacity = Math.max(0, 1 - scrolledPast / fadeDistance);
        setBlurOpacity(opacity);
        setIsVisible(opacity > 0);
      } else {
        setBlurOpacity(1);
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={sectionRef} className="relative w-full">
      {/* Mesh Gradient Background */}
      {isVisible && (
        <div
          className="fixed top-0 left-0 w-screen pointer-events-none transition-opacity duration-300 ease-out"
          style={{
            opacity: blurOpacity,
            height: "200vh",
            zIndex: 1,
          }}
        >
          {/* Base surface */}
          <div className="absolute inset-0 bg-[#f9fafb]" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              opacity: 0.18,
            }}
          />
          <svg
            className="absolute inset-0 h-full w-full text-primary"
            viewBox="0 0 1440 720"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M80 476C238 348 346 548 510 400C650 274 754 346 910 242C1078 130 1200 254 1370 134"
              stroke="currentColor"
              strokeOpacity="0.08"
              strokeWidth="2"
            />
            <path
              d="M128 170C292 238 398 92 564 164C714 230 820 142 972 206C1118 268 1212 372 1360 310"
              stroke="#10b981"
              strokeOpacity="0.06"
              strokeWidth="2"
            />
          </svg>

          {/* Fade to slate-50 */}
          <div className="absolute inset-0 bg-linear-to-b from-[#f9fafb]/30 via-transparent to-[#f9fafb]" />
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 py-5 md:py-7">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 w-full max-w-7xl">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-12">
              <Carousel
                className="w-full overflow-hidden rounded-2xl border border-white/70 bg-white shadow-lg shadow-slate-900/10"
                plugins={[
                  Autoplay({
                    delay: 4000,
                  }),
                ]}
                opts={{
                  loop: true,
                }}
              >
                <CarouselContent>
                  {images.map((src, index) => (
                    <CarouselItem key={index}>

                      <div
                        className="relative w-full 
                                      h-54 
                                      sm:h-76 
                                      md:h-96 
                                      lg:h-108 
                                      xl:h-120
                                      max-h-120"
                      >
                        <Image
                          src={src}
                          alt={`${event.title} - Poster ${index + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-700"
                          priority={index === 0}
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 85vw, 1200px"
                        />
                      </div>

                    </CarouselItem>
                  ))}
                </CarouselContent>
                {images.length > 1 && (
                  <>
                    <CarouselPrevious className="left-4 bg-white/85 hover:bg-white text-slate-900 border-0 shadow-md backdrop-blur-md" />
                    <CarouselNext className="right-4 bg-white/85 hover:bg-white text-slate-900 border-0 shadow-md backdrop-blur-md" />
                  </>
                )}
              </Carousel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
