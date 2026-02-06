import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-4" dir="rtl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Brand */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-3"
          >
            <img src={logo} alt="نظام جدولة" className="h-8 w-auto" />
            <span className="text-lg font-bold gradient-primary-text">نظام جدولة</span>
          </motion.div>

          {/* Quick Links */}
          <div className="flex items-center gap-6 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
              المميزات
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
              كيف يعمل
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
              التواصل
            </a>
          </div>

          {/* Copyright */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm text-muted-foreground"
          >
            © {currentYear} نظام جدولة. جميع الحقوق محفوظة.
          </motion.p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
