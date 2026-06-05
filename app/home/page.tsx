import AboutSection from "@/src/components/organisms/AboutSection";
import ContactSection from "@/src/components/organisms/ContactSection";
import FeaturesSection from "@/src/components/organisms/FeaturesSection";
import Footer from "@/src/components/organisms/Footer";
import GallerySection from "@/src/components/organisms/GallerySection";
import HeroSection from "@/src/components/organisms/HeroSection";
import MembershipSection from "@/src/components/organisms/MembershipSection";
import Navbar from "@/src/components/organisms/Navbar";
import TestimonialsSection from "@/src/components/organisms/TestimonialsSection";
import TrainersSection from "@/src/components/organisms/TrainersSection";



export default function HomePage() {
  return (
    <>
    <Navbar />
     <div className="pt-24"></div>
      <HeroSection />
      <AboutSection />
       <FeaturesSection />
        <TrainersSection />
        <MembershipSection />
        <TestimonialsSection />
        <GallerySection />
        <ContactSection />
        <Footer />
    </>
  );
}