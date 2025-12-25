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
import { MapPin, Truck, CreditCard, Building2, Apple, Landmark } from "lucide-react";

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

    if (shippingMethod === "delivery" && !deliveryDetails) {
      setIsStorageStationLoading(true);
      try {
        // Mocking Storage Station API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setDeliveryDetails({
          provider: "Storage Station",
          trackingNumber: "SS-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
          estimatedDays: 3,
        });
        toast({
          title: "تم ربط طلبك مع Storage Station",
          description: "تم تجهيز تفاصيل التوصيل بنجاح",
        });
        setIsStorageStationLoading(false);
        return; // Let user review delivery details before final confirmation
      } catch (error) {
        setIsStorageStationLoading(false);
        toast({
          title: "خطأ في الاتصال",
          description: "لم نتمكن من الربط مع شركة التوصيل حالياً",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        userId: user.id,
        total: (total() * 1.15).toString(),
        items: items.map(item => ({
          productId: item.productId,
          variantSku: item.variantSku,
          quantity: item.quantity,
          price: item.price,
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
      <div className="container py-24 text-right" dir="rtl">
        <h1 className="font-display text-5xl font-black mb-16 uppercase tracking-tighter border-b border-black/5 pb-12">إتمام الطلب</h1>
        
        <div className="grid lg:grid-cols-3 gap-16 items-start">
          <div className="lg:col-span-2 space-y-12">
            {/* Shipping Method */}
            <section>
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3 justify-end">
                <span>طريقة الاستلام</span>
                <Truck className="h-6 w-6" />
              </h2>
              <RadioGroup 
                value={shippingMethod} 
                onValueChange={(v) => setShippingMethod(v as any)}
                className="grid sm:grid-cols-2 gap-4"
              >
                <div className={`relative flex items-center justify-between p-6 border ${shippingMethod === "delivery" ? "border-black bg-black text-white" : "border-black/10 hover:border-black/30"} transition-all cursor-pointer`} onClick={() => setShippingMethod("delivery")}>
                  <div className="flex items-center gap-4">
                    <RadioGroupItem value="delivery" id="delivery" className="sr-only" />
                    <Truck className="h-5 w-5" />
                    <Label htmlFor="delivery" className="font-bold text-lg cursor-pointer">توصيل (Storage Station)</Label>
                  </div>
                  {deliveryDetails && (
                    <Badge className="bg-white text-black text-[8px] font-bold">متصل</Badge>
                  )}
                </div>
                
                <div className={`relative flex items-center justify-between p-6 border ${shippingMethod === "pickup" ? "border-black bg-black text-white" : "border-black/10 hover:border-black/30"} transition-all cursor-pointer`} onClick={() => setShippingMethod("pickup")}>
                  <div className="flex items-center gap-4">
                    <RadioGroupItem value="pickup" id="pickup" className="sr-only" />
                    <Building2 className="h-5 w-5" />
                    <Label htmlFor="pickup" className="font-bold text-lg cursor-pointer">استلام من الفرع</Label>
                  </div>
                </div>
              </RadioGroup>

              {shippingMethod === "pickup" && (
                <Card className="mt-4 p-6 border-black/10 rounded-none bg-secondary/30">
                  <Label className="block mb-3 font-bold opacity-60">اختر الفرع</Label>
                  <select 
                    className="w-full h-12 bg-white border border-black/10 px-4 font-bold outline-none focus:border-black"
                    value={pickupBranch}
                    onChange={(e) => setPickupBranch(e.target.value)}
                  >
                    <option>الرياض - الفرع الرئيسي</option>
                    <option>جدة - فرع رد سي مول</option>
                    <option>الدمام - فرع النخيل مول</option>
                  </select>
                </Card>
              )}
            </section>

            {/* Payment Method */}
            <section>
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3 justify-end">
                <span>طريقة الدفع</span>
                <CreditCard className="h-6 w-6" />
              </h2>
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={(v) => setPaymentMethod(v as any)}
                className="grid sm:grid-cols-2 gap-4"
              >
                <div className={`relative flex items-center justify-between p-6 border ${paymentMethod === "cod" ? "border-black bg-black text-white" : "border-black/10 hover:border-black/30"} transition-all cursor-pointer`} onClick={() => setPaymentMethod("cod")}>
                  <div className="flex items-center gap-4">
                    <RadioGroupItem value="cod" id="cod" className="sr-only" />
                    <MapPin className="h-5 w-5" />
                    <Label htmlFor="cod" className="font-bold text-lg cursor-pointer">الدفع عند الاستلام</Label>
                  </div>
                </div>

                <div className={`relative flex items-center justify-between p-6 border ${paymentMethod === "bank_transfer" ? "border-black bg-black text-white" : "border-black/10 hover:border-black/30"} transition-all cursor-pointer`} onClick={() => setPaymentMethod("bank_transfer")}>
                  <div className="flex items-center gap-4">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" className="sr-only" />
                    <Landmark className="h-5 w-5" />
                    <Label htmlFor="bank_transfer" className="font-bold text-lg cursor-pointer">تحويل بنكي</Label>
                  </div>
                </div>

                <div className={`relative flex items-center justify-between p-6 border ${paymentMethod === "apple_pay" ? "border-black bg-black text-white" : "border-black/10 hover:border-black/30"} transition-all cursor-pointer`} onClick={() => setPaymentMethod("apple_pay")}>
                  <div className="flex items-center gap-4">
                    <RadioGroupItem value="apple_pay" id="apple_pay" className="sr-only" />
                    <Apple className="h-5 w-5" />
                    <Label htmlFor="apple_pay" className="font-bold text-lg cursor-pointer">Apple Pay</Label>
                  </div>
                </div>

                <div className={`relative flex items-center justify-between p-6 border ${paymentMethod === "card" ? "border-black bg-black text-white" : "border-black/10 hover:border-black/30"} transition-all cursor-pointer`} onClick={() => setPaymentMethod("card")}>
                  <div className="flex items-center gap-4">
                    <RadioGroupItem value="card" id="card" className="sr-only" />
                    <CreditCard className="h-5 w-5" />
                    <Label htmlFor="card" className="font-bold text-lg cursor-pointer">بطاقة بنكية (Tap)</Label>
                  </div>
                </div>
              </RadioGroup>

              {paymentMethod === "bank_transfer" && (
                <Card className="mt-4 p-6 border-black/10 rounded-none bg-secondary/30">
                  <h3 className="font-bold mb-4">تفاصيل التحويل البنكي</h3>
                  <div className="space-y-4 text-sm mb-6">
                    <div className="flex justify-between border-b border-black/5 pb-2">
                      <span className="font-bold">مصرف الراجحي</span>
                      <span className="opacity-60">اسم البنك</span>
                    </div>
                    <div className="flex justify-between border-b border-black/5 pb-2">
                      <span className="font-bold tracking-widest">SA 12 3456 7890 1234 5678 9012</span>
                      <span className="opacity-60">رقم الآيبان (IBAN)</span>
                    </div>
                    <div className="flex justify-between border-b border-black/5 pb-2">
                      <span className="font-bold">مؤسسة جين إم آند زد للتجارة</span>
                      <span className="opacity-60">اسم المستفيد</span>
                    </div>
                  </div>

                  <Label className="block mb-3 font-bold opacity-60 text-xs uppercase tracking-widest">رفع إيصال التحويل</Label>
                  <div className="relative">
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
                      className="w-full h-12 bg-white border border-dashed border-black/20 flex items-center justify-center font-bold cursor-pointer hover:border-black transition-all gap-2"
                    >
                      <Landmark className="h-4 w-4" />
                      {receiptImage ? "تم اختيار الصورة" : "اضغط لرفع صورة الإيصال"}
                    </label>
                  </div>
                  {receiptImage && (
                    <div className="mt-4 aspect-video border border-black/10 overflow-hidden relative group">
                      <img src={receiptImage} alt="Receipt preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setReceiptImage(null)}
                        className="absolute top-2 right-2 bg-black text-white p-2 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        حذف
                      </button>
                    </div>
                  )}
                </Card>
              )}
            </section>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <div className="bg-black text-white p-10 sticky top-24 shadow-2xl">
              <h3 className="font-display text-2xl font-black mb-10 uppercase tracking-widest border-b border-white/10 pb-6">ملخص الطلب</h3>
              
              <div className="space-y-4 mb-10 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => (
                  <div key={item.variantSku} className="flex justify-between text-xs opacity-60">
                    <span>{item.quantity}x {item.price.toLocaleString()} ر.س</span>
                    <span>{item.title}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-6 mb-12 text-sm font-light">
                <div className="flex justify-between opacity-60">
                  <span>{total().toLocaleString()} ر.س</span>
                  <span>المجموع الفرعي</span>
                </div>
                <div className="flex justify-between opacity-60">
                  <span>{(total() * 0.15).toLocaleString()} ر.س</span>
                  <span>الضريبة (١٥٪)</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-6 font-bold text-2xl tracking-tighter">
                  <span className="text-primary">{(total() * 1.15).toLocaleString()} ر.س</span>
                  <span>الإجمالي النهائي</span>
                </div>
              </div>

              <Button 
                onClick={handleCheckout}
                disabled={isSubmitting || isStorageStationLoading}
                className="w-full font-bold h-16 uppercase tracking-[0.3em] rounded-none bg-white text-black hover:bg-primary hover:text-white border-none transition-all disabled:opacity-50"
              >
                {isSubmitting ? "جاري تنفيذ الطلب..." : 
                 isStorageStationLoading ? "جاري الربط مع Storage Station..." :
                 (shippingMethod === "delivery" && !deliveryDetails) ? "ربط الشحن والتوصيل" : "تأكيد الطلب"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
