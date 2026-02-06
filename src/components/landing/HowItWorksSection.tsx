import { motion } from "framer-motion";
import { Database, Wand2, Download, ArrowDown } from "lucide-react";

const steps = [
  {
    icon: Database,
    step: "01",
    title: "إدخال البيانات",
    description: "أضف أسماء المحاضرين، المواد الدراسية، والقاعات المتاحة بسهولة",
  },
  {
    icon: Wand2,
    step: "02",
    title: "توليد الجدول تلقائياً",
    description: "النظام يولد جدولاً ذكياً خالياً من التعارضات في ثوانٍ",
  },
  {
    icon: Download,
    step: "03",
    title: "التعديل والتصدير",
    description: "عدّل الجدول حسب رغبتك وصدّره بصيغة PDF أو شاركه مباشرة",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10" dir="rtl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-primary-text">كيف يعمل النظام؟</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            ثلاث خطوات بسيطة للحصول على جدول دراسي مثالي
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              <div className="flex items-center gap-8 mb-8">
                {/* Step Number & Icon */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex-shrink-0 relative"
                >
                  <div className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center shadow-glow">
                    <step.icon className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <span className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-lg shadow-lg">
                    {step.step}
                  </span>
                </motion.div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector Arrow */}
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="flex justify-start mr-10 mb-8"
                >
                  <ArrowDown className="w-8 h-8 text-primary/40" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
