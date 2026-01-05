import { useQuery, useMutation } from "@tanstack/react-query";
import { User, InsertUser, Branch, employeePermissions, Role } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, UserPlus, Shield, Building, Trash2, Key, Mail, Phone, MoreHorizontal, BadgeCheck, ShieldAlert, User as UserIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";

export default function AdminStaff() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: branches } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });

  const { data: roles } = useQuery<Role[]>({
    queryKey: ["/api/admin/roles"],
  });

  const staff = users?.filter(u => u.role !== 'customer') || [];

  const form = useForm<InsertUser>({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      role: "employee",
      permissions: [],
      branchId: "",
      loginType: "dashboard",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await apiRequest("POST", "/api/admin/users", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "تم النجاح", description: "تم إضافة الموظف بنجاح" });
      setIsOpen(false);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "تم الحذف", description: "تم حذف حساب الموظف" });
    },
  });

  if (usersLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse font-bold">جاري جلب بيانات الفريق...</p>
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
                <Shield className="w-8 h-8" />
              </div>
              إدارة الفريق
            </h1>
            <p className="text-muted-foreground font-medium pr-14">إدارة الموظفين وتوزيع الصلاحيات على مختلف الفروع</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="h-14 rounded-2xl px-8 gap-3 shadow-xl shadow-primary/20 hover-elevate font-black text-lg">
                <UserPlus className="h-6 w-6" />
                إضافة موظف جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] rounded-[3rem] p-10 border-none shadow-2xl bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black text-right mb-8">تسجيل موظف جديد</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="font-black text-sm pr-2 text-slate-500">الاسم الكامل</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="أدخل اسم الموظف" className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold focus-visible:ring-primary/20" />
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
                          <FormLabel className="font-black text-sm pr-2 text-slate-500">رقم الهاتف</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="5XXXXXXXX" className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold text-left focus-visible:ring-primary/20" dir="ltr" />
                          </FormControl>
                          <FormMessage className="font-bold" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="font-black text-sm pr-2 text-slate-500">الدور الوظيفي</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none font-bold">
                                <SelectValue placeholder="اختر الدور" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl border-none shadow-xl">
                              <SelectItem value="admin">مدير (Admin)</SelectItem>
                              <SelectItem value="employee">موظف (Employee)</SelectItem>
                              <SelectItem value="cashier">كاشير (Cashier)</SelectItem>
                              {roles?.map(role => (
                                <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="branchId"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="font-black text-sm pr-2 text-slate-500">الفرع</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none font-bold">
                                <SelectValue placeholder="اختر الفرع" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl border-none shadow-xl">
                              <SelectItem value="main">المركز الرئيسي</SelectItem>
                              {branches?.map(b => (
                                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pr-2">
                      <ShieldAlert className="w-5 h-5 text-primary" />
                      <FormLabel className="font-black text-sm uppercase tracking-widest text-slate-900 dark:text-white">تحديد الصلاحيات</FormLabel>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700">
                      {employeePermissions.map((permission) => (
                        <FormField
                          key={permission}
                          control={form.control}
                          name="permissions"
                          render={({ field }) => (
                            <FormItem key={permission} className="flex flex-row items-center space-x-3 space-y-0 space-x-reverse">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(permission)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), permission])
                                      : field.onChange(field.value?.filter((value) => value !== permission));
                                  }}
                                  className="rounded-md border-slate-300 w-5 h-5"
                                />
                              </FormControl>
                              <FormLabel className="font-black text-[10px] uppercase text-slate-500 cursor-pointer">{permission}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-16 rounded-[1.5rem] bg-primary text-xl font-black shadow-lg shadow-primary/30 mt-4" disabled={createMutation.isPending}>
                    {createMutation.isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : "إتمم تسجيل الموظف"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {staff.map((user, idx) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden group hover-elevate transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
                  <div className="h-3 w-full bg-primary/10 group-hover:bg-primary transition-colors duration-700" />
                  <CardContent className="p-10 space-y-8">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-5">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 text-primary flex items-center justify-center rounded-[2rem] font-black text-3xl shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-700 group-hover:rotate-6">
                          {user.name.charAt(0)}
                        </div>
                        <div className="text-right">
                          <p className="font-black text-2xl text-slate-900 dark:text-white line-clamp-1">{user.name}</p>
                          <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl px-4 py-1 text-[10px] font-black uppercase border-none mt-2">
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all" onClick={() => deleteMutation.mutate(user.id)}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="space-y-4 bg-slate-50/50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100/50 dark:border-slate-700/50 transition-colors group-hover:bg-white dark:group-hover:bg-slate-800 shadow-inner">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                          <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                            <Phone className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-black" dir="ltr">{user.phone}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                          <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                            <Building className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-black">{branches?.find(b => b.id === user.branchId)?.name || "المركز الرئيسي"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-2xl shadow-sm">
                          <BadgeCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">حساب نشط</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                          <Shield className="w-5 h-5 text-slate-300" />
                        </div>
                        <span className="text-xs font-black text-slate-600 dark:text-slate-400">{user.permissions?.length || 0} صلاحيات</span>
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
