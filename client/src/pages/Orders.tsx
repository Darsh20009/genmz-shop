import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingBag } from "lucide-react";

export default function Orders() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: orders, isLoading } = useQuery({
    queryKey: [api.orders.my.path],
    queryFn: async () => {
      const res = await fetch(api.orders.my.path);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
    enabled: !!user,
  });

  if (authLoading) return <Layout><div className="container py-24 text-center"><Loader2 className="animate-spin mx-auto" /></div></Layout>;

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-24 text-center">
          <Loader2 className="animate-spin mx-auto" />
        </div>
      </Layout>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Layout>
        <div className="container py-24 text-center">
          <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-4">لا توجد طلبات</h1>
          <p className="text-muted-foreground">لم تقم بأي طلبات بعد.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="font-display text-4xl font-bold mb-12">طلباتي</h1>

        <div className="space-y-4">
          {orders.map((order: any) => (
            <Card key={order.id} className="hover-elevate">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>رقم الطلب: {order.id}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                  <Badge className="capitalize">{order.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">الإجمالي</p>
                    <p className="font-bold text-lg">{order.total} ر.س</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">طريقة الدفع</p>
                    <p className="font-bold text-lg capitalize">{order.paymentMethod}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">المنتجات</p>
                  <div className="space-y-2">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="text-sm flex justify-between">
                        <span>{item.title} x{item.quantity}</span>
                        <span>{item.price * item.quantity} ر.س</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
