import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useMyOrders } from "@/hooks/use-orders";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag, User, Wallet, LogOut, MapPin, FileText, Package } from "lucide-react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useMyOrders();
  const [, setLocation] = useLocation();

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-24 text-center">
          <Loader2 className="animate-spin mx-auto" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <Layout>
      <div className="container py-12 text-right" dir="rtl">
        <h1 className="font-display text-4xl font-bold mb-12 uppercase tracking-tighter">حسابي</h1>
        
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-12 p-0 space-x-reverse space-x-8">
            <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent font-bold">نظرة عامة</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent font-bold">طلباتي</TabsTrigger>
            <TabsTrigger value="wallet" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent font-bold">المحفظة</TabsTrigger>
            <TabsTrigger value="addresses" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent font-bold">العناوين</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-1 border-none bg-secondary/20 rounded-none shadow-none">
                <CardHeader>
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border border-black/5 shadow-sm">
                      <User className="w-8 h-8 text-black" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black uppercase tracking-tight">{user.name}</CardTitle>
                      <Badge variant="outline" className="mt-2 capitalize font-bold text-[10px] tracking-widest">{user.role}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black tracking-widest text-black/40">البريد الإلكتروني</p>
                    <p className="font-bold">{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black tracking-widest text-black/40">رقم الهاتف</p>
                    <p className="font-bold">{user.phone || "غير محدد"}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full rounded-none border-black hover:bg-black hover:text-white transition-all font-bold uppercase tracking-widest text-xs h-12"
                    onClick={() => {
                      logout();
                      setLocation("/");
                    }}
                  >
                    <LogOut className="w-4 h-4 ml-2" />
                    تسجيل الخروج
                  </Button>
                </CardContent>
              </Card>

              <div className="lg:col-span-2 grid sm:grid-cols-2 gap-8">
                <Card className="border-none bg-black text-white rounded-none p-8 flex flex-col justify-between h-64 shadow-2xl">
                  <Wallet className="w-10 h-10 mb-8" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] opacity-40 mb-2">الرصيد المتاح</p>
                    <p className="text-5xl font-black tracking-tighter">{user.walletBalance} <span className="text-xl font-light opacity-60">ر.س</span></p>
                  </div>
                </Card>

                <Card className="border border-black/5 rounded-none p-8 flex flex-col justify-between h-64 shadow-sm hover:shadow-md transition-all">
                  <Package className="w-10 h-10 mb-8 text-black/20" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-black/40 mb-2">إجمالي الطلبات</p>
                    <p className="text-5xl font-black tracking-tighter">{orders?.length || 0} <span className="text-xl font-light opacity-20">طلب</span></p>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="space-y-6">
              {ordersLoading ? (
                <div className="text-center py-24">
                  <Loader2 className="animate-spin mx-auto text-black/20" />
                </div>
              ) : !orders || orders.length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed border-black/5">
                  <ShoppingBag className="w-16 h-16 mx-auto text-black/10 mb-6" />
                  <p className="font-bold text-xl mb-6">لا توجد طلبات سابقة</p>
                  <Link href="/products">
                    <Button className="rounded-none h-12 px-8 font-bold uppercase tracking-widest">تصفح المجموعة</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order: any) => (
                    <Card key={order.id} className="border border-black/5 rounded-none overflow-hidden shadow-none hover:shadow-lg transition-all">
                      <div className="p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-black/5">
                          <div className="flex items-center gap-6">
                            <div className="p-4 bg-secondary/30">
                              <Package className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-black tracking-widest text-black/40 mb-1">رقم الطلب</p>
                              <h3 className="font-black text-xl tracking-tighter">#{order.id.slice(-8).toUpperCase()}</h3>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Button variant="outline" className="rounded-none font-bold text-xs uppercase tracking-widest h-10 border-black/10">
                              <FileText className="w-4 h-4 ml-2" />
                              تحميل الفاتورة (PDF)
                            </Button>
                            <Badge className="rounded-none px-4 py-2 uppercase font-black text-[10px] tracking-[0.2em]">{order.status}</Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase font-black tracking-widest text-black/40">التاريخ</p>
                            <p className="font-bold">{new Date(order.createdAt).toLocaleDateString("ar-SA")}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase font-black tracking-widest text-black/40">المبلغ الإجمالي</p>
                            <p className="font-bold text-xl tracking-tight">{order.total} ر.س</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase font-black tracking-widest text-black/40">طريقة الدفع</p>
                            <p className="font-bold capitalize">{order.paymentMethod === 'cod' ? 'عند الاستلام' : order.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : order.paymentMethod}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase font-black tracking-widest text-black/40">الاستلام</p>
                            <p className="font-bold">{order.shippingMethod === 'pickup' ? 'من الفرع' : 'توصيل'}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="wallet">
            <Card className="border-none bg-secondary/20 rounded-none p-12 text-center">
              <Wallet className="w-16 h-16 mx-auto mb-6 text-black/20" />
              <h3 className="text-2xl font-black mb-2">رصيد محفظتك</h3>
              <p className="text-5xl font-black tracking-tighter mb-8">{user.walletBalance} ر.س</p>
              <div className="max-w-md mx-auto p-6 bg-white border border-black/5 text-sm text-right">
                <p className="font-bold mb-4 border-b pb-4 opacity-40 uppercase tracking-widest text-xs">آخر العمليات</p>
                <div className="flex justify-between items-center py-2 opacity-40 italic">
                  <span>-</span>
                  <span>لا توجد عمليات مؤخراً</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="addresses">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border-2 border-dashed border-black/5 p-12 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-black/20 transition-all">
                <MapPin className="w-12 h-12 mb-6 text-black/10 group-hover:text-black/40 transition-all" />
                <p className="font-bold uppercase tracking-widest text-xs">إضافة عنوان جديد</p>
              </div>
              
              {/* Placeholder for saved addresses */}
              <Card className="border border-black rounded-none p-8 relative">
                <Badge className="absolute top-4 left-4 bg-black text-white rounded-none font-bold text-[8px] uppercase tracking-widest">العنوان الافتراضي</Badge>
                <h4 className="font-black text-xl mb-4 uppercase tracking-tight">المنزل</h4>
                <div className="space-y-2 text-sm opacity-60">
                  <p>المملكة العربية السعودية</p>
                  <p>الرياض</p>
                  <p>طريق الملك فهد، حي المروج</p>
                </div>
                <div className="mt-8 flex gap-4">
                  <button className="text-[10px] font-black uppercase tracking-widest border-b border-black pb-1">تعديل</button>
                  <button className="text-[10px] font-black uppercase tracking-widest text-red-500 opacity-40 hover:opacity-100 transition-all pb-1">حذف</button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
