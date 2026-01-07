import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Upload, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminBranding() {
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#ffffff");
  const { toast } = useToast();

  const { data: branding = {} } = useQuery({
    queryKey: ["/api/branding"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/branding");
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (newSettings: any) => {
      const res = await apiRequest("PATCH", "/api/admin/settings", newSettings);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "تم التحديث", description: "تم حفظ الهوية البصرية بنجاح" });
    },
  });

  const handleUpdate = () => {
    mutation.mutate({ primaryColor, secondaryColor });
  };

  return (
    <Layout>
      <div className="p-6 space-y-6" dir="rtl">
        <div>
          <h1 className="text-3xl font-bold">هوية المتجر</h1>
          <p className="text-muted-foreground">تخصيص الألوان والشعار والصور الخاصة بمتجرك</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>الألوان</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>اللون الرئيسي</Label>
                <div className="flex gap-4 mt-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-16 h-10 cursor-pointer rounded"
                  />
                  <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>اللون الثانوي</Label>
                <div className="flex gap-4 mt-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-16 h-10 cursor-pointer rounded"
                  />
                  <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleUpdate}
                disabled={updateBrandingMutation.isPending}
              >
                {updateBrandingMutation.isPending ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
                حفظ الألوان
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الشعار والصور</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>شعار المتجر</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-secondary/50 mt-2">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">اسحب الملف هنا أو انقر للتحميل</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG (الحد الأقصى: 2MB)</p>
                </div>
              </div>

              <div>
                <Label>أيقونة المتجر (Favicon)</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-secondary/50 mt-2">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">اسحب الملف هنا أو انقر للتحميل</p>
                </div>
              </div>

              <div>
                <Label>صورة الغلاف</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-secondary/50 mt-2">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">اسحب الملف هنا أو انقر للتحميل</p>
                  <p className="text-xs text-muted-foreground mt-1">أبعاد موصى بها: 2048×614</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>نص الحقوق والنشر</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              defaultValue="جميع الحقوق محفوظة لدى متجري | ©"
              placeholder="نص حقوق الطبع والنشر"
            />
            <Button className="w-full">حفظ</Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
