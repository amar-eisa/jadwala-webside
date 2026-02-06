import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface Course {
  id: number;
  name: string;
  code: string;
}

interface Instructor {
  id: number;
  name: string;
}

interface Hall {
  id: number;
  name: string;
  type: string;
}

interface Schedule {
  id: number;
  course_id: number;
  instructor_id: number;
  hall_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  semester: string | null;
  academic_year: string | null;
  course_name: string;
  course_code: string;
  instructor_name: string;
  hall_name: string;
  hall_type: string;
}

const dayLabels: Record<string, string> = {
  sunday: "الأحد",
  monday: "الإثنين",
  tuesday: "الثلاثاء",
  wednesday: "الأربعاء",
  thursday: "الخميس",
};

const days = ["sunday", "monday", "tuesday", "wednesday", "thursday"];

const DashboardSchedules = () => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dbReady, setDbReady] = useState(true);

  const [form, setForm] = useState({
    course_id: "",
    instructor_id: "",
    hall_id: "",
    day_of_week: "",
    start_time: "",
    end_time: "",
    semester: "",
    academic_year: "",
  });

  const setupDb = useCallback(async () => {
    try {
      const res = await fetch("/api/db-setup", { method: "POST" });
      if (res.ok) {
        setDbReady(true);
        return true;
      }
    } catch {
      // DB may not be provisioned yet
    }
    return false;
  }, []);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [schedulesRes, coursesRes, instructorsRes, hallsRes] = await Promise.all([
        fetch("/api/schedules"),
        fetch("/api/courses"),
        fetch("/api/instructors"),
        fetch("/api/halls"),
      ]);

      if (schedulesRes.ok) setSchedules(await schedulesRes.json());
      if (coursesRes.ok) setCourses(await coursesRes.json());
      if (instructorsRes.ok) setInstructors(await instructorsRes.json());
      if (hallsRes.ok) setHalls(await hallsRes.json());
    } catch (error) {
      setDbReady(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await setupDb();
      await fetchAll();
    };
    init();
  }, [setupDb, fetchAll]);

  const handleSubmit = async () => {
    if (!form.course_id || !form.instructor_id || !form.hall_id || !form.day_of_week || !form.start_time || !form.end_time) {
      toast({ variant: "destructive", title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة" });
      return;
    }

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: parseInt(form.course_id),
          instructor_id: parseInt(form.instructor_id),
          hall_id: parseInt(form.hall_id),
          day_of_week: form.day_of_week,
          start_time: form.start_time,
          end_time: form.end_time,
          semester: form.semester || null,
          academic_year: form.academic_year || null,
        }),
      });

      if (res.status === 409) {
        const data = await res.json();
        toast({ variant: "destructive", title: "تعارض", description: data.error });
        return;
      }

      if (!res.ok) throw new Error("Failed to create schedule");

      toast({ title: "تم الإضافة", description: "تم إضافة الجدول بنجاح" });
      setDialogOpen(false);
      setForm({ course_id: "", instructor_id: "", hall_id: "", day_of_week: "", start_time: "", end_time: "", semester: "", academic_year: "" });
      fetchAll();
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في إضافة الجدول" });
    }
  };

  const deleteSchedule = async (id: number) => {
    try {
      const res = await fetch(`/api/schedules?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "تم الحذف", description: "تم حذف الجدول بنجاح" });
        fetchAll();
      }
    } catch {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في حذف الجدول" });
    }
  };

  if (!dbReady) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">قاعدة البيانات غير جاهزة</h2>
        <p className="text-muted-foreground mb-4">يرجى تشغيل التطبيق عبر Netlify Dev لتفعيل قاعدة البيانات</p>
        <Button onClick={() => { setupDb().then(() => fetchAll()); }}>
          <RefreshCw className="w-4 h-4 ml-2" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold"
        >
          <Calendar className="w-7 h-7 inline-block ml-2 text-primary" />
          إدارة الجداول
        </motion.h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAll}>
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 ml-2" />
                إضافة جدول
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg" dir="rtl">
              <DialogHeader>
                <DialogTitle>إضافة جدول جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>المقرر *</Label>
                  <Select value={form.course_id} onValueChange={(v) => setForm({ ...form, course_id: v })}>
                    <SelectTrigger><SelectValue placeholder="اختر المقرر" /></SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>المحاضر *</Label>
                  <Select value={form.instructor_id} onValueChange={(v) => setForm({ ...form, instructor_id: v })}>
                    <SelectTrigger><SelectValue placeholder="اختر المحاضر" /></SelectTrigger>
                    <SelectContent>
                      {instructors.map((i) => (
                        <SelectItem key={i.id} value={String(i.id)}>{i.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>القاعة *</Label>
                  <Select value={form.hall_id} onValueChange={(v) => setForm({ ...form, hall_id: v })}>
                    <SelectTrigger><SelectValue placeholder="اختر القاعة" /></SelectTrigger>
                    <SelectContent>
                      {halls.map((h) => (
                        <SelectItem key={h.id} value={String(h.id)}>{h.name} ({h.type === "lab" ? "معمل" : "قاعة"})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>اليوم *</Label>
                  <Select value={form.day_of_week} onValueChange={(v) => setForm({ ...form, day_of_week: v })}>
                    <SelectTrigger><SelectValue placeholder="اختر اليوم" /></SelectTrigger>
                    <SelectContent>
                      {days.map((d) => (
                        <SelectItem key={d} value={d}>{dayLabels[d]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>وقت البداية *</Label>
                    <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
                  </div>
                  <div>
                    <Label>وقت النهاية *</Label>
                    <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>الفصل الدراسي</Label>
                    <Input placeholder="مثال: الأول" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
                  </div>
                  <div>
                    <Label>السنة الأكاديمية</Label>
                    <Input placeholder="مثال: 2025-2026" value={form.academic_year} onChange={(e) => setForm({ ...form, academic_year: e.target.value })} />
                  </div>
                </div>
                <Button className="w-full gradient-primary text-primary-foreground" onClick={handleSubmit}>
                  إضافة الجدول
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Schedule Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">إجمالي المحاضرات</p>
              <p className="text-2xl font-bold">{schedules.length}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">المقررات</p>
              <p className="text-2xl font-bold">{courses.length}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">القاعات</p>
              <p className="text-2xl font-bold">{halls.length}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Schedule Table */}
      <Card>
        <CardHeader>
          <CardTitle>جدول المحاضرات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-muted-foreground">جاري تحميل البيانات...</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">لا توجد جداول بعد</p>
              <p className="text-sm text-muted-foreground">ابدأ بإضافة المقررات والقاعات والمحاضرين أولاً</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المقرر</TableHead>
                    <TableHead>المحاضر</TableHead>
                    <TableHead>القاعة</TableHead>
                    <TableHead>اليوم</TableHead>
                    <TableHead>الوقت</TableHead>
                    <TableHead>الفصل</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        {s.course_name}
                        <span className="text-xs text-muted-foreground block">{s.course_code}</span>
                      </TableCell>
                      <TableCell>{s.instructor_name}</TableCell>
                      <TableCell>
                        {s.hall_name}
                        <span className={`text-xs block ${s.hall_type === "lab" ? "text-purple-600" : "text-blue-600"}`}>
                          {s.hall_type === "lab" ? "معمل" : "قاعة"}
                        </span>
                      </TableCell>
                      <TableCell>{dayLabels[s.day_of_week] || s.day_of_week}</TableCell>
                      <TableCell dir="ltr" className="text-right">
                        {s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}
                      </TableCell>
                      <TableCell>
                        {s.semester && <span className="text-sm">{s.semester}</span>}
                        {s.academic_year && <span className="text-xs text-muted-foreground block">{s.academic_year}</span>}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteSchedule(s.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSchedules;
