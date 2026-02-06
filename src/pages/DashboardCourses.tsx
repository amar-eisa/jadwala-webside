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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { BookOpen, Plus, Trash2, Pencil, RefreshCw } from "lucide-react";

interface Course {
  id: number;
  name: string;
  code: string;
  department: string | null;
  credit_hours: number;
  student_count: number;
}

const DashboardCourses = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    department: "",
    credit_hours: "3",
    student_count: "0",
  });

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/courses");
      if (res.ok) setCourses(await res.json());
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const resetForm = () => {
    setForm({ name: "", code: "", department: "", credit_hours: "3", student_count: "0" });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.code) {
      toast({ variant: "destructive", title: "خطأ", description: "يرجى ملء اسم المقرر ورمزه" });
      return;
    }

    const payload = {
      ...(editingId ? { id: editingId } : {}),
      name: form.name,
      code: form.code,
      department: form.department || null,
      credit_hours: parseInt(form.credit_hours) || 3,
      student_count: parseInt(form.student_count) || 0,
    };

    try {
      const res = await fetch("/api/courses", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast({ title: editingId ? "تم التحديث" : "تم الإضافة", description: editingId ? "تم تحديث المقرر بنجاح" : "تم إضافة المقرر بنجاح" });
        setDialogOpen(false);
        resetForm();
        fetchCourses();
      }
    } catch {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في حفظ المقرر" });
    }
  };

  const editCourse = (course: Course) => {
    setForm({
      name: course.name,
      code: course.code,
      department: course.department || "",
      credit_hours: String(course.credit_hours),
      student_count: String(course.student_count),
    });
    setEditingId(course.id);
    setDialogOpen(true);
  };

  const deleteCourse = async (id: number) => {
    try {
      const res = await fetch(`/api/courses?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "تم الحذف", description: "تم حذف المقرر بنجاح" });
        fetchCourses();
      }
    } catch {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في حذف المقرر" });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold"
        >
          <BookOpen className="w-7 h-7 inline-block ml-2 text-primary" />
          إدارة المقررات
        </motion.h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchCourses}>
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 ml-2" />
                إضافة مقرر
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>{editingId ? "تعديل مقرر" : "إضافة مقرر جديد"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>اسم المقرر *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: مقدمة في البرمجة" />
                </div>
                <div>
                  <Label>رمز المقرر *</Label>
                  <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="مثال: CS101" dir="ltr" className="text-right" />
                </div>
                <div>
                  <Label>القسم</Label>
                  <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="مثال: علوم الحاسب" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>الساعات المعتمدة</Label>
                    <Input type="number" value={form.credit_hours} onChange={(e) => setForm({ ...form, credit_hours: e.target.value })} min="1" max="6" />
                  </div>
                  <div>
                    <Label>عدد الطلاب</Label>
                    <Input type="number" value={form.student_count} onChange={(e) => setForm({ ...form, student_count: e.target.value })} min="0" />
                  </div>
                </div>
                <Button className="w-full gradient-primary text-primary-foreground" onClick={handleSubmit}>
                  {editingId ? "تحديث" : "إضافة"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المقررات ({courses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-muted-foreground">جاري تحميل البيانات...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">لا توجد مقررات بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم المقرر</TableHead>
                    <TableHead>الرمز</TableHead>
                    <TableHead>القسم</TableHead>
                    <TableHead>الساعات</TableHead>
                    <TableHead>عدد الطلاب</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell dir="ltr" className="text-right">{course.code}</TableCell>
                      <TableCell>{course.department || "-"}</TableCell>
                      <TableCell>{course.credit_hours}</TableCell>
                      <TableCell>{course.student_count}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => editCourse(course)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteCourse(course.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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

export default DashboardCourses;
