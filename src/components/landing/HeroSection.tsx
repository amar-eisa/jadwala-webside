import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles, ArrowLeft } from "lucide-react";

interface HeroSectionProps {
  onRegisterClick: () => void;
}

const HeroSection = ({ onRegisterClick }: HeroSectionProps) => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 right-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-accent/20 blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, -20, 0],
          }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full bg-primary/10 blur-2xl"
        />
      </div>

      {/* Floating Calendar Icons */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-32 right-[15%] text-primary/30"
      >
        <Calendar className="w-16 h-16" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        className="absolute bottom-32 left-[10%] text-accent/30"
      >
        <Calendar className="w-12 h-12" />
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-10" dir="rtl">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">الحل الذكي لجدولة المحاضرات</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="gradient-primary-text">نظام جدولة</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl md:text-3xl font-semibold text-foreground/90 mb-4"
          >
            ذكاء وسهولة في تنظيم محاضراتك
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            الحل الأمثل للجامعات والمؤسسات التعليمية لإنشاء جداول دراسية خالية من التعارضات بضغطات زر قليلة
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={onRegisterClick}
              className="gradient-primary text-primary-foreground hover:opacity-90 shadow-glow text-lg px-8 py-6 rounded-xl"
            >
              سجل اهتمامك الآن
              <ArrowLeft className="w-5 h-5 mr-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-primary/30 hover:border-primary hover:bg-primary/5 text-lg px-8 py-6 rounded-xl"
              asChild
            >
              <a href="https://jadwala-v1.lovable.app" target="_blank" rel="noopener noreferrer">
                جرب النسخة التجريبية
              </a>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[
              { value: "+50", label: "جامعة" },
              { value: "+1000", label: "مستخدم" },
              { value: "99%", label: "رضا العملاء" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold gradient-primary-text">
                  {stat.value}
                </p>
                <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
