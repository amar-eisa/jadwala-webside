import { motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const contactInfo = [
  {
    icon: Mail,
    label: "البريد الإلكتروني",
    value: "jadwala.app@gmail.com",
    href: "mailto:jadwala.app@gmail.com",
  },
  {
    icon: Phone,
    label: "رقم الهاتف",
    value: "+96599679479",
    href: "tel:+96599679479",
  },
];

const ContactSection = () => {
  return (
    <section id="contact" className="py-24 bg-muted/30 relative">
      <div className="container mx-auto px-4 relative z-10" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-primary-text">تواصل معنا</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            نحن هنا للإجابة على استفساراتك ومساعدتك
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {contactInfo.map((item, index) => (
              <motion.a
                key={index}
                href={item.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="block"
              >
                <Card className="h-full glass-card border-0 hover:shadow-glow transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4"
                    >
                      <item.icon className="w-7 h-7" />
                    </motion.div>
                    <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                    <p className="font-semibold group-hover:text-primary transition-colors" dir="ltr">
                      {item.value}
                    </p>
                  </CardContent>
                </Card>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
