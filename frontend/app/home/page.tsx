"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AboutSection from "@/src/components/organisms/AboutSection";
import ContactSection from "@/src/components/organisms/ContactSection";
import FeaturesSection from "@/src/components/organisms/FeaturesSection";
import Footer from "@/src/components/organisms/Footer";
import GallerySection from "@/src/components/organisms/GallerySection";
import HeroSection from "@/src/components/organisms/HeroSection";
import MembershipSection from "@/src/components/organisms/MembershipSection";
import Navbar from "@/src/components/organisms/Navbar";
import OffersSection from "@/src/components/organisms/OffersSection";
import TestimonialsSection from "@/src/components/organisms/TestimonialsSection";
import TrainersSection from "@/src/components/organisms/TrainersSection";
import TrainingSection from "../TrainingSection/page";
import FAQSection from "@/src/components/organisms/FAQSection";
import BMISection from "@/src/components/organisms/BMISection";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const onboarded = localStorage.getItem("onboarded");
    if (onboarded !== "true") {
      router.push("/onboarding");
    }
  }, [router]);

  return (
    <div className="bg-zinc-950 text-white min-h-screen flex flex-col font-sans">
      <Navbar />
      <div className="pt-20"></div>

      {/* Hero Section */}
      <HeroSection />

      {/* About Summary Block */}
      <div className="relative group">
        <AboutSection />
        <div className="bg-zinc-950 pb-16 text-center">
          <Link href="/about" className="inline-block bg-zinc-900 border border-zinc-800 hover:border-yellow-400 hover:text-yellow-400 text-white font-bold px-8 py-3.5 rounded-xl transition duration-300">
            Read Our Full Story & Milestones →
          </Link>
        </div>
      </div>

      {/* Features Summary Block */}
      <div className="relative group border-t border-zinc-900">
        <FeaturesSection />
        <div className="bg-zinc-950 pb-16 text-center">
          <Link href="/features" className="inline-block bg-zinc-900 border border-zinc-800 hover:border-yellow-400 hover:text-yellow-400 text-white font-bold px-8 py-3.5 rounded-xl transition duration-300">
            View All Amenities & Recovery Facilities →
          </Link>
        </div>
      </div>

      {/* Training Programs Preview */}
      <div className="relative group border-t border-zinc-900 bg-black">
        <TrainingSection />
        <div className="bg-black pb-16 text-center">
          <Link href="/training" className="inline-block bg-zinc-900 border border-zinc-800 hover:border-yellow-400 hover:text-yellow-400 text-white font-bold px-8 py-3.5 rounded-xl transition duration-300">
            Explore All Training Splits & Schedules →
          </Link>
        </div>
      </div>

      {/* Trainers Showcase */}
      <div className="relative group border-t border-zinc-900">
        <TrainersSection />
        <div className="bg-black pb-16 text-center">
          <Link href="/trainers" className="inline-block bg-zinc-900 border border-zinc-800 hover:border-yellow-400 hover:text-yellow-400 text-white font-bold px-8 py-3.5 rounded-xl transition duration-300">
            Meet Our Certified Coaches & Book a Slot →
          </Link>
        </div>
      </div>

      {/* Membership Pricing Section */}
      <div className="relative group border-t border-zinc-900">
        <MembershipSection />
      </div>

      {/* Testimonials Review Feed */}
      <TestimonialsSection />

      {/* BMI Calculator Summary */}
      <div className="relative group border-t border-zinc-900">
        <BMISection />
        <div className="bg-zinc-950 pb-16 text-center">
          <Link href="/bmi" className="inline-block bg-zinc-900 border border-zinc-800 hover:border-yellow-400 hover:text-yellow-400 text-white font-bold px-8 py-3.5 rounded-xl transition duration-300">
            Open Advanced Body Metric Calculator →
          </Link>
        </div>
      </div>

      {/* Gallery Highlight Grid */}
      <div className="relative group border-t border-zinc-900">
        <GallerySection />
        <div className="bg-zinc-950 pb-16 text-center">
          <Link href="/gallery" className="inline-block bg-zinc-900 border border-zinc-800 hover:border-yellow-400 hover:text-yellow-400 text-white font-bold px-8 py-3.5 rounded-xl transition duration-300">
            Open Full Grid Category Masonry Gallery →
          </Link>
        </div>
      </div>

      {/* Seasonal Campaigns Section */}
      <div className="relative group border-t border-zinc-900">
        <OffersSection />
        <div className="bg-black pb-16 text-center">
          <Link href="/offers" className="inline-block bg-zinc-900 border border-zinc-800 hover:border-yellow-400 hover:text-yellow-400 text-white font-bold px-8 py-3.5 rounded-xl transition duration-300">
            Claim Limited Coupons & Vouchers →
          </Link>
        </div>
      </div>

      {/* FAQ Accordion list */}
      <div className="relative group border-t border-zinc-900">
        <FAQSection />
        <div className="bg-zinc-950 pb-16 text-center">
          <Link href="/faq" className="inline-block bg-zinc-900 border border-zinc-800 hover:border-yellow-400 hover:text-yellow-400 text-white font-bold px-8 py-3.5 rounded-xl transition duration-300">
            Search Complete FAQ & Support Database →
          </Link>
        </div>
      </div>

      {/* Newsletter / Contact form Block */}
      <div className="relative group border-t border-zinc-900">
        <ContactSection />
      </div>

      <Footer />
    </div>
  );
}