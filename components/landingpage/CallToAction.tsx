import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export default function CallToAction() {
  return (
    <section className="w-full bg-linear-to-r from-primary to-primary-hover py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 w-full max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Text Area */}
        <div className="text-white text-center md:text-left space-y-2">
          <h2 className="font-bold text-2xl md:text-3xl lg:text-4xl text-white">
            Punya event?
          </h2>
          <p className="text-white/90 text-sm md:text-lg max-w-xl">
            Ciptakan eventmu dan jangkau ribuan peserta dengan mudah.
          </p>
        </div>

        {/* Button CTA */}
        <Button
          asChild
          variant="light"
          size="xl"
          className="
              
              transition-all duration-300 ease-out
              hover:-translate-y-1
              hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)]
            "
        >
          <Link href="/register">
            Daftar Sekarang
            <ArrowRight size={22} className="ml-2" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
