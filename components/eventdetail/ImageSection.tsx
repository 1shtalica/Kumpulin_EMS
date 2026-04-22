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
          {/* Base gradient */}
          <div className="absolute inset-0 bg-linear-to-br from-slate-50/80 via-blue-50/60 to-purple-50/60" />

          {/* Floating orbs for depth */}
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
          <div className="absolute top-40 right-32 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-1/3 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl" />

          {/* Fade to slate-50 */}
          <div className="absolute inset-0 bg-linear-to-b from-slate-50/50 via-transparent to-slate-50" />
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 py-5 md:py-8">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 w-full max-w-7xl">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-12">
              <Carousel
                className="w-full overflow-hidden rounded-2xl"
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
                                      h-50 
                                      sm:h-75 
                                      md:h-100 
                                      lg:h-112.5 
                                      xl:h-125
                                      max-h-125"
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
                    <CarouselPrevious className="left-4 bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md" />
                    <CarouselNext className="right-4 bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md" />
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