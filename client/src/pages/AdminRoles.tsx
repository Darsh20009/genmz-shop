import { useQuery, useMutation } from "@tanstack/react-query";
import { Role, InsertRole, employeePermissions } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Shield, Plus, Trash2, ShieldCheck, Key, Lock, Fingerprint } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/Layout";

export default function AdminRoles() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const { data: roles, isLoading } = useQuery<Role[]>({
    queryKey: ["/api/admin/roles"],
  });

  const form = useForm<InsertRole>({
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
      isSystem: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertRole) => {
      const res = await apiRequest("POST", "/api/admin/roles", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      toast({ title: "تم النجاح", description: "تم إضافة الدور بنجاح" });
      setIsOpen(false);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/roles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      toast({ title: "تم الحذف", description: "تم حذف الدور بنجاح" });
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse font-bold">جاري تحميل الأدوار...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-4 lg:p-8 space-y-8" dir="rtl">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border shadow-sm"
        >
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <ShieldCheck className="w-8 h-8" />
              </div>
              إدارة الأدوار
            </h1>
            <p className="text-muted-foreground font-medium pr-14">تحديد المسميات الوظيفية وصلاحيات الوصول لكل دور</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="h-14 rounded-2xl px-8 gap-3 shadow-xl shadow-primary/20 hover-elevate font-black text-lg">
                <Plus className="h-6 w-6" />
                إضافة دور جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] rounded-[3rem] p-10 border-none shadow-2xl bg-white dark:bg-slate-900">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black text-right mb-8">إنشاء مسمى وظيفي جديد</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-8">
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="font-black text-sm pr-2 text-slate-500">اسم الدور</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="مثال: مدير مخزن، محاسب" className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold focus-visible:ring-primary/20" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="font-black text-sm pr-2 text-slate-500">الوصف</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="وصف مهام هذا الدور" className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold focus-visible:ring-primary/20" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pr-2">
                      <Lock className="w-5 h-5 text-primary" />
                      <FormLabel className="font-black text-sm uppercase tracking-widest text-slate-900 dark:text-white">الصلاحيات المتاحة</FormLabel>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-2 border-slate-50 dark:border-slate-800 p-8 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-800/30">
                      {employeePermissions.map((permission) => (
                        <FormField
                          key={permission}
                          control={form.control}
                          name="permissions"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 space-x-reverse">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(permission)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), permission])
                                      : field.onChange(field.value?.filter((v) => v !== permission));
                                  }}
                                  className="w-5 h-5 rounded-md border-slate-300"
                                />
                              </FormControl>
                              <FormLabel className="font-black text-[10px] uppercase text-slate-500 cursor-pointer">{permission}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-16 rounded-[1.5rem] bg-primary text-xl font-black shadow-lg shadow-primary/30" disabled={createMutation.isPending}>
                    {createMutation.isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : "حفظ الدور الجديد"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {roles?.map((role, idx) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden group hover-elevate transition-all duration-500">
                  <div className="h-3 w-full bg-primary/10 group-hover:bg-primary transition-colors duration-700" />
                  <CardContent className="p-10 space-y-8">
                    <div className="flex justify-between items-start">
                      <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-[2rem] text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:rotate-6">
                        <Fingerprint className="w-8 h-8" />
                      </div>
                      {!role.isSystem && (
                        <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all" onClick={() => deleteMutation.mutate(role.id)}>
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-right">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">{role.name}</h3>
                      <p className="text-slate-400 font-bold text-sm leading-relaxed line-clamp-2">{role.description || "لا يوجد وصف محدد لهذا الدور حالياً"}</p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">الصلاحيات الممنوحة:</p>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.map((p) => (
                          <span key={p} className="px-4 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-black rounded-full border border-slate-100 dark:border-slate-700 uppercase">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
