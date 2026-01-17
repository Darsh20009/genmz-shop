import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingBag, Package, MapPin, CreditCard, ChevronRight, Clock, Truck, CheckCircle, Hash, Calendar, Wallet, Star, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { icon: any, color: string, label: string, bg: string, border: string }> = {
  new: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", label: "طلب جديد" },
  pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", label: "قيد الانتظار" },
  processing: { icon: Package, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", label: "قيد المعالجة" },
  shipped: { icon: Truck, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", label: "تم الشحن" },
  completed: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-100", label: "مكتمل" },
  delivered: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-100", label: "تم التوصيل" },
  cancelled: { icon: ShoppingBag, color: "text-red-600", bg: "bg-red-50", border: "border-red-100", label: "ملغي" },
};

const ReviewDialog = ({ productId, productName }: { productId: string, productName: string }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/reviews", {
        productId,
        rating,
        comment,
      });
    },
    onSuccess: () => {
      toast({
        title: "تم إرسال التقييم",
        description: "شكراً لك على تقييم المنتج. سيتم مراجعة تقييمك ونشره قريباً.",
      });
      setIsOpen(false);
      setComment("");
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل إرسال التقييم",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 font-bold gap-2">
          <Star className="w-4 h-4" />
          تقييم المنتج
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">تقييم: {productName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`p-1 transition-transform active:scale-90 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                <Star className="w-8 h-8 fill-current" />
              </button>
            ))}
          </div>
          <div className="grid gap-2 text-right">
            <Label htmlFor="comment" className="font-bold">رأيك بالمنتج</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="اكتب تجربتك مع المنتج هنا..."
              className="h-32 rounded-2xl resize-none"
            />
          </div>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !comment.trim()}
            className="w-full h-12 rounded-2xl font-bold text-lg"
          >
            {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "إرسال التقييم"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const OrderCard = ({ order }: { order: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const canReview = order.status === "completed" || order.status === "delivered";
  const canCancel = order.status === "new" || order.status === "pending";
  const canReturn = order.status === "completed" || order.status === "delivered";

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/orders/${order.id}/cancel`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.my.path] });
      toast({ title: "تم إلغاء الطلب", description: "تم إلغاء طلبك بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message || "فشل إلغاء الطلب", variant: "destructive" });
    }
  });

  const returnMutation = useMutation({
    mutationFn: async (reason: string) => {
      const res = await apiRequest("POST", `/api/orders/${order.id}/return`, { reason });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.my.path] });
      toast({ title: "تم إرسال الطلب", description: "تم إرسال طلب الاسترجاع بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message || "فشل إرسال الطلب", variant: "destructive" });
    }
  });

  const [returnReason, setReturnReason] = useState("");

  const handlePrintInvoice = () => {
      const printWindow = window.open('', '', 'height=800,width=600');
      if (!printWindow) return;
      
      const itemsHtml = order.items.map((item: any) => 
        `<div class="item">
          <span>${item.quantity}x ${item.title}</span>
          <span>${(item.price * item.quantity).toFixed(2)} ر.س</span>
        </div>`
      ).join('');
      
      const taxAmount = Number(order.vatAmount);
      const subtotal = Number(order.subtotal);
      const total = Number(order.total);
      
      const qrData = `Seller: Gen M&Z\nOrder: ${order.id}\nTotal: ${total.toFixed(2)}\nVAT: ${taxAmount.toFixed(2)}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

      const printContent = `<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="utf-8">
  <title>فاتورة ضريبية #${order.id.slice(-6).toUpperCase()}</title>
  <style>
    body { font-family: 'Cairo', sans-serif; text-align: right; padding: 40px; color: #000; line-height: 1.6; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
    .logo-area h1 { margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -1px; }
    .invoice-info { text-align: left; }
    .invoice-info h2 { margin: 0; font-size: 20px; color: #666; }
    .details-grid { display: grid; grid-cols: 2; gap: 20px; margin-bottom: 40px; }
    .section-title { font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 10px; }
    .items-table { w-full; border-collapse: collapse; margin-bottom: 40px; }
    .items-table th { text-align: right; border-bottom: 1px solid #eee; padding: 15px 0; font-size: 12px; text-transform: uppercase; color: #999; }
    .items-table td { padding: 20px 0; border-bottom: 1px solid #f9f9f9; }
    .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .totals { margin-right: auto; width: 250px; border-top: 2px solid #000; padding-top: 20px; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: bold; }
    .grand-total { font-size: 24px; font-weight: 900; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
    .qr-section { text-align: center; margin-top: 60px; }
    .footer { text-align: center; margin-top: 100px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 30px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-area">
      <h1>GEN M&Z</h1>
      <p>Luxury Fashion Experience</p>
      <p>الرقم الضريبي: 312345678900003</p>
    </div>
    <div class="invoice-info">
      <h2>فاتورة ضريبية</h2>
      <p>#${order.id.slice(-6).toUpperCase()}</p>
      <p>${new Date(order.createdAt).toLocaleDateString('ar-SA')}</p>
    </div>
  </div>

  <div style="display: flex; justify-content: space-between; margin-bottom: 50px;">
    <div>
      <div class="section-title">العميل</div>
      <p style="font-weight: bold; margin: 0;">${order.userId}</p>
      <p style="margin: 5px 0; color: #666;">${order.shippingAddress?.city}, ${order.shippingAddress?.street}</p>
    </div>
    <div style="text-align: left;">
      <div class="section-title">طريقة الدفع</div>
      <p style="font-weight: bold; margin: 0;">${order.paymentMethod}</p>
    </div>
  </div>

  <div class="section-title">المنتجات</div>
  <div style="margin-bottom: 40px;">
    ${itemsHtml}
  </div>

  <div class="totals">
    <div class="total-row">
      <span>المجموع الفرعي</span>
      <span>${subtotal.toFixed(2)} ر.س</span>
    </div>
    <div class="total-row">
      <span>الضريبة (١٥٪)</span>
      <span>${taxAmount.toFixed(2)} ر.س</span>
    </div>
    <div class="total-row grand-total">
      <span>الإجمالي</span>
      <span>${total.toFixed(2)} ر.س</span>
    </div>
  </div>

  <div class="qr-section">
    <img src="${qrUrl}" width="150" />
    <p style="font-size: 10px; color: #999; margin-top: 10px;">فاتورة إلكترونية معتمدة من هيئة الزكاة والضريبة والجمارك</p>
  </div>

  <div class="footer">
    <p>شكراً لثقتكم بـ GEN M&Z</p>
    <p>www.genmz.com</p>
  </div>
</body>
</html>`;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
      <Card className="overflow-hidden border-black/5 hover:border-black/10 transition-all group rounded-[2.5rem] shadow-sm hover:shadow-2xl bg-white mb-8 border">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row">
            {/* Status Side Panel */}
            <div className={`lg:w-56 ${status.bg} p-8 flex flex-col items-center justify-center text-center gap-4 border-b lg:border-b-0 lg:border-l ${status.border}`}>
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center ${status.color} border-2 ${status.border}`}
              >
                <StatusIcon className="h-10 w-10" />
              </motion.div>
              <div className="space-y-1">
                <span className={`text-[10px] font-black uppercase tracking-widest ${status.color} opacity-40`}>حالة الطلب</span>
                <p className={`font-black text-lg uppercase tracking-tight ${status.color}`}>{status.label}</p>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 lg:p-10 space-y-8">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="bg-black/5 p-4 rounded-3xl group-hover:bg-black/10 transition-colors">
                    <Hash className="h-6 w-6 text-black/30" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">رقم المرجع</span>
                    <p className="font-black text-xl tracking-tight">#{order.id.slice(-6).toUpperCase()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-5">
                  <div className="bg-black/5 p-4 rounded-3xl">
                    <Calendar className="h-6 w-6 text-black/30" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">تاريخ الطلب</span>
                    <p className="font-bold text-base text-black/70">
                      {new Date(order.createdAt).toLocaleDateString("ar-SA", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-black/5">
                <div className="flex items-center gap-5">
                  <div className="bg-primary/5 p-4 rounded-3xl">
                    <Wallet className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">إجمالي المبلغ</span>
                    <div className="flex items-baseline gap-1">
                      <p className="font-black text-3xl text-primary">{order.total}</p>
                      <span className="text-xs font-black text-black/20 uppercase">ر.س</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handlePrintInvoice}
                    className="rounded-full px-8 h-14 font-black uppercase tracking-widest text-[11px] border-black/5 hover:bg-black hover:text-white transition-all shadow-sm active:scale-95 ml-2"
                  >
                    تحميل الفاتورة
                    <ShoppingBag className="mr-2 h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="rounded-full px-8 h-14 font-black uppercase tracking-widest text-[11px] border-black/5 hover:bg-black hover:text-white transition-all shadow-sm active:scale-95"
                  >
                    {isExpanded ? "إخفاء التفاصيل" : "عرض المحتويات"}
                    <ChevronRight className={`mr-2 h-4 w-4 transition-transform duration-500 ${isExpanded ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                  </Button>
                </div>
              </div>

              {/* Progressive Tracking Timeline */}
              <div className="relative pt-12 pb-8">
                <div className="absolute top-[3.25rem] left-0 right-0 h-[2px] bg-black/5" />
                <div className="relative flex justify-between items-start gap-2">
                  {[
                    { id: 'new', label: 'طلب جديد', icon: Clock },
                    { id: 'processing', label: 'تجهيز', icon: Package },
                    { id: 'shipped', label: 'شحن', icon: Truck },
                    { id: 'completed', label: 'استلام', icon: CheckCircle }
                  ].map((step, idx) => {
                    const stepOrder = ['new', 'pending', 'processing', 'shipped', 'completed', 'delivered', 'returned', 'cancelled'];
                    const currentIdx = stepOrder.indexOf(order.status);
                    const stepIdx = stepOrder.indexOf(step.id);
                    const isActive = currentIdx >= stepIdx && order.status !== 'cancelled' && order.status !== 'returned';
                    
                    return (
                      <div key={step.id} className="flex flex-col items-center gap-4 relative z-10 flex-1">
                        <motion.div 
                          initial={false}
                          animate={{ 
                            scale: isActive ? 1.1 : 1,
                            backgroundColor: isActive ? 'var(--primary)' : 'white'
                          }}
                          className={`w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center border-2 transition-colors ${isActive ? 'border-primary text-white' : 'border-black/5 text-black/20'}`}
                        >
                          <step.icon className="w-5 h-5" />
                        </motion.div>
                        <span className={`text-[10px] font-black uppercase tracking-widest text-center ${isActive ? 'text-black' : 'text-black/20'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons: Cancel/Return */}
              <div className="flex flex-wrap gap-4 pt-4">
                {canCancel && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="rounded-full px-8 font-black text-xs uppercase tracking-widest">
                        إلغاء الطلب
                      </Button>
                    </DialogTrigger>
                    <DialogContent dir="rtl">
                      <DialogHeader>
                        <DialogTitle>تأكيد الإلغاء</DialogTitle>
                      </DialogHeader>
                      <p className="py-4 font-bold text-black/60">هل أنت متأكد من رغبتك في إلغاء الطلب؟ لا يمكن التراجع عن هذا الإجراء.</p>
                      <Button 
                        variant="destructive" 
                        onClick={() => cancelMutation.mutate()} 
                        disabled={cancelMutation.isPending}
                        className="w-full rounded-2xl font-black"
                      >
                        {cancelMutation.isPending ? <Loader2 className="animate-spin" /> : "نعم، إلغاء الطلب"}
                      </Button>
                    </DialogContent>
                  </Dialog>
                )}
                {canReturn && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary" className="rounded-full px-8 font-black text-xs uppercase tracking-widest bg-black text-white hover:bg-black/80">
                        طلب استرجاع
                      </Button>
                    </DialogTrigger>
                    <DialogContent dir="rtl">
                      <DialogHeader>
                        <DialogTitle>طلب استرجاع المنتج</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4 text-right">
                        <Label className="font-black text-xs uppercase tracking-widest">سبب الاسترجاع</Label>
                        <Textarea 
                          value={returnReason}
                          onChange={(e) => setReturnReason(e.target.value)}
                          placeholder="يرجى ذكر سبب الاسترجاع..."
                          className="rounded-2xl h-32 resize-none"
                        />
                      </div>
                      <Button 
                        onClick={() => returnMutation.mutate(returnReason)} 
                        disabled={returnMutation.isPending || !returnReason.trim()}
                        className="w-full h-14 rounded-2xl font-black text-lg"
                      >
                        {returnMutation.isPending ? <Loader2 className="animate-spin" /> : "إرسال طلب الاسترجاع"}
                      </Button>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-8 space-y-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-[2px] w-8 bg-black/10" />
                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-black/30">محتويات الشحنة</h4>
                      </div>
                      
                      <div className="grid gap-4">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center p-5 bg-black/[0.02] rounded-[1.5rem] border border-black/[0.03] hover:bg-black/[0.04] transition-colors">
                            <div className="flex items-center gap-5">
                              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-black text-sm shadow-sm border border-black/5">
                                <span className="text-black/30 ml-1">x</span>{item.quantity}
                              </div>
                              <div>
                                <p className="font-black text-base text-black/80">{item.title}</p>
                                <p className="text-[10px] font-bold text-black/30 tracking-widest uppercase">SKU: {item.variantSku}</p>
                                {item.isActive === false && (
                                  <Badge variant="destructive" className="mt-1 text-[8px] h-4">غير متوفر حالياً</Badge>
                                )}
                                {canReview && (
                                  <div className="mt-2">
                                    <ReviewDialog productId={item.productId} productName={item.title} />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-lg">{item.price * item.quantity} <span className="text-[10px] text-black/20">ر.س</span></p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {order.shippingAddress && (
                        <div className="mt-8 p-6 bg-primary/[0.03] rounded-[2rem] border border-primary/10 flex items-start gap-5">
                          <div className="bg-white p-3 rounded-2xl shadow-sm text-primary">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">عنوان التوصيل</h4>
                            <p className="font-bold text-sm text-black/70 leading-relaxed">
                              {order.shippingAddress.city}, {order.shippingAddress.street}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
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
      return await res.json();
    },
    enabled: !!user,
  });

  if (authLoading) return (
    <Layout>
      <div className="container py-24 text-center">
        <Loader2 className="animate-spin mx-auto text-primary h-12 w-12 opacity-20" />
      </div>
    </Layout>
  );

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <Layout>
      <div className="container py-16 px-4 max-w-5xl mx-auto min-h-[80vh]">
        <header className="mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            <h1 className="font-black text-6xl md:text-8xl uppercase tracking-tighter leading-none">طلباتي</h1>
            <div className="flex items-center gap-4 mt-[29px] mb-[29px]">
              <div className="h-[3px] w-16 bg-primary rounded-full" />
              <p className="text-black/30 font-black text-[11px] uppercase tracking-[0.4em]">M&Z LUXURY EXPERIENCE • ORDERS TRACKING</p>
            </div>
          </motion.div>
        </header>

        {isLoading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 w-full bg-black/[0.03] animate-pulse rounded-[3rem]" />
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32 px-10 bg-black/[0.01] rounded-[4rem] border-2 border-dashed border-black/5"
          >
            <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl border border-black/5">
              <ShoppingBag className="h-14 w-14 text-black/10" />
            </div>
            <h2 className="font-black text-4xl mb-4 tracking-tight">صندوق طلباتك فارغ</h2>
            <p className="text-black/30 font-bold text-sm mb-12 uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
              لم تقم بأي عمليات شراء حتى الآن. اكتشف أحدث صيحات الموضة في متجرنا
            </p>
            <Button
              onClick={() => setLocation("/products")}
              size="lg"
              className="rounded-full px-16 h-16 font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:shadow-primary/20 active:scale-95 transition-all"
            >
              اكتشف المتجر
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-10">
            {orders.map((order: any) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
