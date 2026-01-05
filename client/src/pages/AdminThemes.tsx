import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

export default function AdminThemes() {
  return (
    <Layout>
      <div className="p-8 space-y-8" dir="rtl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black">قوالب المتجر</h1>
          <Palette className="h-8 w-8 text-primary" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="rounded-[2rem] border-2 border-primary shadow-lg overflow-hidden">
            <CardHeader className="bg-primary/5">
              <CardTitle className="font-black">سوفت (الحالي)</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="aspect-video bg-muted rounded-2xl flex items-center justify-center font-bold text-muted-foreground">
                معاينة التصميم
              </div>
              <p className="text-sm font-medium text-muted-foreground">التصميم المعتمد حالياً في واجهة المتجر</p>
              <Button className="w-full h-12 rounded-xl font-black">تخصيص القالب</Button>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="font-black">المثالي</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="aspect-video bg-muted rounded-2xl flex items-center justify-center font-bold text-muted-foreground">
                معاينة التصميم
              </div>
              <Button variant="outline" className="w-full h-12 rounded-xl font-black">تفعيل هذا القالب</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
