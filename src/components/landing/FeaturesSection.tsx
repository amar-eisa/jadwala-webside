import { motion } from "framer-motion";
import { Shield, MousePointer2, Share2, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "منع التعارض الذكي",
    description: "خوارزميات متطورة تضمن عدم تداخل المواعيد للقاعات أو المحاضرين",
    color: "primary",
  },
  {
    icon: MousePointer2,
    title: "واجهة سحب وإفلات",
    description: "صمم جدولك بمرونة تامة دون الحاجة لتعقيدات تقنية",
    color: "accent",
  },
  {
    icon: Share2,
    title: "تصدير ومشاركة",
    description: "إمكانية تحميل الجداول بصيغة PDF أو مشاركتها مباشرة مع الطلاب عبر رابط سريع",
    color: "primary",
  },
  {
    icon: Building2,
    title: "دعم القاعات والمعامل",
    description: "إدارة الموارد المتاحة وتوزيعها حسب الطاقة الاستيعابية",
    color: "accent",
  },
];

const FeaturesSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="features" className="py-24 relative">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
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
            <span className="gradient-primary-text">المميزات الرئيسية</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            كل ما تحتاجه لإدارة جداول المحاضرات بكفاءة وسهولة
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full glass-card border-0 hover:shadow-glow transition-all duration-300 group overflow-hidden">
                <CardContent className="p-6 text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${
                      feature.color === "primary"
                        ? "bg-primary/10 text-primary"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    <feature.icon className="w-8 h-8" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
