"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function ImageSection() {
  const [isVisible, setIsVisible] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [blurOpacity, setBlurOpacity] = useState(1);

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
          <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-blue-50 to-purple-50" />

          {/* Floating orbs for depth */}
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
          <div className="absolute top-40 right-32 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-1/3 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl" />

          {/* Fade to white */}
          <div className="absolute inset-0 bg-linear-to-b from-white/50 via-transparent to-white" />
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-12">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5">
                <Image
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1740&auto=format&fit=crop"
                  alt="Ilustrasi Event Teknologi dan Networking"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1400px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
