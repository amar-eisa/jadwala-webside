import { useRef } from "react";
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import RegistrationForm from "@/components/landing/RegistrationForm";
import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/landing/Footer";
import WhatsAppButton from "@/components/landing/WhatsAppButton";

const Index = () => {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen font-cairo" dir="rtl">
      <Header onRegisterClick={scrollToForm} />
      <HeroSection onRegisterClick={scrollToForm} />
      <FeaturesSection />
      <HowItWorksSection />
      <RegistrationForm formRef={formRef} />
      <ContactSection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
