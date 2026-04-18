import { useQuery, useMutation } from "@tanstack/react-query";
import { AbandonedCart } from "@shared/schema";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Mail, TrendingUp, Bell, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function AdminAbandonedCarts() {
  const { toast } = useToast();
  const { data: response, isLoading } = useQuery<any>({
    queryKey: ["/api/abandoned-carts"],
  });

  const carts = Array.isArray(response?.data) ? response.data : [];

  const sendRecoveryMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/abandoned-carts/${id}/recover`, {});
    },
    onSuccess: () => {
      toast({ title: "تم إرسال تنبيه الاسترجاع بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/abandoned-carts"] });
    }
  });

  return (
    <Layout>
      <div className="p-4 md:p-8 space-y-8" dir="rtl">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-black">السلات المتروكة</h1>
          </div>
          <p className="text-muted-foreground font-medium">أعد استهداف السلات المتروكة لتحسين معدل تحويل المبيعات.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-none shadow-lg shadow-primary/10 rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-white p-6 hover-elevate transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-primary-foreground/80 text-sm font-bold">إجمالي السلات</p>
                <h3 className="text-3xl font-black">{carts.length}</h3>
              </div>
            </div>
          </Card>
          <Card className="border-none shadow-lg shadow-amber-500/10 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-400 text-white p-6 hover-elevate transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/80 text-sm font-bold">بانتظار الاسترجاع</p>
                <h3 className="text-3xl font-black">{carts.filter(c => c.recoveryStatus === 'pending').length}</h3>
              </div>
            </div>
          </Card>
          <Card className="border-none shadow-lg shadow-green-600/10 rounded-3xl bg-gradient-to-br from-green-600 to-green-500 text-white p-6 hover-elevate transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/80 text-sm font-bold">معدل التحويل</p>
                <h3 className="text-3xl font-black">12.5%</h3>
              </div>
            </div>
          </Card>
          <Card className="border-none shadow-lg shadow-indigo-600/10 rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-500 text-white p-6 hover-elevate transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/80 text-sm font-bold">التنبيهات الآلية</p>
                <h3 className="text-3xl font-black">نشطة</h3>
              </div>
            </div>
          </Card>
        </div>

        <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-black text-lg">استرجع مبيعاتك المفقودة بتنبيهات بريديه التلقائية</h4>
              <p className="text-muted-foreground text-sm">أعد استهدف السلات المتروكة! نظام جين م ز سوف يرسل رسائل بريده تلقائيًا لإعادة العملاء وتحفيزهم لإكمال طلبهم.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-left md:text-right px-4 border-l">
              <p className="text-[10px] font-black uppercase text-muted-foreground">تحليلات السلات</p>
              <p className="font-bold text-sm">كافة الفترات</p>
            </div>
            <Button className="rounded-xl font-bold px-8 shadow-lg shadow-primary/20">تفعيل التنبيهات الذكية</Button>
          </div>
        </div>

        <Card className="rounded-3xl border-2 shadow-xl shadow-muted/20 overflow-hidden">
          <CardHeader className="bg-muted/30 pb-6 border-b">
            <CardTitle className="text-xl font-bold">قائمة السلات</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow>
                    <TableHead className="text-right py-4">العميل</TableHead>
                    <TableHead className="text-right py-4">التوقيت</TableHead>
                    <TableHead className="text-right py-4">عدد المنتجات</TableHead>
                    <TableHead className="text-right py-4">الإجمالي</TableHead>
                    <TableHead className="text-right py-4">الحالة</TableHead>
                    <TableHead className="text-left py-4 px-6">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <TableRow key={i} className="animate-pulse">
                        <TableCell colSpan={6} className="h-16 bg-muted/5"></TableCell>
                      </TableRow>
                    ))
                  ) : carts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                        لا توجد سلات متروكة حالياً
                      </TableCell>
                    </TableRow>
                  ) : (
                    carts.map((cart) => (
                      <TableRow key={cart.id} className="hover:bg-muted/5">
                        <TableCell className="py-4">
                          <div className="flex flex-col">
                            <span className="font-bold">{cart.customerPhone || (cart as any).phone || "عميل مجهول"}</span>
                            <span className="text-xs text-muted-foreground">{cart.customerEmail || (cart as any).email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="w-3 h-3" />
                            {cart.lastActivity ? format(new Date(cart.lastActivity), "p", { locale: ar }) : "-"}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 font-bold">{cart.items?.length || 0}</TableCell>
                        <TableCell className="py-4 font-black">{cart.total} ر.س</TableCell>
                        <TableCell className="py-4">
                          <Badge variant={cart.recoveryStatus === 'recovered' ? 'default' : 'outline'}>
                            {cart.recoveryStatus === 'pending' ? 'بانتظار الاستعادة' : 'مستعادة'}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-left">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-2 font-bold hover:text-primary"
                            onClick={() => sendRecoveryMutation.mutate(cart.id)}
                            disabled={sendRecoveryMutation.isPending}
                          >
                            <Mail className="w-4 h-4" /> استعادة <ArrowRight className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
