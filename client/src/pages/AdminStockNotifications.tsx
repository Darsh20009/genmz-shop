import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Package, AlertTriangle, Settings, Bell, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function AdminStockNotifications() {
  const { toast } = useToast();
  const [minStockLevel, setMinStockLevel] = useState("10");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/settings"],
    onSuccess: (data: any) => {
      if (data) {
        setMinStockLevel(data.minStockLevel?.toString() || "10");
        setNotificationsEnabled(data.enableStockNotifications ?? true);
      }
    }
  });

  useEffect(() => {
    if (settings) {
      setMinStockLevel(settings.minStockLevel?.toString() || "10");
      setNotificationsEnabled(settings.enableStockNotifications ?? true);
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/settings/stock-notifications", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "تم تحديث إعدادات التنبيهات بنجاح" });
    },
  });

  const handleSave = () => {
    updateSettingsMutation.mutate({
      enabled: notificationsEnabled,
      minStockLevel: parseInt(minStockLevel) || 10
    });
  };

  const lowStockProducts = products.filter((p: any) => {
    const totalStock = p.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
    return totalStock <= (parseInt(minStockLevel) || 10);
  });

  return (
    <Layout>
      <div className="p-8 space-y-8" dir="rtl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black mb-2">تنبيهات المخزون</h1>
            <p className="text-muted-foreground font-bold">إدارة تنبيهات المنتجات ذات المخزون المنخفض</p>
          </div>
          <Button variant="outline" className="rounded-xl h-12 gap-2" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/products"] })}>
            <RefreshCcw className="w-4 h-4" />
            تحديث البيانات
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                إعدادات التنبيه
              </CardTitle>
              <CardDescription>تحديد متى يتم إرسال التنبيه</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications-toggle" className="font-bold">تفعيل التنبيهات</Label>
                <Switch 
                  id="notifications-toggle"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">الحد الأدنى للمخزون</Label>
                <Input 
                  type="number"
                  value={minStockLevel}
                  onChange={(e) => setMinStockLevel(e.target.value)}
                  placeholder="10"
                />
                <p className="text-xs text-muted-foreground">سيتم تنبيهك عندما يصل إجمالي مخزون المنتج إلى هذا العدد أو أقل</p>
              </div>
              <Button 
                className="w-full rounded-xl font-black h-12" 
                onClick={handleSave}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  منتجات منخفضة المخزون
                </CardTitle>
                <div className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm font-black">
                  {lowStockProducts.length} منتجات
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="text-center p-8">جاري تحميل المنتجات...</div>
              ) : lowStockProducts.length === 0 ? (
                <div className="text-center p-12 space-y-4">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto text-success">
                    <Package className="w-8 h-8" />
                  </div>
                  <p className="font-bold text-muted-foreground">جميع المنتجات متوفرة بمخزون جيد</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lowStockProducts.map((product: any) => {
                    const totalStock = product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
                    return (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-full h-full p-2 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-black text-lg">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.variants?.length || 0} متغيرات</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-black text-2xl text-destructive">{totalStock}</p>
                          <p className="text-xs text-muted-foreground">متوفر في المخزون</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
