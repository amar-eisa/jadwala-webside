import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Users,
  Calendar,
  BookOpen,
  Building2,
  GraduationCap,
  Menu,
  X,
  RefreshCw,
} from "lucide-react";
import logo from "@/assets/logo.png";

const sidebarItems = [
  { path: "/dashboard", label: "العملاء", icon: Users, exact: true },
  { path: "/dashboard/schedules", label: "الجداول", icon: Calendar },
  { path: "/dashboard/courses", label: "المقررات", icon: BookOpen },
  { path: "/dashboard/halls", label: "القاعات", icon: Building2 },
  { path: "/dashboard/instructors", label: "المحاضرين", icon: GraduationCap },
];

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="max-w-md p-8 text-center bg-card rounded-lg border">
          <h2 className="text-xl font-bold mb-4">غير مصرح لك بالوصول</h2>
          <p className="text-muted-foreground mb-4">
            ليس لديك صلاحية للوصول إلى لوحة التحكم
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate("/")} variant="outline">
              العودة للصفحة الرئيسية
            </Button>
            <Button 
              onClick={async () => {
                try {
                  toast({ title: "جاري الإصلاح", description: "جاري إعداد قاعدة البيانات..." });
                  // 1. Setup DB tables
                  await fetch("/api/db-setup");
                  // 2. Make me admin
                  if (user?.id) {
                    await fetch(`/api/init-admin?userId=${user.id}`);
                  }
                  toast({ title: "تم الإصلاح", description: "سيتم إعادة تحميل الصفحة..." });
                  // 3. Reload
                  setTimeout(() => window.location.reload(), 1000);
                } catch (e) {
                  console.error(e);
                  toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ أثناء محاولة إصلاح الصلاحيات" });
                }
              }} 
              variant="secondary"
              className="mt-2"
            >
              إصلاح الصلاحيات (Admin Setup)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isActive = (item: typeof sidebarItems[number]) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <img src={logo} alt="نظام جدولة" className="h-9 w-auto" />
            <div>
              <h1 className="text-lg font-bold gradient-primary-text">لوحة التحكم</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed md:sticky top-[57px] right-0 z-20
            h-[calc(100vh-57px)] w-64 bg-card border-l border-border
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
          `}
        >
          <nav className="p-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                    transition-colors duration-200
                    ${active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-57px)] p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
