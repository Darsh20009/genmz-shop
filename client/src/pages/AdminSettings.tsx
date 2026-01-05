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
      <div className="p-4 md:p-8 space-y-8" dir="rtl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-black">إعدادات المتجر</h1>
          </div>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/50 rounded-2xl mb-8">
            <TabsTrigger value="general" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">عام</TabsTrigger>
            <TabsTrigger value="branding" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">هوية المتجر</TabsTrigger>
            <TabsTrigger value="communication" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">التواصل</TabsTrigger>
            <TabsTrigger value="checkout" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">إتمام الشراء</TabsTrigger>
            <TabsTrigger value="working-hours" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">أوقات العمل</TabsTrigger>
            <TabsTrigger value="compliance" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">الامتثال (ZATCA)</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
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
                    <Label className="font-bold pr-2">اسم المتجر</Label>
                    <Input defaultValue={settings?.name} className="h-12 rounded-xl" />
                  </div>
                  <div className="grid gap-3">
                    <Label className="font-bold pr-2">العملة الافتراضية</Label>
                    <Input defaultValue={settings?.currency || "SAR"} className="h-12 rounded-xl" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-3">
                    <Label className="font-bold pr-2">الرقم الضريبي</Label>
                    <Input defaultValue={settings?.taxNumber} className="h-12 rounded-xl" placeholder="مثال: 300000000000003" />
                  </div>
                  <div className="grid gap-3">
                    <Label className="font-bold pr-2">نسبة الضريبة (%)</Label>
                    <Input type="number" defaultValue={settings?.taxPercentage || 15} className="h-12 rounded-xl" />
                  </div>
                </div>
                <Button 
                  onClick={() => mutation.mutate({})} 
                  className="h-12 px-8 rounded-xl font-bold"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "حفظ التغييرات"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <Card className="rounded-[2rem] border-none shadow-sm">
              <CardHeader>
                <CardTitle className="font-black flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  الهوية البصرية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-3">
                    <Label className="font-bold pr-2">اللون الرئيسي</Label>
                    <Input type="color" defaultValue={settings?.primaryColor || "#000000"} className="h-12 rounded-xl p-1 w-full" />
                  </div>
                  <div className="grid gap-3">
                    <Label className="font-bold pr-2">اللون الثانوي</Label>
                    <Input type="color" defaultValue={settings?.secondaryColor || "#ffffff"} className="h-12 rounded-xl p-1 w-full" />
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label className="font-bold pr-2">نص حقوق الطبع والنشر</Label>
                  <Input defaultValue={settings?.copyrightText} className="h-12 rounded-xl" />
                </div>
                <Button 
                  onClick={() => mutation.mutate({})} 
                  className="h-12 px-8 rounded-xl font-bold"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "حفظ الهوية"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communication" className="space-y-6">
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
                  <Switch checked={settings?.communication?.orderMessages} />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                  <div className="space-y-1">
                    <Label className="font-bold">تنبيهات السلات المتروكة</Label>
                    <p className="text-xs text-muted-foreground">إرسال رسائل تذكير تلقائية</p>
                  </div>
                  <Switch checked={settings?.communication?.abandonedCartAlerts} />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                  <div className="space-y-1">
                    <Label className="font-bold">طلبات التقييم</Label>
                    <p className="text-xs text-muted-foreground">تشجيع العملاء على تقييم المنتجات</p>
                  </div>
                  <Switch checked={settings?.communication?.reviewRequests} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkout" className="space-y-6">
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
                  <Switch checked={settings?.enableReviews} />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                  <div className="space-y-1">
                    <Label className="font-bold">قسم الأسئلة والأجوبة</Label>
                    <p className="text-xs text-muted-foreground">تمكين العملاء من طرح الأسئلة</p>
                  </div>
                  <Switch checked={settings?.enableQuestions} />
                </div>
              </CardContent>
            </Card>
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
