import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Loader2, Shield, Globe, ShoppingCart, Palette, FileText, Clock, Link as LinkIcon, Bell, MessageSquare, Star } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

export default function AdminSettings() {
  const { toast } = useToast();
  const [currentLocation] = useLocation();
  const { data: settings, isLoading } = useQuery<any>({
    queryKey: ["/api/settings"],
  });

  const mutation = useMutation({
    mutationFn: async (newSettings: any) => {
      const res = await apiRequest("PATCH", "/api/admin/settings", newSettings);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "تم التحديث", description: "تم حفظ إعدادات المتجر بنجاح" });
    },
  });

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    mutation.mutate({
      nameAr: formData.get("nameAr"),
      nameEn: formData.get("nameEn"),
      currency: formData.get("currency"),
      taxNumber: formData.get("taxNumber"),
      taxPercentage: Number(formData.get("taxPercentage")),
    });
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    mutation.mutate({
      primaryColor: formData.get("primaryColor"),
      secondaryColor: formData.get("secondaryColor"),
      copyrightTextAr: formData.get("copyrightTextAr"),
      copyrightTextEn: formData.get("copyrightTextEn"),
    });
  };

  const handleSaveCommunication = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    mutation.mutate({
      communication: {
        orderMessages: formData.get("orderMessages") === "on",
        abandonedCartAlerts: formData.get("abandonedCartAlerts") === "on",
        reviewRequests: formData.get("reviewRequests") === "on",
      }
    });
  };

  const handleSaveCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    mutation.mutate({
      enableReviews: formData.get("enableReviews") === "on",
      enableQuestions: formData.get("enableQuestions") === "on",
    });
  };

  const searchParams = new URLSearchParams(currentLocation.split('?')[1]);
  const defaultTab = searchParams.get('tab') || 'general';

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
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">الإعدادات</h1>
              <p className="text-slate-500 text-sm font-medium">إدارة تفاصيل المتجر والهوية</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto h-auto p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8 border border-slate-200 dark:border-slate-700">
            <TabsTrigger value="general" className="rounded-xl px-6 py-2.5 font-bold text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all">عام</TabsTrigger>
            <TabsTrigger value="branding" className="rounded-xl px-6 py-2.5 font-bold text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all">هوية المتجر</TabsTrigger>
            <TabsTrigger value="communication" className="rounded-xl px-6 py-2.5 font-bold text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all">التواصل</TabsTrigger>
            <TabsTrigger value="checkout" className="rounded-xl px-6 py-2.5 font-bold text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all">إتمام الشراء</TabsTrigger>
            <TabsTrigger value="working-hours" className="rounded-xl px-6 py-2.5 font-bold text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all">أوقات العمل</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <form onSubmit={handleSaveGeneral}>
              <Card className="rounded-[2rem] border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="font-black flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    البيانات الأساسية والمالية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid gap-3">
                      <Label className="font-bold pr-2">اسم المتجر (بالعربية)</Label>
                      <Input name="nameAr" defaultValue={settings?.nameAr} className="h-12 rounded-xl" />
                    </div>
                    <div className="grid gap-3">
                      <Label className="font-bold pl-2">Store Name (English)</Label>
                      <Input name="nameEn" defaultValue={settings?.nameEn} className="h-12 rounded-xl" dir="ltr" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid gap-3">
                      <Label className="font-bold pr-2">العملة الافتراضية</Label>
                      <Input name="currency" defaultValue={settings?.currency || "SAR"} className="h-12 rounded-xl" />
                    </div>
                    <div className="grid gap-3">
                      <Label className="font-bold pr-2">الرقم الضريبي</Label>
                      <Input name="taxNumber" defaultValue={settings?.taxNumber} className="h-12 rounded-xl" placeholder="مثال: 300000000000003" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid gap-3">
                      <Label className="font-bold pr-2">نسبة الضريبة (%)</Label>
                      <Input name="taxPercentage" type="number" defaultValue={settings?.taxPercentage || 15} className="h-12 rounded-xl" />
                    </div>
                  </div>
                  <Button 
                    type="submit"
                    className="h-12 px-8 rounded-xl font-bold"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "حفظ التغييرات"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <form onSubmit={handleSaveBranding}>
              <Card className="rounded-[1.5rem] border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <CardTitle className="font-black text-lg flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    الهوية البصرية
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label className="font-bold text-sm pr-1">اللون الرئيسي</Label>
                      <div className="flex gap-4">
                        <Input name="primaryColor" type="color" defaultValue={settings?.primaryColor || "#000000"} className="h-14 w-14 rounded-xl p-1 cursor-pointer" />
                        <Input defaultValue={settings?.primaryColor || "#000000"} className="h-14 flex-1 rounded-xl font-mono text-center" readOnly />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label className="font-bold text-sm pr-1">اللون الثانوي</Label>
                      <div className="flex gap-4">
                        <Input name="secondaryColor" type="color" defaultValue={settings?.secondaryColor || "#ffffff"} className="h-14 w-14 rounded-xl p-1 cursor-pointer" />
                        <Input defaultValue={settings?.secondaryColor || "#ffffff"} className="h-14 flex-1 rounded-xl font-mono text-center" readOnly />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label className="font-bold text-sm pr-1">نص حقوق المتجر (بالعربية)</Label>
                      <Input name="copyrightTextAr" defaultValue={settings?.copyrightTextAr} className="h-14 rounded-xl" placeholder="© 2024 جميع الحقوق محفوظة" />
                    </div>
                    <div className="space-y-4">
                      <Label className="font-bold text-sm pl-1">Copyright Text (English)</Label>
                      <Input name="copyrightTextEn" defaultValue={settings?.copyrightTextEn} className="h-14 rounded-xl" placeholder="© 2024 All Rights Reserved" dir="ltr" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-slate-50 dark:border-slate-800">
                    <Button 
                      type="submit"
                      className="h-12 px-10 rounded-xl font-bold bg-primary shadow-lg shadow-primary/20"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "حفظ الهوية"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="communication" className="space-y-6">
            <form onSubmit={handleSaveCommunication}>
              <Card className="rounded-[2rem] border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="font-black flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    تنبيهات العملاء
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                    <div className="space-y-1">
                      <Label className="font-bold">رسائل الطلبات</Label>
                      <p className="text-xs text-muted-foreground">تنبيه العميل عند تغيير حالة الطلب</p>
                    </div>
                    <Switch name="orderMessages" defaultChecked={settings?.communication?.orderMessages} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                    <div className="space-y-1">
                      <Label className="font-bold">تنبيهات السلات المتروكة</Label>
                      <p className="text-xs text-muted-foreground">إرسال رسائل تذكير تلقائية</p>
                    </div>
                    <Switch name="abandonedCartAlerts" defaultChecked={settings?.communication?.abandonedCartAlerts} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                    <div className="space-y-1">
                      <Label className="font-bold">طلبات التقييم</Label>
                      <p className="text-xs text-muted-foreground">تشجيع العملاء على تقييم المنتجات</p>
                    </div>
                    <Switch name="reviewRequests" defaultChecked={settings?.communication?.reviewRequests} />
                  </div>
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ إعدادات التواصل"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="checkout" className="space-y-6">
            <form onSubmit={handleSaveCheckout}>
              <Card className="rounded-[2rem] border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="font-black flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    إعدادات الشراء
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                    <div className="space-y-1">
                      <Label className="font-bold">تفعيل التقييمات</Label>
                      <p className="text-xs text-muted-foreground">السماح للعملاء بتقييم المنتجات</p>
                    </div>
                    <Switch name="enableReviews" defaultChecked={settings?.enableReviews} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                    <div className="space-y-1">
                      <Label className="font-bold">قسم الأسئلة والأجوبة</Label>
                      <p className="text-xs text-muted-foreground">تمكين العملاء من طرح الأسئلة</p>
                    </div>
                    <Switch name="enableQuestions" defaultChecked={settings?.enableQuestions} />
                  </div>
                  <Button type="submit" className="h-12 px-8 rounded-xl font-bold" disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ إعدادات الشراء"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="working-hours" className="space-y-6">
            <Card className="rounded-[2rem] border-none shadow-sm">
              <CardHeader>
                <CardTitle className="font-black flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  أوقات العمل الرسمية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">حدد ساعات العمل التي يكون فيها متجرك متاحاً لاستقبال الطلبات</p>
                {["الأحد", "الأثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"].map((day) => (
                  <div key={day} className="flex items-center gap-4 p-3 border rounded-xl">
                    <span className="font-bold w-20">{day}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <Input type="time" className="rounded-lg" defaultValue="09:00" />
                      <span>إلى</span>
                      <Input type="time" className="rounded-lg" defaultValue="22:00" />
                    </div>
                    <Switch />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
