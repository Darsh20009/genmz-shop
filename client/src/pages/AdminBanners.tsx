import { useQuery, useMutation } from "@tanstack/react-query";
import { Banner, InsertBanner } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Plus, Trash2, Edit2, Image as ImageIcon, Eye, EyeOff, Sparkles, Link as LinkIcon, Camera } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/Layout";

export default function AdminBanners() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const { data: banners, isLoading } = useQuery<Banner[]>({
    queryKey: ["/api/banners"],
  });

  const form = useForm<InsertBanner>({
    defaultValues: {
      title: "",
      image: "",
      link: "",
      type: "banner",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertBanner) => {
      const endpoint = editingId ? `/api/banners/${editingId}` : "/api/banners";
      const method = editingId ? "PATCH" : "POST";
      const res = await apiRequest(method, endpoint, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      toast({ title: "تم النجاح", description: editingId ? "تم تحديث الإعلان بنجاح" : "تم إضافة الإعلان بنجاح" });
      setIsOpen(false);
      setEditingId(null);
      setImagePreview("");
      form.reset();
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "خطأ", description: error.message });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/banners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      toast({ title: "تم الحذف", description: "تم حذف الإعلان بنجاح" });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("فشل رفع الصورة");
      
      const { url } = await res.json();
      form.setValue("image", url);
      setImagePreview(url);
      toast({ title: "نجح", description: "تم رفع الصورة بنجاح" });
    } catch (err) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل رفع الصورة" });
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id);
    form.reset({
      title: banner.title,
      image: banner.image,
      link: banner.link,
      type: banner.type,
      isActive: banner.isActive,
    });
    setImagePreview(banner.image);
    setIsOpen(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse font-bold">جاري تحميل الإعلانات...</p>
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
                <Sparkles className="w-8 h-8" />
              </div>
              إدارة الإعلانات
            </h1>
            <p className="text-muted-foreground font-medium pr-14">إدارة الـ Banners الإعلانية والنوافذ المنبثقة</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setEditingId(null);
              setImagePreview("");
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="h-14 rounded-2xl px-8 gap-3 shadow-xl shadow-primary/20 hover-elevate font-black text-lg">
                <Plus className="h-6 w-6" />
                إضافة إعلان جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] rounded-[3rem] p-10 border-none shadow-2xl bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black text-right mb-8">{editingId ? "تعديل الإعلان" : "إنشاء إعلان جديد"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="text-right">
                        <FormLabel className="font-black text-sm pr-2 text-slate-500">عنوان الإعلان</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="أدخل عنواناً جذاباً" className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold focus-visible:ring-primary/20" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormLabel className="font-black text-sm pr-2 text-slate-500 block text-right">صورة الإعلان</FormLabel>
                    <div className="relative group overflow-hidden rounded-[2rem] border-4 border-dashed border-slate-100 dark:border-slate-800 transition-colors hover:border-primary/20">
                      {imagePreview ? (
                        <div className="relative aspect-video">
                          <img src={imagePreview} alt="معاينة" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              type="button" 
                              variant="secondary" 
                              className="rounded-xl h-12 font-black"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Camera className="h-5 w-5 ml-2" />
                              تغيير الصورة
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full aspect-video flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-primary transition-colors bg-slate-50/50 dark:bg-slate-800/50"
                        >
                          <div className="p-5 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm">
                            <ImageIcon className="h-10 w-10" />
                          </div>
                          <span className="font-black">اضغط لرفع صورة الإعلان</span>
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="link"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="font-black text-sm pr-2 text-slate-500">رابط التوجيه (اختياري)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} placeholder="https://..." className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold focus-visible:ring-primary/20 pl-12" />
                              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="font-black text-sm pr-2 text-slate-500">نوع الإعلان</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none font-bold">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl border-none shadow-xl">
                              <SelectItem value="banner">شريط إعلاني (Banner)</SelectItem>
                              <SelectItem value="popup">نافذة منبثقة (Popup)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-[2rem] bg-slate-50 dark:bg-slate-800 p-6 space-y-0 shadow-inner">
                        <div className="space-y-1">
                          <FormLabel className="font-black text-lg text-slate-900 dark:text-white">تفعيل الإعلان</FormLabel>
                          <p className="text-xs font-bold text-slate-400">سيظهر الإعلان للعملاء فور تفعيله</p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-primary"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full h-16 rounded-[1.5rem] bg-primary text-xl font-black shadow-lg shadow-primary/30 mt-4" disabled={createMutation.isPending || !form.getValues("image")}>
                    {createMutation.isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : (editingId ? "تحديث بيانات الإعلان" : "نشر الإعلان الآن")}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence>
            {banners?.map((banner, idx) => (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="overflow-hidden border-none shadow-sm bg-white dark:bg-slate-900 rounded-[3rem] group hover-elevate transition-all duration-500">
                  <div className="relative aspect-[21/9] overflow-hidden">
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                    <div className="absolute top-6 right-6 flex gap-3">
                      <Badge className={`rounded-full px-4 py-1.5 font-black text-[10px] border-none shadow-lg ${banner.isActive ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"}`}>
                        {banner.isActive ? <Eye className="h-3.5 w-3.5 ml-1.5" /> : <EyeOff className="h-3.5 w-3.5 ml-1.5" />}
                        {banner.isActive ? "مباشر" : "مسودة"}
                      </Badge>
                      <Badge className="rounded-full px-4 py-1.5 font-black text-[10px] bg-white/20 backdrop-blur-md text-white border-none shadow-lg">
                        {banner.type === "banner" ? "شريط" : "منبثقة"}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-2 flex-1">
                        <h3 className="font-black text-2xl text-slate-900 dark:text-white line-clamp-1">{banner.title}</h3>
                        {banner.link && (
                          <div className="flex items-center gap-2 text-primary font-bold text-sm">
                            <LinkIcon className="h-4 w-4" />
                            <span className="truncate max-w-[200px]" dir="ltr">{banner.link}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-all"
                          onClick={() => handleEdit(banner)}
                        >
                          <Edit2 className="h-5 w-5" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-all"
                          onClick={() => deleteMutation.mutate(banner.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {!isLoading && banners?.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="rounded-[3.5rem] border-dashed border-4 border-slate-100 dark:border-slate-800 bg-transparent p-20 text-center">
              <ImageIcon className="h-20 w-20 mx-auto mb-6 opacity-10 text-primary" />
              <p className="font-black text-2xl text-slate-300">لم يتم إضافة أي إعلانات بعد</p>
            </Card>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
