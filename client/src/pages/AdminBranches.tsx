import { useQuery, useMutation } from "@tanstack/react-query";
import { Branch, InsertBranch } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Plus, MapPin, Phone, Trash2, Edit2, Map, Power, Globe, Building2, Store } from "lucide-react";
import { LocationMap } from "@/components/LocationMap";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";

export default function AdminBranches() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const { data: branches, isLoading } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });

  const form = useForm<InsertBranch>({
    defaultValues: {
      name: "",
      location: "",
      phone: "",
      isActive: true,
      posEnabled: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertBranch) => {
      const res = await apiRequest("POST", "/api/branches", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branches"] });
      toast({ title: "تم النجاح", description: "تم إضافة الفرع بنجاح" });
      setIsOpen(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertBranch>) => {
      const res = await apiRequest("PATCH", `/api/branches/${editingBranch?.id || (data as any).id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branches"] });
      toast({ title: "تم التحديث", description: "تم تحديث بيانات الفرع" });
      setEditingBranch(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/branches/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branches"] });
      toast({ title: "تم الحذف", description: "تم حذف الفرع بنجاح" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">جاري تحميل قائمة الفروع...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-4 lg:p-8 space-y-8" dir="rtl">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border shadow-sm"
      >
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Building2 className="w-8 h-8" />
            </div>
            إدارة الفروع
          </h1>
          <p className="text-muted-foreground font-medium pr-14">تحكم في مواقع فروعك وحالة توافر الخدمات بكل مرونة</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="h-14 rounded-2xl px-8 gap-3 shadow-xl shadow-primary/20 hover-elevate font-black text-lg">
              <Plus className="h-6 w-6" />
              إضافة فرع جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-[3rem] p-10 border-none shadow-2xl bg-white dark:bg-slate-900">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-right mb-8">تسجيل فرع جديد</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel className="font-black text-sm pr-2 text-slate-500">اسم الفرع</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="أدخل اسم الفرع" className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold focus-visible:ring-primary/20" />
                      </FormControl>
                      <FormMessage className="font-bold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel className="font-black text-sm pr-2 text-slate-500">الموقع الجغرافي</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="مثلاً: الرياض، حي المروج" className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold focus-visible:ring-primary/20" />
                      </FormControl>
                      <FormMessage className="font-bold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel className="font-black text-sm pr-2 text-slate-500">رقم هاتف الفرع</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="05XXXXXXXX" className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold text-left focus-visible:ring-primary/20" dir="ltr" />
                      </FormControl>
                      <FormMessage className="font-bold" />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-16 rounded-[1.5rem] bg-primary text-xl font-black shadow-lg shadow-primary/30 mt-4" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : "تأكيد الإضافة"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches?.map((branch, idx) => (
          <motion.div
            key={branch.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden group hover-elevate transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
              <div className={`h-3 w-full transition-colors duration-700 ${branch.isActive ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              <CardContent className="p-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-5">
                    <div className={`w-20 h-20 flex items-center justify-center rounded-[2rem] transition-all duration-700 group-hover:rotate-6 ${branch.isActive ? 'bg-emerald-50 text-emerald-600 shadow-inner' : 'bg-slate-50 text-slate-300'}`}>
                      <Store className="w-10 h-10" />
                    </div>
                    <div className="text-right">
                      <p className="font-black text-2xl text-slate-900 dark:text-white line-clamp-1">{branch.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`w-2 h-2 rounded-full ${branch.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                        <span className={`text-xs font-black uppercase tracking-widest ${branch.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {branch.isActive ? 'نشط في النظام' : 'متوقف حالياً'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary hover:bg-primary/10 transition-all" onClick={() => setEditingBranch(branch)}>
                      <Edit2 className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all" onClick={() => deleteMutation.mutate(branch.id)}>
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-5 bg-slate-50/50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100/50 dark:border-slate-700/50 transition-colors group-hover:bg-white dark:group-hover:bg-slate-800 shadow-inner">
                  <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                    <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-black">{branch.location || "لم يتم تحديد الموقع"}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                    <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-black" dir="ltr">{branch.phone || "لا يوجد هاتف"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">تعديل الحالة</span>
                    <Badge variant="outline" className={`rounded-xl px-4 py-1 font-black text-[10px] border-none ${branch.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {branch.isActive ? 'متاح للطلب' : 'غير متاح'}
                    </Badge>
                  </div>
                  <Button 
                    variant="default"
                    className={`h-14 rounded-2xl px-8 font-black text-sm shadow-lg transition-all active-elevate-2 ${branch.isActive ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'}`}
                    onClick={() => updateMutation.mutate({ id: branch.id, isActive: !branch.isActive } as any)}
                  >
                    <Power className="w-4 h-4 ml-3" />
                    {branch.isActive ? 'إيقاف الفرع' : 'تشغيل الفرع'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
