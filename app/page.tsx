// import metadata from "next/metadata";

// import { redirect } from "next/navigation";
// import { cookies } from "next/headers";


import LandingNavbar from "@/components/landingpage/LandingNavbar";
import Hero from "@/components/landingpage/Hero";
import EventsSuggestion from "@/components/landingpage/EventsSuggestion";
import PopularCategory from "@/components/landingpage/PopularCategory";
import UpcomingEvents from "@/components/landingpage/UpcomingEvents";
import CallToAction from "@/components/landingpage/CallToAction";
import LandingFooter from "@/components/landingpage/LandingFooter";



export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LandingNavbar />
      <main>
        <Hero />
        <div>
          <EventsSuggestion />
          <PopularCategory />
          <UpcomingEvents />
        </div>
        <CallToAction />
      </main>
      <LandingFooter />
    </div>
  );
}
