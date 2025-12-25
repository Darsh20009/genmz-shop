import { Layout } from "@/components/Layout";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { MapPin, Truck, CreditCard, Building2, Apple, Landmark, Lock, Check, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "apple_pay" | "card">("card");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (items.length === 0) {
    setLocation("/cart");
    return null;
  }

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "يرجى تسجيل الدخول لإتمام الطلب",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    const orderTotal = total() * 1.15 + 25; // Including VAT and Shipping

    if (paymentMethod === "wallet" && Number(user.walletBalance) < orderTotal) {
      toast({
        title: "رصيد المحفظة غير كافٍ",
        description: `رصيدك الحالي: ${user.walletBalance} ر.س، المطلوب: ${orderTotal.toFixed(2)} ر.س`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        userId: user.id,
        total: orderTotal.toFixed(2),
        subtotal: total().toFixed(2),
        vatAmount: (total() * 0.15).toFixed(2),
        shippingCost: (25).toFixed(2),
        tapCommission: (orderTotal * 0.02).toFixed(2),
        netProfit: (orderTotal * 0.1).toFixed(2),
        items: items.map(item => ({
          productId: item.productId,
          variantSku: item.variantSku,
          quantity: item.quantity,
          price: item.price,
          cost: Math.round(item.price * 0.7),
          title: item.title,
        })),
        shippingMethod: "delivery",
        paymentMethod,
        status: "new",
        paymentStatus: paymentMethod === "wallet" ? "paid" : "pending",
      };

      const res = await apiRequest("POST", "/api/orders", orderData);
      const order = await res.json();

      if (paymentMethod === "wallet") {
        const newBalance = (Number(user.walletBalance) - orderTotal).toString();
        await apiRequest("PATCH", "/api/user/wallet", { balance: newBalance });
        await apiRequest("POST", "/api/wallet/transaction", {
          amount: -orderTotal,
          type: "payment",
          description: `دفع قيمة الطلب #${order.id.slice(-8).toUpperCase()}`
        });
      }

      // Auto-create shipment with Storage Station
      await apiRequest("POST", "/api/shipping/storage-station/create", { orderId: order.id });

      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      clearCart();
      
      toast({
        title: "تم استلام طلبك بنجاح",
        description: "سيتم التوصيل عبر Storage Station قريباً",
      });
      setLocation("/orders");
    } catch (error: any) {
      toast({
        title: "خطأ في إتمام الطلب",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="bg-[#fcfcfc] min-h-screen">
        <div className="container py-16 px-4 text-right" dir="rtl">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 border-b border-black/5 pb-8">
            <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter">إتمام الشراء</h1>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-black/40">
              <span className="opacity-40">حقيبة التسوق</span>
              <span className="opacity-20">/</span>
              <span className="text-black">إتمام الطلب</span>
              <span className="opacity-20">/</span>
              <span>الدفع</span>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-8 space-y-8">
              {/* Security Banner */}
              <div className="bg-white border border-black/5 p-6 flex items-center gap-6 justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 rounded-none">
                    <Lock className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-black text-black uppercase tracking-widest">تسوق آمن ١٠٠٪</h3>
                    <p className="text-[9px] text-black/40 mt-1 font-bold">تشفير بياناتك يتم بأعلى معايير الأمان العالمية SSL</p>
                  </div>
                </div>
                <Check className="h-5 w-5 text-green-600" />
              </div>

              {/* Shipping Method */}
              <section className="bg-white p-8 border border-black/5 shadow-sm space-y-8">
                <div className="flex items-center justify-between border-b border-black/5 pb-6">
                  <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <Truck className="h-5 w-5 text-primary" />
                    <span>عنوان الشحن</span>
                  </h2>
                </div>
                
                <div className="p-6 bg-black/[0.02] border border-black/5 space-y-4">
                  <div className="flex items-center gap-4 text-primary">
                    <MapPin className="h-5 w-5" />
                    <span className="font-black text-sm">الرياض، المملكة العربية السعودية</span>
                  </div>
                  <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">التوصيل خلال ٢-٤ أيام عمل عبر Storage Station</p>
                </div>
              </section>

              {/* Payment Method */}
              <section className="bg-white p-8 border border-black/5 shadow-sm space-y-8">
                <div className="flex items-center justify-between border-b border-black/5 pb-6">
                  <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span>طريقة الدفع</span>
                  </h2>
                </div>

                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={(v) => setPaymentMethod(v as any)}
                  className="grid sm:grid-cols-2 gap-4"
                >
                  {[
                    { id: "card", label: "بطاقة بنكية (مدى / فيزا)", icon: CreditCard },
                    { id: "apple_pay", label: "Apple Pay", icon: Apple },
                    { id: "wallet", label: "رصيد المحفظة", icon: Wallet },
                  ].map((method) => (
                    <div 
                      key={method.id}
                      className={`group relative flex flex-col p-6 border transition-all cursor-pointer ${paymentMethod === method.id ? "border-primary bg-primary/5" : "border-black/5 bg-[#fcfcfc] hover:border-black/20"}`} 
                      onClick={() => setPaymentMethod(method.id as any)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <method.icon className={`h-6 w-6 ${paymentMethod === method.id ? "text-primary" : "text-black/20"}`} />
                        <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                        {method.id === "wallet" && (
                          <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">
                            {user?.walletBalance} ر.س
                          </Badge>
                        )}
                      </div>
                      <Label htmlFor={method.id} className="font-black text-sm uppercase tracking-widest cursor-pointer mb-2">{method.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </section>
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white p-8 border border-black/5 shadow-xl">
                  <h3 className="font-black text-lg uppercase tracking-tighter mb-8 pb-4 border-b border-black/5">ملخص الطلب</h3>
                  
                  <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {items.map(item => (
                      <div key={item.variantSku} className="flex gap-4 items-center">
                        <div className="w-16 aspect-[3/4] bg-muted shrink-0 border border-black/5">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="font-black text-[11px] leading-tight max-w-[120px]">{item.title}</span>
                            <span className="font-black text-[11px]">{item.price.toLocaleString()} ر.س</span>
                          </div>
                          <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">{item.quantity}x <span className="mx-1">|</span> {item.color} <span className="mx-1">|</span> {item.size}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 mb-10 text-[11px] font-bold uppercase tracking-widest">
                    <div className="flex justify-between opacity-40">
                      <span>{total().toLocaleString()} ر.س</span>
                      <span>المجموع الفرعي</span>
                    </div>
                    <div className="flex justify-between opacity-40">
                      <span>{(total() * 0.15).toLocaleString()} ر.س</span>
                      <span>الضريبة (١٥٪)</span>
                    </div>
                    <div className="flex justify-between opacity-40">
                      <span>25.00 ر.س</span>
                      <span>رسوم الشحن</span>
                    </div>
                    <div className="flex justify-between border-t border-black/5 pt-6 font-black text-3xl tracking-tighter text-black">
                      <span className="text-primary">{(total() * 1.15 + 25).toLocaleString()} ر.س</span>
                      <span>الإجمالي</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 justify-center py-4 bg-black/[0.02] border border-black/5 opacity-40 text-[9px] font-black uppercase tracking-widest mb-4">
                      <Lock className="h-3 w-3" />
                      <span>دفع آمن ١٠٠٪ ومحمي</span>
                    </div>

                    <Button 
                      onClick={handleCheckout}
                      disabled={isSubmitting}
                      className="w-full font-black h-16 uppercase tracking-[0.4em] rounded-none bg-primary text-white hover:bg-primary/90 border-none transition-all disabled:opacity-50 text-[10px] shadow-xl shadow-primary/10"
                    >
                      {isSubmitting ? "جاري المعالجة..." : "تأكيد الطلب"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
