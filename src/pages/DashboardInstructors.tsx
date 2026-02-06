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
import { GraduationCap, Plus, Trash2, Pencil, RefreshCw } from "lucide-react";

interface Instructor {
  id: number;
  name: string;
  email: string | null;
  department: string | null;
}

const DashboardInstructors = () => {
  const { toast } = useToast();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
  });

  const fetchInstructors = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/instructors");
      if (res.ok) setInstructors(await res.json());
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const resetForm = () => {
    setForm({ name: "", email: "", department: "" });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.name) {
      toast({ variant: "destructive", title: "خطأ", description: "يرجى إدخال اسم المحاضر" });
      return;
    }

    const payload = {
      ...(editingId ? { id: editingId } : {}),
      name: form.name,
      email: form.email || null,
      department: form.department || null,
    };

    try {
      const res = await fetch("/api/instructors", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast({ title: editingId ? "تم التحديث" : "تم الإضافة", description: editingId ? "تم تحديث المحاضر بنجاح" : "تم إضافة المحاضر بنجاح" });
        setDialogOpen(false);
        resetForm();
        fetchInstructors();
      }
    } catch {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في حفظ المحاضر" });
    }
  };

  const editInstructor = (instructor: Instructor) => {
    setForm({
      name: instructor.name,
      email: instructor.email || "",
      department: instructor.department || "",
    });
    setEditingId(instructor.id);
    setDialogOpen(true);
  };

  const deleteInstructor = async (id: number) => {
    try {
      const res = await fetch(`/api/instructors?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "تم الحذف", description: "تم حذف المحاضر بنجاح" });
        fetchInstructors();
      }
    } catch {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في حذف المحاضر" });
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
          <GraduationCap className="w-7 h-7 inline-block ml-2 text-primary" />
          إدارة المحاضرين
        </motion.h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchInstructors}>
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 ml-2" />
                إضافة محاضر
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>{editingId ? "تعديل محاضر" : "إضافة محاضر جديد"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>اسم المحاضر *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: د. أحمد محمد" />
                </div>
                <div>
                  <Label>البريد الإلكتروني</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@university.edu" dir="ltr" className="text-right" />
                </div>
                <div>
                  <Label>القسم</Label>
                  <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="مثال: علوم الحاسب" />
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
          <CardTitle>قائمة المحاضرين ({instructors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-muted-foreground">جاري تحميل البيانات...</p>
            </div>
          ) : instructors.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">لا يوجد محاضرين بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم المحاضر</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>القسم</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {instructors.map((instructor) => (
                    <TableRow key={instructor.id}>
                      <TableCell className="font-medium">{instructor.name}</TableCell>
                      <TableCell dir="ltr" className="text-right">{instructor.email || "-"}</TableCell>
                      <TableCell>{instructor.department || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => editInstructor(instructor)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteInstructor(instructor.id)}>
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

export default DashboardInstructors;
