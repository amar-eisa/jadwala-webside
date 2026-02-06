import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Lock, Mail, ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png";

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isSetupMode, setIsSetupMode] = useState(false);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await fetch("/api/auth/check-setup");
        if (res.ok) {
          const data = await res.json();
          if (data.setupRequired) {
            setIsSetupMode(true);
            setIsLogin(false);
            toast({
              title: "مرحباً بك في النظام",
              description: "يرجى إنشاء حساب المدير الأول للبدء",
              duration: 6000,
            });
          }
        }
      } catch (e) {
        console.error("Setup check failed", e);
      }
    };
    checkSetup();
  }, [toast]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(data.email, data.password);
        
        if (error) {
          toast({
            variant: "destructive",
            title: "خطأ في تسجيل الدخول",
            description: error.message === "Invalid login credentials" 
              ? "بيانات الدخول غير صحيحة" 
              : error.message,
          });
        } else {
          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: "جاري التوجيه للوحة التحكم...",
          });
          navigate("/dashboard");
        }
      } else {
        const { error } = await signUp(data.email, data.password);
        
        if (error) {
          toast({
            variant: "destructive",
            title: "خطأ في إنشاء الحساب",
            description: error.message,
          });
        } else {
          toast({
            title: "تم إنشاء الحساب بنجاح",
            description: "جاري تسجيل الدخول...",
          });
          // Attempt to sign in immediately after sign up
          const { error: signInError } = await signIn(data.email, data.password);
          if (!signInError) {
             navigate("/dashboard");
          } else {
             // If auto-signin fails (e.g. email verification needed), let the user know
             toast({
               title: "تحقق من بريدك الإلكتروني",
               description: "إذا طُلب منك تفعيل الحساب، يرجى التحقق من بريدك الإلكتروني.",
             });
          }
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ غير متوقع",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 right-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-accent/20 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass-card border-0 shadow-glow">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <img src={logo} alt="نظام جدولة" className="h-16 w-auto" />
            </div>
            <CardTitle className="text-2xl font-bold gradient-primary-text">
              {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {isLogin 
                ? "سجل دخولك للوصول إلى لوحة إدارة العملاء" 
                : "أنشئ حساباً جديداً للبدء في استخدام النظام"
              }
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        البريد الإلكتروني
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="admin@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        كلمة المرور
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
                  disabled={isLoading}
                >
                  {isLoading 
                    ? "جاري المعالجة..." 
                    : (isLogin ? "تسجيل الدخول" : "إنشاء الحساب")
                  }
                  <ArrowRight className="w-5 h-5 mr-2" />
                </Button>
              </form>
            </Form>

            {!isSetupMode && (
              <div className="mt-6 text-center space-y-4">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline text-sm font-medium"
                >
                  {isLogin 
                    ? "ليس لديك حساب؟ أنشئ حساباً جديداً" 
                    : "لديك حساب بالفعل؟ سجل دخولك"
                  }
                </button>
                
                <div className="block">
                  <a
                    href="/"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    العودة للصفحة الرئيسية
                  </a>
                </div>
              </div>
            )}
            {isSetupMode && (
              <div className="mt-6 text-center">
                 <p className="text-sm text-muted-foreground">جاري إعداد حساب المدير</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
