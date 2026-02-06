import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardLeads from "./pages/DashboardLeads";
import DashboardSchedules from "./pages/DashboardSchedules";
import DashboardCourses from "./pages/DashboardCourses";
import DashboardHalls from "./pages/DashboardHalls";
import DashboardInstructors from "./pages/DashboardInstructors";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardLeads />} />
              <Route path="schedules" element={<DashboardSchedules />} />
              <Route path="courses" element={<DashboardCourses />} />
              <Route path="halls" element={<DashboardHalls />} />
              <Route path="instructors" element={<DashboardInstructors />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
