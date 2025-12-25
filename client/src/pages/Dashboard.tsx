import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useMyOrders } from "@/hooks/use-orders";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag, User, Wallet, LogOut } from "lucide-react";
import { Link } from "wouter";

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
      <div className="container py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar - User Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <Badge variant="outline" className="mt-2 capitalize">{user.role}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">اسم المستخدم</p>
                  <p className="font-semibold">{user.username}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">البريد الإلكتروني</p>
                  <p className="font-semibold">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">رقم الهاتف</p>
                  <p className="font-semibold">{user.phone || "غير محدد"}</p>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-3 mb-4">
                    <Wallet className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">رصيد المحفظة</p>
                      <p className="text-2xl font-bold">{user.walletBalance} ر.س</p>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    logout();
                    setLocation("/");
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  تسجيل الخروج
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Orders */}
          <div className="lg:col-span-2">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">طلباتي</h2>
                <Link href="/orders">
                  <Button variant="outline">عرض الكل</Button>
                </Link>
              </div>

              {ordersLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="animate-spin mx-auto" />
                </div>
              ) : !orders || orders.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">لم تقم بأي طلبات بعد</p>
                    <Link href="/products" className="mt-4 inline-block">
                      <Button>تصفح المنتجات</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order: any) => (
                    <Card key={order.id} className="hover-elevate">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-base">طلب #{order.id.slice(-8)}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                            </p>
                          </div>
                          <Badge className="capitalize">{order.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">المبلغ</p>
                            <p className="font-bold">{order.total} ر.س</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">العدد</p>
                            <p className="font-bold">{order.items.length} منتج</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">الدفع</p>
                            <p className="font-bold capitalize text-sm">{order.paymentMethod}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
