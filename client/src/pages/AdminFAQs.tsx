import { useQuery, useMutation } from "@tanstack/react-query";
import { FAQ, InsertFAQ } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Plus, Trash2, Edit2, HelpCircle, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/Layout";
import { Textarea } from "@/components/ui/textarea";

export default function AdminFAQs() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: faqs, isLoading } = useQuery<FAQ[]>({
    queryKey: ["/api/faqs"],
  });

  const form = useForm<InsertFAQ>({
    defaultValues: {
      questionAr: "",
      questionEn: "",
      answerAr: "",
      answerEn: "",
      isActive: true,
      order: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertFAQ) => {
      const endpoint = editingId ? `/api/faqs/${editingId}` : "/api/faqs";
      const method = editingId ? "PATCH" : "POST";
      const res = await apiRequest(method, endpoint, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      toast({ title: "تم النجاح", description: editingId ? "تم تحديث السؤال بنجاح" : "تم إضافة السؤال بنجاح" });
      setIsOpen(false);
      setEditingId(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "خطأ", description: error.message });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/faqs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      toast({ title: "تم الحذف", description: "تم حذف السؤال بنجاح" });
    },
  });

  const handleEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    form.reset({
      questionAr: faq.questionAr,
      questionEn: faq.questionEn,
      answerAr: faq.answerAr,
      answerEn: faq.answerEn,
      isActive: faq.isActive,
      order: faq.order,
    });
    setIsOpen(true);
  };

  const filteredFaqs = faqs?.filter(faq => 
    faq.questionAr.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.questionEn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-8 space-y-8 bg-[#f8fafc] dark:bg-[#020617] min-h-screen" dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">الأسئلة الشائعة</h1>
              <p className="text-slate-500 text-sm font-medium">إدارة الأسئلة والأجوبة المتكررة</p>
            </div>
          </div>
          
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setEditingId(null);
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="h-12 rounded-xl px-6 gap-2 font-bold">
                <Plus className="h-5 w-5" />
                إضافة سؤال جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-right">{editingId ? "تعديل السؤال" : "إضافة سؤال جديد"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="questionAr"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="font-bold">السؤال (بالعربية)</FormLabel>
                          <FormControl>
                            <Input {...field} className="rounded-xl h-12" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="questionEn"
                      render={({ field }) => (
                        <FormItem className="text-left">
                          <FormLabel className="font-bold">Question (English)</FormLabel>
                          <FormControl>
                            <Input {...field} className="rounded-xl h-12" dir="ltr" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="answerAr"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="font-bold">الإجابة (بالعربية)</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="rounded-xl min-h-[120px]" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="answerEn"
                      render={({ field }) => (
                        <FormItem className="text-left">
                          <FormLabel className="font-bold">Answer (English)</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="rounded-xl min-h-[120px]" dir="ltr" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                          <FormLabel className="font-bold">تفعيل السؤال</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="order"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="font-bold">الترتيب</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} className="rounded-xl h-12" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full h-14 rounded-xl font-bold text-lg" disabled={createMutation.isPending}>
                    {createMutation.isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : (editingId ? "حفظ التعديلات" : "إضافة السؤال")}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border shadow-sm">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="بحث في الأسئلة..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none"
            />
          </div>
        </div>

        <div className="grid gap-6">
          <AnimatePresence>
            {filteredFaqs?.map((faq, idx) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="rounded-2xl border-none shadow-sm hover-elevate">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 p-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                        <Badge className={faq.isActive ? "bg-emerald-500" : "bg-slate-500"}>
                          {faq.isActive ? "مفعل" : "معطل"}
                        </Badge>
                        <Badge variant="outline">الترتيب: {faq.order}</Badge>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">{faq.questionAr}</h3>
                        <p className="text-slate-500 font-bold" dir="ltr" style={{ textAlign: 'left' }}>{faq.questionEn}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mr-4">
                      <Button size="icon" variant="ghost" className="rounded-xl h-10 w-10 bg-slate-50 dark:bg-slate-800" onClick={() => handleEdit(faq)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="rounded-xl h-10 w-10 bg-slate-50 dark:bg-slate-800 text-rose-500" onClick={() => deleteMutation.mutate(faq.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl mt-2">
                      <div className="space-y-2 border-l md:border-l-0 md:border-r border-slate-200 dark:border-slate-700 px-4">
                        <span className="text-xs font-black text-slate-400">الإجابة بالعربية</span>
                        <p className="text-sm font-medium leading-relaxed">{faq.answerAr}</p>
                      </div>
                      <div className="space-y-2 px-4" dir="ltr">
                        <span className="text-xs font-black text-slate-400">Answer in English</span>
                        <p className="text-sm font-medium leading-relaxed text-left">{faq.answerEn}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredFaqs?.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-dashed">
            <HelpCircle className="h-16 w-16 mx-auto mb-4 text-slate-200" />
            <p className="text-xl font-black text-slate-400">لا توجد أسئلة تطابق بحثك</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
