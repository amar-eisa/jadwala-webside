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
import { Building2, Plus, Trash2, Pencil, RefreshCw } from "lucide-react";

interface Hall {
  id: number;
  name: string;
  type: string;
  capacity: number;
  building: string | null;
}

const DashboardHalls = () => {
  const { toast } = useToast();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    type: "hall",
    capacity: "30",
    building: "",
  });

  const fetchHalls = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/halls");
      if (res.ok) setHalls(await res.json());
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHalls();
  }, [fetchHalls]);

  const resetForm = () => {
    setForm({ name: "", type: "hall", capacity: "30", building: "" });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.name) {
      toast({ variant: "destructive", title: "خطأ", description: "يرجى إدخال اسم القاعة" });
      return;
    }

    const payload = {
      ...(editingId ? { id: editingId } : {}),
      name: form.name,
      type: form.type,
      capacity: parseInt(form.capacity) || 30,
      building: form.building || null,
    };

    try {
      const res = await fetch("/api/halls", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast({ title: editingId ? "تم التحديث" : "تم الإضافة", description: editingId ? "تم تحديث القاعة بنجاح" : "تم إضافة القاعة بنجاح" });
        setDialogOpen(false);
        resetForm();
        fetchHalls();
      }
    } catch {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في حفظ القاعة" });
    }
  };

  const editHall = (hall: Hall) => {
    setForm({
      name: hall.name,
      type: hall.type,
      capacity: String(hall.capacity),
      building: hall.building || "",
    });
    setEditingId(hall.id);
    setDialogOpen(true);
  };

  const deleteHall = async (id: number) => {
    try {
      const res = await fetch(`/api/halls?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "تم الحذف", description: "تم حذف القاعة بنجاح" });
        fetchHalls();
      }
    } catch {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في حذف القاعة" });
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
          <Building2 className="w-7 h-7 inline-block ml-2 text-primary" />
          إدارة القاعات والمعامل
        </motion.h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchHalls}>
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 ml-2" />
                إضافة قاعة
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>{editingId ? "تعديل قاعة" : "إضافة قاعة جديدة"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>اسم القاعة *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: قاعة A101" />
                </div>
                <div>
                  <Label>النوع</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hall">قاعة</SelectItem>
                      <SelectItem value="lab">معمل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>السعة</Label>
                  <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} min="1" />
                </div>
                <div>
                  <Label>المبنى</Label>
                  <Input value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} placeholder="مثال: المبنى الرئيسي" />
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
          <CardTitle>قائمة القاعات ({halls.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-muted-foreground">جاري تحميل البيانات...</p>
            </div>
          ) : halls.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">لا توجد قاعات بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم القاعة</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>السعة</TableHead>
                    <TableHead>المبنى</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {halls.map((hall) => (
                    <TableRow key={hall.id}>
                      <TableCell className="font-medium">{hall.name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${hall.type === "lab" ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"}`}>
                          {hall.type === "lab" ? "معمل" : "قاعة"}
                        </span>
                      </TableCell>
                      <TableCell>{hall.capacity}</TableCell>
                      <TableCell>{hall.building || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => editHall(hall)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteHall(hall.id)}>
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

export default DashboardHalls;
