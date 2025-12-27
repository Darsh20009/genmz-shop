import { Layout } from "@/components/Layout";
import { useCart } from "@/hooks/use-cart";
import { useCoupon } from "@/hooks/use-coupon";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { MapPin, Truck, CreditCard, Building2, Apple, Landmark, Lock, Check, Wallet, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { LocationMap } from "@/components/LocationMap";
import { useQuery } from "@tanstack/react-query";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { appliedCoupon } = useCoupon();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [paymentMethod, setPaymentMethod] = useState<"wallet">("wallet");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(user?.addresses?.[0]?.id || null);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [showMapForm, setShowMapForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ street: "", city: "" });
  const [shippingCompany, setShippingCompany] = useState<string>("");

  const { data: shippingCompanies = [] } = useQuery({
    queryKey: ["/api/shipping-companies"],
    queryFn: async () => {
      const res = await fetch("/api/shipping-companies");
      return res.json();
    }
  });

  if (shippingCompany === "" && shippingCompanies.length > 0) {
    setShippingCompany(shippingCompanies[0].id);
  }

  const selectedShipping = shippingCompanies.find((c: any) => c._id === shippingCompany || c.id === shippingCompany) || shippingCompanies[0];
  const shippingPrice = selectedShipping?.price || 0;

  if (items.length === 0) {
    setLocation("/cart");
    return null;
  }

  // Calculate discount
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = total();
    
    // Check minimum order amount
    if (appliedCoupon.minOrderAmount && subtotal < appliedCoupon.minOrderAmount) {
      return 0;
    }

    if (appliedCoupon.type === "percentage") {
      return (subtotal * appliedCoupon.value) / 100;
    } else if (appliedCoupon.type === "cashback") {
      // Cashback doesn't reduce the order total, it's credited after purchase
      return 0;
    } else {
      return appliedCoupon.value;
    }
  };

  const calculateCashback = () => {
    if (!appliedCoupon || appliedCoupon.type !== "cashback") return 0;
    const subtotal = total();
    const cashbackAmount = (subtotal * appliedCoupon.value) / 100;
    // Apply max cashback limit if exists
    if (appliedCoupon.maxCashback && cashbackAmount > appliedCoupon.maxCashback) {
      return appliedCoupon.maxCashback;
    }
    return cashbackAmount;
  };

  const discountAmount = calculateDiscount();
  const cashbackAmount = calculateCashback();
  const subtotal = total();
  const tax = subtotal * 0.15;
  const shipping = shippingPrice;
  const finalTotal = subtotal + tax + shipping - discountAmount;

  const handleCheckoutInitiate = () => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "يرجى تسجيل الدخول لإتمام الطلب",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    if (paymentMethod === "wallet" && Number(user.walletBalance) < finalTotal) {
      toast({
        title: "رصيد المحفظة غير كافٍ",
        description: `رصيدك الحالي: ${user.walletBalance} ر.س، المطلوب: ${finalTotal.toFixed(2)} ر.س`,
        variant: "destructive",
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleFinalCheckout = async () => {
    if (!confirmPassword) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال كلمة المرور للتأكيد",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // First verify password
      const verifyRes = await fetch("/api/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: confirmPassword }),
      });

      if (!verifyRes.ok) {
        throw new Error("كلمة المرور غير صحيحة");
      }

      const selectedAddr = user?.addresses?.find(a => a.id === selectedAddressId);
      const deliveryAddress = selectedAddr ? `${selectedAddr.street}, ${selectedAddr.city}` : `${newAddress.street}, ${newAddress.city}`;
      
      const orderData = {
        userId: user!.id,
        total: finalTotal.toFixed(2),
        subtotal: subtotal.toFixed(2),
        vatAmount: tax.toFixed(2),
        shippingCost: shipping.toFixed(2),
        shippingCompany: selectedShipping.name,
        deliveryAddress: deliveryAddress,
        discountAmount: discountAmount.toFixed(2),
        cashbackAmount: cashbackAmount.toFixed(2),
        couponCode: appliedCoupon?.code || null,
        tapCommission: (finalTotal * 0.02).toFixed(2),
        netProfit: (finalTotal * 0.1).toFixed(2),
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
        let newBalance = (Number(user!.walletBalance) - finalTotal);
        
        // Add cashback if applicable
        if (cashbackAmount > 0) {
          newBalance += cashbackAmount;
          await apiRequest("POST", "/api/wallet/transaction", {
            amount: cashbackAmount,
            type: "cashback",
            description: `كاش باك من الطلب #${order.id.slice(-8).toUpperCase()}`
          });
        }
        
        await apiRequest("PATCH", "/api/user/wallet", { balance: newBalance.toString() });
        await apiRequest("POST", "/api/wallet/transaction", {
          amount: -finalTotal,
          type: "payment",
          description: `دفع قيمة الطلب #${order.id.slice(-8).toUpperCase()}`
        });
      }

      // Auto-create shipment with selected company
      try {
        await apiRequest("POST", "/api/shipping/storage-station/create", {
          orderId: order.id,
          provider: selectedShipping.name,
          deliveryAddress: deliveryAddress
        });
      } catch (e) {
        console.warn("Shipping creation failed, but order was created");
      }

      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      clearCart();
      
      let toastMessage = "سيتم التوصيل عبر Storage X قريباً";
      if (cashbackAmount > 0) {
        toastMessage = `تم إضافة ${cashbackAmount.toLocaleString()} ر.س كاش باك إلى محفظتك! ${toastMessage}`;
      }
      
      toast({
        title: "تم استلام طلبك بنجاح",
        description: toastMessage,
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
      setShowConfirmDialog(false);
      setConfirmPassword("");
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

              {/* Address Selection */}
              <section className="bg-white p-8 border border-black/5 shadow-sm space-y-8">
                <div className="flex items-center justify-between border-b border-black/5 pb-6">
                  <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>عنوان الشحن</span>
                  </h2>
                </div>
                
                {!showAddAddressForm && user?.addresses && user.addresses.length > 0 && (
                  <div className="space-y-4">
                    {user.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 border rounded cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? "border-primary bg-primary/5"
                            : "border-black/5 hover:border-black/20"
                        }`}
                      >
                        <div className="font-black text-sm">{addr.name}</div>
                        <div className="text-[10px] text-black/60 mt-1">{addr.street}, {addr.city}</div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => setShowAddAddressForm(true)}
                      className="w-full border-black/10"
                    >
                      إضافة عنوان جديد
                    </Button>
                  </div>
                )}

                {(showAddAddressForm || !user?.addresses || user.addresses.length === 0) && (
                  <div className="space-y-4">
                    {!showMapForm ? (
                      <>
                        <Input
                          placeholder="الشارع والرقم"
                          value={newAddress.street}
                          onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                          className="h-12 border-black/10"
                        />
                        <Input
                          placeholder="المدينة"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="h-12 border-black/10"
                        />
                        <Button
                          variant="outline"
                          onClick={() => setShowMapForm(true)}
                          className="w-full border-black/10"
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          حدد الموقع من الخريطة
                        </Button>
                        {showAddAddressForm && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowAddAddressForm(false);
                              setSelectedAddressId(null);
                            }}
                            className="w-full border-black/10"
                          >
                            إلغاء
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        <LocationMap
                          onLocationSelect={(coords, address) => {
                            setNewAddress({
                              street: address,
                              city: "الرياض"
                            });
                            setShowMapForm(false);
                            setSelectedAddressId(null);
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={() => setShowMapForm(false)}
                          className="w-full border-black/10"
                        >
                          إغلاق الخريطة
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </section>

              {/* Shipping Company */}
              <section className="bg-white p-8 border border-black/5 shadow-sm space-y-8">
                <div className="flex items-center justify-between border-b border-black/5 pb-6">
                  <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <Truck className="h-5 w-5 text-primary" />
                    <span>شركة الشحن</span>
                  </h2>
                </div>
                
                <div className="grid gap-4">
                  {shippingCompanies.map((company: any) => (
                    <div
                      key={company.id || company._id}
                      onClick={() => setShippingCompany(company.id || company._id)}
                      className={`p-4 border rounded cursor-pointer transition-all flex items-center justify-between ${
                        (shippingCompany === company.id || shippingCompany === company._id)
                          ? "border-primary bg-primary/5"
                          : "border-black/5 hover:border-black/20"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Truck className="h-6 w-6" />
                        <div className="font-black text-sm">{company.name}</div>
                      </div>
                      <span className="font-black text-primary">{company.price} ر.س</span>
                    </div>
                  ))}
                </div>
                
                <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">التوصيل خلال ٢-٤ أيام عمل</p>
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
                  className="grid gap-4"
                >
                  <div 
                    className={`group relative flex flex-col p-6 border transition-all cursor-pointer ${paymentMethod === "wallet" ? "border-primary bg-primary/5" : "border-black/5 bg-[#fcfcfc] hover:border-black/20"}`} 
                    onClick={() => setPaymentMethod("wallet")}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <Wallet className={`h-6 w-6 ${paymentMethod === "wallet" ? "text-primary" : "text-black/20"}`} />
                      <RadioGroupItem value="wallet" id="wallet" className="sr-only" />
                      <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">
                        {user?.walletBalance} ر.س
                      </Badge>
                    </div>
                    <Label htmlFor="wallet" className="font-black text-sm uppercase tracking-widest cursor-pointer mb-2">رصيد المحفظة</Label>
                  </div>
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
                      <span>{subtotal.toLocaleString()} ر.س</span>
                      <span>المجموع الفرعي</span>
                    </div>
                    <div className="flex justify-between opacity-40">
                      <span>{tax.toLocaleString()} ر.س</span>
                      <span>الضريبة (١٥٪)</span>
                    </div>
                    <div className="flex justify-between opacity-40">
                      <span>{shipping.toLocaleString()} ر.س</span>
                      <span>رسوم الشحن</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>-{discountAmount.toLocaleString()} ر.س</span>
                        <span>الخصم</span>
                      </div>
                    )}
                    {cashbackAmount > 0 && (
                      <div className="flex justify-between text-blue-600">
                        <span>+{cashbackAmount.toLocaleString()} ر.س</span>
                        <span>كاش باك (يُضاف للمحفظة)</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-black/5 pt-6 font-black text-3xl tracking-tighter text-black">
                      <span className="text-primary">{finalTotal.toLocaleString()} ر.س</span>
                      <span>الإجمالي</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 justify-center py-4 bg-black/[0.02] border border-black/5 opacity-40 text-[9px] font-black uppercase tracking-widest mb-4">
                      <Lock className="h-3 w-3" />
                      <span>دفع آمن ١٠٠٪ ومحمي</span>
                    </div>

                    <Button 
                      onClick={handleCheckoutInitiate}
                      disabled={isSubmitting}
                      className="w-full font-black h-16 uppercase tracking-[0.4em] rounded-none bg-primary text-white hover:bg-primary/90 border-none transition-all disabled:opacity-50 text-[10px] shadow-xl shadow-primary/10 active:scale-95"
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

      {/* Password Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-black/5 shadow-2xl p-8" dir="rtl">
          <DialogHeader className="text-right space-y-4">
            <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-2">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="font-black text-3xl tracking-tight">تأكيد الهوية</DialogTitle>
            <DialogDescription className="font-bold text-sm text-black/40 leading-relaxed">
              لحماية حسابك، يرجى إدخال كلمة المرور الخاصة بك لتأكيد طلب الشراء.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="confirm-password" title="كلمة المرور" className="text-[10px] font-black uppercase tracking-widest text-black/30 pr-1">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-14 bg-black/5 border-none rounded-2xl px-6 font-bold focus-visible:ring-primary/20"
                  placeholder="ادخل كلمة المرور هنا"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Link href="/forgot-password">
              <button 
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                onClick={() => setShowConfirmDialog(false)}
              >
                نسيت كلمة المرور؟
              </button>
            </Link>
          </div>
          <DialogFooter className="gap-3 sm:justify-start">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="rounded-full h-14 px-8 font-black uppercase tracking-widest text-[10px] border-black/5"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleFinalCheckout}
              disabled={isSubmitting || !confirmPassword}
              className="rounded-full h-14 px-12 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/10 flex-1 sm:flex-none"
            >
              {isSubmitting ? "جاري التأكيد..." : "تأكيد وإتمام الطلب"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
