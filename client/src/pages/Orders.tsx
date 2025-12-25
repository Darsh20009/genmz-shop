import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingBag, Package, MapPin, CreditCard, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const StatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, { label: string, variant: "default" | "secondary" | "outline" | "destructive" }> = {
    new: { label: "جديد", variant: "default" },
    processing: { label: "قيد المعالجة", variant: "secondary" },
    shipped: { label: "تم الشحن", variant: "outline" },
    completed: { label: "مكتمل", variant: "default" },
    cancelled: { label: "ملغي", variant: "destructive" },
  };
  const config = statusMap[status] || { label: status, variant: "outline" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const OrderCard = ({ order }: { order: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="overflow-hidden border-black/5 hover-elevate transition-all duration-300">
      <CardHeader className="bg-secondary/30 pb-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-black">طلب #{order.id.slice(-6).toUpperCase()}</CardTitle>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold mt-1">
                <Clock className="h-3 w-3" />
                {new Date(order.createdAt).toLocaleDateString("ar-SA", { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={order.status} />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <CreditCard className="h-3 w-3" /> الإجمالي
            </p>
            <p className="font-black text-lg">{order.total} <span className="text-xs">ر.س</span></p>
          </div>
          
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <CreditCard className="h-3 w-3" /> الدفع
            </p>
            <p className="font-bold text-sm">
              {order.paymentMethod === 'cod' ? 'عند الاستلام' : 
               order.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 
               order.paymentMethod === 'apple_pay' ? 'Apple Pay' : 'بطاقة ائتمان'}
            </p>
            <Badge variant="outline" className="text-[9px] h-4 px-1 opacity-70">
              {order.paymentStatus === 'paid' ? 'تم الدفع' : 'بانتظار الدفع'}
            </Badge>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> الاستلام
            </p>
            <p className="font-bold text-sm">{order.shippingMethod === 'pickup' ? 'استلام فرع' : 'توصيل منزلي'}</p>
            {order.pickupBranch && <p className="text-[10px] text-muted-foreground truncate">{order.pickupBranch}</p>}
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">التحديث</p>
            <p className="text-[10px] font-bold text-muted-foreground">
              {new Date(order.createdAt).toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {isExpanded && (
          <div className="pt-6 border-t border-dashed animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">محتويات الطلب</h4>
              <div className="space-y-3">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-secondary/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-xs shadow-sm">
                        x{item.quantity}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground">SKU: {item.variantSku}</p>
                      </div>
                    </div>
                    <p className="font-black text-sm">{item.price * item.quantity} <span className="text-[10px]">ر.س</span></p>
                  </div>
                ))}
              </div>
              
              {order.shippingAddress && (
                <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> عنوان التوصيل
                  </h4>
                  <p className="text-sm font-bold">{order.shippingAddress.city}, {order.shippingAddress.street}</p>
                  <p className="text-[10px] text-muted-foreground">{order.shippingAddress.country || 'المملكة العربية السعودية'}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

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

  if (authLoading) return <Layout><div className="container py-24 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div></Layout>;

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <Layout>
      <div className="container py-12 px-4 max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="font-black text-4xl uppercase tracking-tighter mb-2">طلباتي</h1>
          <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest">تتبع وإدارة مشترياتك في متجر M&Z</p>
        </header>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 w-full bg-secondary/50 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-24 bg-secondary/20 rounded-[2rem] border-2 border-dashed border-black/5">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <ShoppingBag className="h-10 w-10 text-primary" />
            </div>
            <h2 className="font-black text-2xl mb-2">لا توجد طلبات بعد</h2>
            <p className="text-muted-foreground font-bold text-sm mb-8 uppercase tracking-widest">ابدأ التسوق الآن واكتشف مجموعتنا المميزة</p>
            <Button onClick={() => setLocation("/products")} size="lg" className="rounded-full px-8 font-black uppercase tracking-widest">
              تسوق الآن
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
