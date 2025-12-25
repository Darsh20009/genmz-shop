import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, UserPlus, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function Employees() {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    role: "employee",
    permissions: ["orders"]
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const employees = Array.isArray(users) ? users.filter((u: any) => u.role !== "customer") : [];

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/register", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "تم إضافة الموظف بنجاح" });
      setIsAdding(false);
    },
  });

  const [depositData, setDepositData] = useState({ userId: "", amount: "", description: "" });
  const [isDepositing, setIsDepositing] = useState(false);

  const depositMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/wallet/deposit", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "تم إضافة الرصيد بنجاح" });
      setIsDepositing(false);
    },
  });

  return (
    <div className="p-8 space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">إدارة الموظفين</h1>
          <p className="text-muted-foreground text-sm">إضافة وتعديل صلاحيات فريق العمل</p>
        </div>
        
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="rounded-xl gap-2">
              <UserPlus className="w-4 h-4" />
              إضافة موظف
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة موظف جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4" dir="rtl">
              <div className="space-y-2 text-right">
                <Label>الاسم الكامل</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="مثال: أحمد محمد" />
              </div>
              <div className="space-y-2 text-right">
                <Label>رقم الهاتف (اسم المستخدم)</Label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="05xxxxxxxx" />
              </div>
              <div className="space-y-2 text-right">
                <Label>كلمة المرور</Label>
                <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="space-y-2 text-right">
                <Label>الدور الوظيفي</Label>
                <Select value={formData.role} onValueChange={v => setFormData({...formData, role: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">موظف</SelectItem>
                    <SelectItem value="support">دعم فني</SelectItem>
                    <SelectItem value="admin">مدير نظام</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full mt-4" onClick={() => mutation.mutate(formData)} disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="animate-spin" /> : "حفظ الموظف"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <Loader2 className="animate-spin mx-auto text-primary" />
        ) : employees.map((emp: any) => (
          <Card key={emp.id} className="border-none shadow-sm hover-elevate overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold">{emp.name}</h3>
                  <p className="text-xs text-muted-foreground">{emp.phone}</p>
                </div>
                <Badge className="mr-auto">{emp.role}</Badge>
              </div>
              
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">الصلاحيات الممنوحة</p>
                <div className="flex flex-wrap gap-2">
                  {(emp.permissions || ["orders"]).map((p: string) => (
                    <Badge key={p} variant="secondary" className="text-[9px] rounded-lg">
                      <Shield className="w-3 h-3 ml-1" />
                      {p === "orders" ? "الطلبات" : p}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t flex justify-between items-center">
                <Dialog open={isDepositing && depositData.userId === emp.id} onOpenChange={(open) => {
                  setIsDepositing(open);
                  if (open) setDepositData({ ...depositData, userId: emp.id });
                }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] gap-1">
                      <Plus className="w-3 h-3" />
                      شحن المحفظة
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="text-right">شحن محفظة {emp.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 text-right" dir="rtl">
                      <div className="space-y-2">
                        <Label>المبلغ (ر.س)</Label>
                        <Input type="number" value={depositData.amount} onChange={e => setDepositData({...depositData, amount: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>الملاحظات</Label>
                        <Input value={depositData.description} onChange={e => setDepositData({...depositData, description: e.target.value})} placeholder="مثال: مكافأة شهرية" />
                      </div>
                      <Button className="w-full" onClick={() => depositMutation.mutate(depositData)} disabled={depositMutation.isPending}>
                        تأكيد الشحن
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/5 rounded-lg h-8 px-3">
                  <Trash2 className="w-4 h-4 ml-1" />
                  حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
