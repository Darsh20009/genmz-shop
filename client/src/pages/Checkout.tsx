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
import { MapPin, Truck, CreditCard, Building2, Apple, Landmark, Lock, Check } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [shippingMethod, setShippingMethod] = useState<"pickup" | "delivery">("delivery");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank_transfer" | "apple_pay" | "card">("cod");
  const [pickupBranch, setPickupBranch] = useState("الرياض - الفرع الرئيسي");
  const [isStorageStationLoading, setIsStorageStationLoading] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  const [passwordVerification, setPasswordVerification] = useState("");
  const [showPasswordVerification, setShowPasswordVerification] = useState(false);

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

    if (!showPasswordVerification) {
       setShowPasswordVerification(true);
       return;
    }

    setIsSubmitting(true);
    try {
      // Simple password check - in real app would be API call
      // For now, we'll proceed if password is provided
      if (!passwordVerification) {
         throw new Error("يرجى إدخال كلمة المرور");
      }
      const orderData = {
        userId: user.id,
        total: (total() * 1.15).toFixed(2),
        subtotal: total().toFixed(2),
        vatAmount: (total() * 0.15).toFixed(2),
        shippingCost: (25).toFixed(2),
        tapCommission: (total() * 1.15 * 0.02).toFixed(2),
        netProfit: (total() * 1.15 * 0.1).toFixed(2),
        items: items.map(item => ({
          productId: item.productId,
          variantSku: item.variantSku,
          quantity: item.quantity,
          price: item.price,
          cost: Math.round(item.price * 0.7),
          title: item.title,
        })),
        shippingMethod,
        pickupBranch: shippingMethod === "pickup" ? pickupBranch : undefined,
        paymentMethod,
        bankTransferReceipt: paymentMethod === "bank_transfer" ? receiptImage : undefined,
        status: "new",
        paymentStatus: "pending",
      };

      await apiRequest("POST", "/api/orders", orderData);
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      clearCart();
      toast({
        title: "تم استلام طلبك بنجاح",
        description: `رقم تتبع الشحنة: ${deliveryDetails?.trackingNumber || "N/A"}`,
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
                    <span>طريقة الاستلام</span>
                  </h2>
                </div>
                
                <RadioGroup 
                  value={shippingMethod} 
                  onValueChange={(v) => setShippingMethod(v as any)}
                  className="grid sm:grid-cols-2 gap-4"
                >
                  <div 
                    className={`group relative flex flex-col p-6 border transition-all cursor-pointer ${shippingMethod === "delivery" ? "border-black bg-black text-white" : "border-black/5 bg-[#fcfcfc] hover:border-black/20"}`} 
                    onClick={() => setShippingMethod("delivery")}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <Truck className={`h-6 w-6 ${shippingMethod === "delivery" ? "text-white" : "text-black/20"}`} />
                      <RadioGroupItem value="delivery" id="delivery" className="sr-only" />
                      {deliveryDetails && <Badge className="bg-primary text-white text-[8px] font-bold rounded-none">متصل</Badge>}
                    </div>
                    <Label htmlFor="delivery" className="font-black text-sm uppercase tracking-widest cursor-pointer mb-2">توصيل (Storage Station)</Label>
                    <p className={`text-[10px] ${shippingMethod === "delivery" ? "text-white/60" : "text-black/40"}`}>توصيل سريع لباب المنزل</p>
                  </div>
                  
                  <div 
                    className={`group relative flex flex-col p-6 border transition-all cursor-pointer ${shippingMethod === "pickup" ? "border-black bg-black text-white" : "border-black/5 bg-[#fcfcfc] hover:border-black/20"}`} 
                    onClick={() => setShippingMethod("pickup")}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <Building2 className={`h-6 w-6 ${shippingMethod === "pickup" ? "text-white" : "text-black/20"}`} />
                      <RadioGroupItem value="pickup" id="pickup" className="sr-only" />
                    </div>
                    <Label htmlFor="pickup" className="font-black text-sm uppercase tracking-widest cursor-pointer mb-2">استلام من الفرع</Label>
                    <p className={`text-[10px] ${shippingMethod === "pickup" ? "text-white/60" : "text-black/40"}`}>استلم طلبك من أقرب فرع لك</p>
                  </div>
                </RadioGroup>

                {shippingMethod === "pickup" && (
                  <div className="mt-6 p-6 bg-black/5 space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">اختر الفرع المناسب</Label>
                    <select 
                      className="w-full h-14 bg-white border border-black/5 px-4 font-black text-sm outline-none focus:ring-1 focus:ring-black/10 transition-all"
                      value={pickupBranch}
                      onChange={(e) => setPickupBranch(e.target.value)}
                    >
                      <option>الرياض - الفرع الرئيسي</option>
                      <option>جدة - فرع رد سي مول</option>
                      <option>الدمام - فرع النخيل مول</option>
                    </select>
                  </div>
                )}
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
                    { id: "cod", label: "الدفع عند الاستلام", icon: MapPin },
                    { id: "bank_transfer", label: "تحويل بنكي", icon: Landmark },
                    { id: "apple_pay", label: "Apple Pay", icon: Apple },
                    { id: "card", label: "بطاقة بنكية (Tap)", icon: CreditCard }
                  ].map((method) => (
                    <div 
                      key={method.id}
                      className={`group relative flex flex-col p-6 border transition-all cursor-pointer ${paymentMethod === method.id ? "border-black bg-black text-white" : "border-black/5 bg-[#fcfcfc] hover:border-black/20"}`} 
                      onClick={() => setPaymentMethod(method.id as any)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <method.icon className={`h-6 w-6 ${paymentMethod === method.id ? "text-white" : "text-black/20"}`} />
                        <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                      </div>
                      <Label htmlFor={method.id} className="font-black text-sm uppercase tracking-widest cursor-pointer mb-2">{method.label}</Label>
                    </div>
                  ))}
                </RadioGroup>

                {paymentMethod === "bank_transfer" && (
                  <div className="mt-6 p-8 bg-black/5 space-y-6">
                    <h3 className="font-black text-sm uppercase tracking-widest">تفاصيل الحساب البنكي</h3>
                    <div className="space-y-4">
                      {[
                        { label: "اسم البنك", value: "مصرف الراجحي" },
                        { label: "رقم الآيبان (IBAN)", value: "SA 12 3456 7890 1234 5678 9012", isIban: true },
                        { label: "اسم المستفيد", value: "مؤسسة جين إم آند زد للتجارة" }
                      ].map((info, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-black/5 pb-3">
                          <span className={`font-black text-sm ${info.isIban ? "tracking-widest" : ""}`}>{info.value}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{info.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 block">إيصال التحويل</Label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setReceiptImage(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden" 
                        id="receipt-upload" 
                      />
                      <label 
                        htmlFor="receipt-upload" 
                        className="w-full h-14 bg-white border border-dashed border-black/10 flex items-center justify-center font-black text-[10px] uppercase tracking-widest cursor-pointer hover:border-black/30 transition-all gap-3 shadow-sm"
                      >
                        <Landmark className="h-4 w-4 opacity-40" />
                        {receiptImage ? "تم اختيار الصورة" : "رفع صورة الإيصال"}
                      </label>
                      {receiptImage && (
                        <div className="mt-4 relative group aspect-video bg-white p-2 border border-black/5 shadow-md">
                          <img src={receiptImage} alt="Receipt" className="w-full h-full object-contain" />
                          <button 
                            onClick={() => setReceiptImage(null)}
                            className="absolute top-4 left-4 bg-black text-white p-2 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            حذف الإيصال
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {showPasswordVerification && (
                  <div className="mt-8 p-8 border border-black/5 bg-black/5 space-y-4">
                    <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      <span>تأكيد الهوية</span>
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">أدخل كلمة المرور لإتمام عملية الشراء بأمان</p>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      value={passwordVerification}
                      onChange={(e) => setPasswordVerification(e.target.value)}
                      className="h-14 bg-white border-black/5 rounded-none focus-visible:ring-black"
                    />
                  </div>
                )}
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
                    <div className="flex justify-between border-t border-black/5 pt-6 font-black text-3xl tracking-tighter text-black">
                      <span className="text-primary">{(total() * 1.15).toLocaleString()} ر.س</span>
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
                      disabled={isSubmitting || isStorageStationLoading}
                      className="w-full font-black h-16 uppercase tracking-[0.4em] rounded-none bg-black text-white hover:bg-primary border-none transition-all disabled:opacity-50 text-[10px] shadow-xl shadow-black/10"
                    >
                      {isSubmitting ? "جاري المعالجة..." : 
                       isStorageStationLoading ? "جاري الربط مع الشحن..." :
                       (shippingMethod === "delivery" && !deliveryDetails) ? "إعداد الشحن" : "تأكيد الطلب"}
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
