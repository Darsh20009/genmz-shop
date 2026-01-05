import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  Printer,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  PlusCircle,
  Trash2,
  Package,
  Globe
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Order, Product } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Layout } from "@/components/Layout";
import { Label } from "@/components/ui/label";

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const { toast } = useToast();

  const { data: ordersData, isLoading } = useQuery<any>({
    queryKey: ["/api/orders"],
  });

  const orders = Array.isArray(ordersData) ? ordersData : ordersData?.data || [];

  const { data: productsData } = useQuery<any>({
    queryKey: ["/api/products"],
  });

  const products = Array.isArray(productsData) ? productsData : productsData?.data || [];

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, paymentStatus, note, adminNotes }: { orderId: string, status: string, paymentStatus?: string, note?: string, adminNotes?: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status, paymentStatus, note, adminNotes });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "تم تحديث الطلب",
        description: "تم تحديث بيانات الطلب بنجاح",
      });
    },
  });

  const refundMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await apiRequest("POST", `/api/orders/${orderId}/refund`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "تم الاسترجاع",
        description: "تمت عملية الاسترجاع المالي بنجاح",
      });
    },
  });

  const [manualOrderItems, setManualOrderItems] = useState<{ productId: string, productName: string, price: number, quantity: number }[]>([]);
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "", city: "", street: "" });

  const createManualOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const res = await apiRequest("POST", "/api/orders/manual", orderData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setIsManualOrderOpen(false);
      setManualOrderItems([]);
      setCustomerInfo({ name: "", phone: "", city: "", street: "" });
      toast({
        title: "تم إنشاء الطلب",
        description: "تم إنشاء الطلب اليدوي بنجاح",
      });
    },
  });

  const handleAddManualItem = (productId: string) => {
    const product = (products as any[]).find((p: any) => p.id === productId || p._id === productId);
    if (product) {
      setManualOrderItems([...manualOrderItems, {
        productId: product._id || product.id,
        productName: product.name,
        price: Number(product.price),
        quantity: 1
      }]);
    }
  };

  const handleRemoveManualItem = (index: number) => {
    const newItems = [...manualOrderItems];
    newItems.splice(index, 1);
    setManualOrderItems(newItems);
  };

  const calculateManualTotal = () => {
    return manualOrderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const handlePrint = (order: Order) => {
    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast({
          title: "خطأ",
          description: "يرجى السماح بفتح النوافذ المنبثقة (Pop-ups) لطباعة الفاتورة",
          variant: "destructive"
        });
        return;
      }

      const itemsHtml = (order.items || []).map((item: any) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.productName || item.title || 'منتج'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity || 0}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: left;">${item.price || 0} ر.س</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: left;">${(item.price || 0) * (item.quantity || 0)} ر.س</td>
        </tr>
      `).join("");

      const receiptHtml = (order as any).bankTransferReceipt ? `
        <div style="margin-top: 40px; page-break-before: always;">
          <h2 style="text-align: center; color: #6366f1; margin-bottom: 20px;">إيصال التحويل البنكي</h2>
          <img src="${(order as any).bankTransferReceipt}" style="max-width: 100%; height: auto; border: 1px solid #eee; border-radius: 8px;" />
        </div>
      ` : '';

      const htmlContent = `
        <html dir="rtl">
          <head>
            <meta charset="UTF-8">
            <title>فاتورة ضريبية مبسطة #${order.orderNumber || order.id?.toString().slice(-6).toUpperCase()}</title>
            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
            <style>
              @page { size: A4; margin: 20mm; }
              * { box-sizing: border-box; }
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 0; color: #333; line-height: 1.6; background: white; }
              .invoice-box { max-width: 800px; margin: auto; padding: 0; }
              .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 3px solid #6366f1; padding-bottom: 20px; }
              .logo-section h1 { margin: 0; color: #6366f1; font-size: 28px; font-weight: 900; }
              .logo-section p { margin: 5px 0 0; color: #666; }
              .tax-invoice-label { background: #6366f1; color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 18px; margin-bottom: 10px; display: inline-block; }
              
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
              .info-card { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
              .info-card h3 { margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px; font-size: 16px; color: #1e293b; }
              .info-card p { margin: 4px 0; font-size: 14px; }
              
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
              th { background: #6366f1; color: white; padding: 15px; text-align: right; font-size: 14px; }
              td { padding: 12px 15px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
              tr:last-child td { border-bottom: none; }
              
              .summary-section { display: flex; justify-content: space-between; align-items: flex-start; }
              .qr-code { padding: 10px; border: 1px solid #e2e8f0; border-radius: 12px; background: white; }
              .totals-box { width: 300px; }
              .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
              .total-row.grand-total { border-top: 2px solid #6366f1; border-bottom: none; margin-top: 10px; padding-top: 15px; }
              .total-row.grand-total span { font-size: 20px; font-weight: 900; color: #6366f1; }
              
              .barcode-container { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px dashed #cbd5e1; }
              .footer { margin-top: 50px; text-align: center; color: #64748b; font-size: 12px; }
              
              @media print {
                body { -webkit-print-color-adjust: exact; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="invoice-box">
              <div class="header">
                <div class="logo-section">
                  <h1>GEN M&Z</h1>
                  <p>تجربة تسوق فريدة</p>
                </div>
                <div style="text-align: left;">
                  <div class="tax-invoice-label">فاتورة ضريبية مبسطة</div>
                  <p><strong>رقم الفاتورة:</strong> ${order.orderNumber || order.id?.toString().slice(-6).toUpperCase()}</p>
                  <p><strong>التاريخ:</strong> ${format(new Date(order.createdAt), "dd/MM/yyyy")}</p>
                </div>
              </div>

              <div class="info-grid">
                <div class="info-card">
                  <h3>بيانات العميل</h3>
                  <p><strong>الاسم:</strong> ${order.customerName || "عميل زائر"}</p>
                  <p><strong>الجوال:</strong> ${order.customerPhone || "غير مسجل"}</p>
                  <p><strong>العنوان:</strong> ${order.shippingAddress?.city || ""} - ${order.shippingAddress?.street || ""}</p>
                </div>
                <div class="info-card" style="text-align: left;">
                  <h3>بيانات المتجر</h3>
                  <p><strong>متجر GEN M&Z</strong></p>
                  <p><strong>الرقم الضريبي:</strong> 310000000000003</p>
                  <p><strong>العنوان:</strong> الرياض - المملكة العربية السعودية</p>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>المنتج</th>
                    <th style="text-align: center;">الكمية</th>
                    <th style="text-align: left;">السعر (شامل الضريبة)</th>
                    <th style="text-align: left;">المجموع</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div class="summary-section">
                <div class="qr-code">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`Seller: GEN M&Z\nTax ID: 310000000000003\nDate: ${order.createdAt}\nTotal: ${order.total}\nVAT: ${order.vatAmount}`)}" alt="ZATCA QR Code" />
                  <p style="font-size: 10px; color: #94a3b8; text-align: center; margin-top: 5px;">QR الفاتورة الضريبية</p>
                </div>
                
                <div class="totals-box">
                  <div class="total-row">
                    <span>المجموع (غير شامل الضريبة):</span>
                    <span>${(Number(order.subtotal) - Number(order.vatAmount)).toFixed(2)} ر.س</span>
                  </div>
                  <div class="total-row">
                    <span>ضريبة القيمة المضافة (15%):</span>
                    <span>${order.vatAmount} ر.س</span>
                  </div>
                  <div class="total-row">
                    <span>تكلفة الشحن:</span>
                    <span>${order.shippingCost || 0} ر.س</span>
                  </div>
                  <div class="total-row grand-total">
                    <span>الإجمالي النهائي:</span>
                    <span>${order.total} ر.س</span>
                  </div>
                </div>
              </div>

              <div class="barcode-container">
                <svg id="barcode"></svg>
                <script>
                  JsBarcode("#barcode", "${order.orderNumber || order.id}", {
                    format: "CODE128",
                    width: 2,
                    height: 40,
                    displayValue: true
                  });
                </script>
              </div>

              ${receiptHtml}

              <div class="footer">
                <p>تعتبر هذه الفاتورة ضريبية مبسطة وفقاً لمتطلبات هيئة الزكاة والضريبة والجمارك</p>
                <p>شكراً لثقتكم بـ GEN M&Z</p>
              </div>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Delay print dialog slightly to ensure DOM is ready
      setTimeout(() => {
        if (printWindow.print) {
          printWindow.print();
        }
      }, 250);

      // Auto-close after printing
      setTimeout(() => {
        try {
          printWindow.close();
        } catch (e) {
          // Browser might prevent closing in some cases
        }
      }, 1000);

      toast({
        title: "طباعة",
        description: "تم فتح نافذة الطباعة",
      });
    } catch (err) {
      console.error("Print error:", err);
      toast({
        title: "خطأ في الطباعة",
        description: "حدث خطأ أثناء محاولة طباعة الفاتورة",
        variant: "destructive"
      });
    }
  };

  const handleExport = () => {
    if (orders.length === 0) return;
    
    const headers = ["رقم الطلب", "العميل", "الجوال", "التاريخ", "الإجمالي", "الحالة", "المصدر"];
    const csvData = orders.map(order => [
      order.orderNumber || (order as any).id?.toString().slice(-6).toUpperCase(),
      order.customerName || "عميل زائر",
      order.customerPhone || "",
      format(new Date(order.createdAt), "yyyy-MM-dd"),
      order.total,
      order.status,
      order.type
    ]);
    
    const csvContent = "\uFEFF" + [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "تم التصدير",
      description: "تم تصدير البيانات بنجاح",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      toast({
        title: "جاري الاستيراد",
        description: "هذه الميزة تتطلب معالجة خاصة للبيانات، تم استلام الملف.",
      });
      console.log("Imported content:", text);
    };
    reader.readAsText(file);
  };

  const filteredOrders = (Array.isArray(orders) ? orders : []).filter(order => {
    const searchLower = searchTerm.toLowerCase();
    const orderNum = (order.orderNumber || (order as any).id || "").toLowerCase();
    const custName = (order.customerName || "عميل زائر").toLowerCase();
    const custPhone = (order.customerPhone || "");

    const matchesSearch = 
      orderNum.includes(searchLower) ||
      custName.includes(searchLower) ||
      custPhone.includes(searchTerm);
    
    let matchesStatus = true;
    if (statusFilter === "all") {
      matchesStatus = true;
    } else if (statusFilter === "bank_transfer_pending") {
      // Show orders with bank_transfer method and pending payment status
      matchesStatus = (order as any).paymentMethod === "bank_transfer" && ((order as any).paymentStatus === "pending" || !(order as any).paymentStatus);
    } else {
      matchesStatus = order.status === statusFilter;
    }
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><Clock className="w-3 h-3 ml-1" /> جديد</Badge>;
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100"><Clock className="w-3 h-3 ml-1" /> قيد التنفيذ</Badge>;
      case "shipped":
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100"><Truck className="w-3 h-3 ml-1" /> تم الشحن</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 ml-1" /> مكتمل</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="w-3 h-3 ml-1" /> ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 space-y-8" dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2">
              <ShoppingBag className="w-8 h-8 text-primary" />
              جميع طلبات متجرك
            </h1>
            <p className="text-muted-foreground mt-1 font-medium">متابعة ومعالجة جميع طلبات المتجر من هنا</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="استيراد"
              />
              <Button variant="outline" className="gap-2 rounded-xl border-2 font-bold h-11 hover-elevate">
                <PlusCircle className="w-4 h-4" />
                استيراد
              </Button>
            </div>
            <Button 
              variant="outline" 
              className="gap-2 rounded-xl border-2 font-bold h-11 hover-elevate"
              onClick={handleExport}
            >
              <Download className="w-4 h-4" />
              تصدير البيانات
            </Button>
            <Dialog open={isManualOrderOpen} onOpenChange={setIsManualOrderOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 rounded-xl font-bold h-11 shadow-lg shadow-primary/20 hover-elevate">
                  <PlusCircle className="w-5 h-5" />
                  إنشاء طلب يدوي
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">إنشاء طلب يدوي جديد</DialogTitle>
                  <DialogDescription className="font-medium">أضف تفاصيل العميل والمنتجات لإنشاء طلب جديد يدوياً</DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-4 p-4 border rounded-2xl bg-muted/30">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      معلومات العميل
                    </h3>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label>اسم العميل</Label>
                        <Input 
                          placeholder="الاسم الثلاثي" 
                          className="rounded-xl h-11"
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>رقم الهاتف</Label>
                        <Input 
                          placeholder="05xxxxxxxx" 
                          className="rounded-xl h-11"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>المدينة</Label>
                          <Input 
                            placeholder="الرياض" 
                            className="rounded-xl h-11"
                            value={customerInfo.city}
                            onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>الشارع / الحي</Label>
                          <Input 
                            placeholder="حي الياسمين" 
                            className="rounded-xl h-11"
                            value={customerInfo.street}
                            onChange={(e) => setCustomerInfo({...customerInfo, street: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 border rounded-2xl bg-muted/30">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      إضافة منتجات
                    </h3>
                    <div className="space-y-4">
                      <Select onValueChange={handleAddManualItem}>
                        <SelectTrigger className="rounded-xl h-11">
                          <SelectValue placeholder="اختر منتجاً..." />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(product => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - {product.price} ر.س
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {manualOrderItems.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-xl border shadow-sm">
                            <div className="flex-1">
                              <p className="font-bold text-sm">{item.productName}</p>
                              <p className="text-xs text-muted-foreground">{item.price} ر.س</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Input 
                                type="number" 
                                min="1" 
                                className="w-16 h-8 text-center rounded-lg"
                                value={item.quantity}
                                onChange={(e) => {
                                  const newItems = [...manualOrderItems];
                                  newItems[index].quantity = parseInt(e.target.value) || 1;
                                  setManualOrderItems(newItems);
                                }}
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500 hover:text-red-700"
                                onClick={() => handleRemoveManualItem(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t flex justify-between items-center">
                        <span className="font-bold">الإجمالي:</span>
                        <span className="text-xl font-black text-primary">{calculateManualTotal()} ر.س</span>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <Button 
                    variant="outline" 
                    className="rounded-xl font-bold h-11"
                    onClick={() => setIsManualOrderOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button 
                    className="rounded-xl font-bold h-11 min-w-[120px]"
                    onClick={() => createManualOrderMutation.mutate({
                      customerName: customerInfo.name,
                      customerPhone: customerInfo.phone,
                      shippingAddress: {
                        name: customerInfo.name,
                        city: customerInfo.city,
                        street: customerInfo.street
                      },
                      items: manualOrderItems,
                      subtotal: calculateManualTotal(),
                      tax: calculateManualTotal() * 0.15,
                      total: calculateManualTotal() * 1.15,
                      status: "new",
                      type: "pos"
                    })}
                    disabled={createManualOrderMutation.isPending || manualOrderItems.length === 0}
                  >
                    {createManualOrderMutation.isPending ? "جاري الإنشاء..." : "تأكيد الطلب"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="rounded-3xl border-2 shadow-xl shadow-muted/20 overflow-hidden">
          <CardHeader className="bg-muted/30 pb-6 border-b">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="البحث برقم الطلب، اسم العميل، أو الجوال..." 
                  className="pr-10 h-12 rounded-2xl border-2 focus-visible:ring-primary/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] h-12 rounded-2xl border-2 font-bold">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      <SelectValue placeholder="الحالة" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-2">
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="new">جديد</SelectItem>
                    <SelectItem value="bank_transfer_pending">انتظار التحويل</SelectItem>
                    <SelectItem value="processing">قيد التنفيذ</SelectItem>
                    <SelectItem value="shipped">تم الشحن</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow className="hover:bg-transparent border-b-2">
                    <TableHead className="font-bold text-right py-4">رقم الطلب</TableHead>
                    <TableHead className="font-bold text-right py-4">العميل</TableHead>
                    <TableHead className="font-bold text-right py-4">التاريخ</TableHead>
                    <TableHead className="font-bold text-right py-4">الإجمالي</TableHead>
                    <TableHead className="font-bold text-right py-4">الحالة</TableHead>
                    <TableHead className="font-bold text-right py-4">المصدر</TableHead>
                    <TableHead className="font-bold text-left py-4 px-6">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i} className="animate-pulse">
                        <TableCell colSpan={7} className="h-16 bg-muted/5"></TableCell>
                      </TableRow>
                    ))
                  ) : filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-40 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                          <ShoppingBag className="w-10 h-10 opacity-20" />
                          <p className="font-bold">لا يوجد طلبات مطابقة للبحث</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/10 transition-colors border-b last:border-0 group">
                        <TableCell className="font-black text-primary py-4">#{order.orderNumber || order.id.slice(-6).toUpperCase()}</TableCell>
                        <TableCell className="py-4">
                          <div className="flex flex-col">
                            <span className="font-bold">{order.customerName || "عميل زائر"}</span>
                            <span className="text-xs text-muted-foreground">{order.customerPhone}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 font-medium">
                          {format(new Date(order.createdAt), "dd MMM yyyy", { locale: ar })}
                        </TableCell>
                        <TableCell className="py-4 font-black">{order.total} ر.س</TableCell>
                        <TableCell className="py-4">{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="py-4">
                          {order.type === "online" ? (
                            <Badge variant="outline" className="rounded-lg gap-1"><Globe className="w-3 h-3" /> متجر</Badge>
                          ) : (
                            <Badge variant="outline" className="rounded-lg gap-1 border-primary/30 text-primary"><PlusCircle className="w-3 h-3" /> يدوي</Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-left">
                          <div className="flex items-center justify-start gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                              onClick={() => handlePrint(order)}
                              title="طباعة الفاتورة"
                            >
                              <Printer className="w-5 h-5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="w-5 h-5" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-xl">
                                  <MoreVertical className="w-5 h-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="rounded-2xl border-2 p-2 min-w-[220px]">
                                <DropdownMenuItem 
                                  className="gap-2 cursor-pointer font-bold"
                                  onClick={() => handlePrint(order)}
                                >
                                  <Printer className="w-4 h-4" />
                                  طباعة الفاتورة
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="gap-2 cursor-pointer font-bold"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  <Eye className="w-4 h-4" />
                                  تفاصيل الطلب
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {selectedOrder && (
          <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-0 shadow-2xl">
              <div className="bg-primary p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black">تفاصيل الطلب #{selectedOrder.orderNumber || selectedOrder.id.slice(-6).toUpperCase()}</h2>
                    <p className="opacity-80 font-medium mt-1">
                      {format(new Date(selectedOrder.createdAt), "EEEE, d MMMM yyyy", { locale: ar })}
                    </p>
                  </div>
                  <div className="text-left">
                    <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-1 rounded-full">
                      {selectedOrder.status === "new" ? "طلب جديد" : 
                       selectedOrder.status === "processing" ? "قيد المعالجة" :
                       selectedOrder.status === "shipped" ? "تم الشحن" :
                       selectedOrder.status === "completed" ? "مكتمل" : "ملغي"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4 p-6 border-2 rounded-2xl bg-muted/30">
                    <h3 className="font-bold text-lg flex items-center gap-2 border-b pb-2">
                      <User className="w-5 h-5 text-primary" />
                      معلومات العميل
                    </h3>
                    <div className="space-y-2">
                      <p className="font-bold text-lg">{selectedOrder.customerName || "عميل زائر"}</p>
                      <p className="flex items-center gap-2 text-muted-foreground font-medium">
                        <Phone className="w-4 h-4" />
                        {selectedOrder.customerPhone || "لا يوجد رقم"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 p-6 border-2 rounded-2xl bg-muted/30">
                    <h3 className="font-bold text-lg flex items-center gap-2 border-b pb-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      عنوان الشحن
                    </h3>
                    <div className="space-y-2 font-medium text-muted-foreground">
                      <p className="font-bold text-foreground">
                        {selectedOrder.shippingAddress?.city || "المدينة غير محددة"}
                      </p>
                      <p>{selectedOrder.shippingAddress?.street || "العنوان غير محدد"}</p>
                      <Badge variant="outline" className="mt-2 rounded-lg">
                        {selectedOrder.shippingMethod === "delivery" ? "توصيل للمنزل" : "استلام من الفرع"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4 p-6 border-2 rounded-2xl bg-muted/30">
                    <h3 className="font-bold text-lg flex items-center gap-2 border-b pb-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      الدفع والشحن
                    </h3>
                    <div className="space-y-2 font-medium">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">طريقة الدفع:</span>
                        <span className="font-bold">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">حالة الدفع:</span>
                        <Badge className={selectedOrder.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                          {selectedOrder.paymentStatus === "paid" ? "تم الدفع" : "معلق"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-black text-xl flex items-center gap-2">
                    <Package className="w-6 h-6 text-primary" />
                    المنتجات المطلوبة
                  </h3>
                  <div className="border-2 rounded-2xl overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="text-right font-bold py-4">المنتج</TableHead>
                          <TableHead className="text-center font-bold">الكمية</TableHead>
                          <TableHead className="text-left font-bold">السعر</TableHead>
                          <TableHead className="text-left font-bold">المجموع</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item, index) => (
                          <TableRow key={index} className="hover:bg-muted/5">
                            <TableCell className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                                  <Package className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="font-bold">{item.productName || (item as any).title}</p>
                                  <p className="text-xs text-muted-foreground">SKU: {item.variantSku}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-bold">{item.quantity}</TableCell>
                            <TableCell className="text-left font-medium">{item.price} ر.س</TableCell>
                            <TableCell className="text-left font-black">{item.price * item.quantity} ر.س</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      {selectedOrder.paymentMethod === "bank_transfer" && (
                        <div className="p-4 border-2 border-primary/20 rounded-2xl bg-primary/5">
                          <h4 className="font-bold mb-2 flex items-center gap-2 text-primary">
                            <CreditCard className="w-4 h-4" />
                            إيصال التحويل البنكي
                          </h4>
                          <div className="space-y-4">
                            {(selectedOrder as any).bankTransferReceipt || (selectedOrder as any).paymentTransferReceipt || (selectedOrder as any).paymentTransferNote ? (
                              <div className="space-y-2">
                                {((selectedOrder as any).bankTransferReceipt || (selectedOrder as any).paymentTransferReceipt) ? (
                                  <div className="relative group">
                                    <img 
                                      src={(selectedOrder as any).bankTransferReceipt || (selectedOrder as any).paymentTransferReceipt} 
                                      alt="إيصال التحويل" 
                                      className="w-full max-h-[400px] object-contain rounded-xl border-2 shadow-sm cursor-zoom-in hover:opacity-95 transition-all group-hover:shadow-md"
                                      onClick={() => window.open((selectedOrder as any).bankTransferReceipt || (selectedOrder as any).paymentTransferReceipt, '_blank')}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                      <div className="bg-black/50 text-white px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm">
                                        انقر للتكبير
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-4 bg-muted/50 rounded-xl border-2 border-dashed">
                                    <p className="text-sm font-bold text-muted-foreground mb-2">ملاحظة التحويل:</p>
                                    <p className="text-sm">{(selectedOrder as any).paymentTransferNote}</p>
                                  </div>
                                )}
                                {((selectedOrder as any).bankTransferReceipt || (selectedOrder as any).paymentTransferReceipt) && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full gap-2 text-xs h-9 rounded-xl hover-elevate"
                                    onClick={() => window.open((selectedOrder as any).bankTransferReceipt || (selectedOrder as any).paymentTransferReceipt, '_blank')}
                                  >
                                    <Globe className="w-4 h-4" />
                                    عرض الإيصال بالحجم الكامل
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl bg-muted/20 text-muted-foreground border-muted-foreground/20">
                                <Package className="w-10 h-10 mb-3 opacity-10" />
                                <p className="text-sm font-bold opacity-60">لا يوجد إيصال مرفق لهذا الطلب</p>
                              </div>
                            )}
                            
                            {selectedOrder.paymentStatus === "pending" && ((selectedOrder as any).bankTransferReceipt || (selectedOrder as any).paymentTransferReceipt) && (
                              <Button 
                                className="w-full h-11 rounded-xl font-bold gap-2 shadow-lg shadow-green-500/20 bg-green-600 hover:bg-green-700 mt-2"
                                onClick={() => {
                                  updateStatusMutation.mutate({ 
                                    orderId: selectedOrder.id, 
                                    status: "processing",
                                    paymentStatus: "paid",
                                    note: "تم تأكيد الدفع عبر التحويل البنكي"
                                  });
                                  setSelectedOrder(null);
                                }}
                                disabled={updateStatusMutation.isPending}
                              >
                                <CheckCircle2 className="w-5 h-5" />
                                تأكيد استلام المبلغ
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-bold">حالة الطلب</Label>
                        <Select 
                          defaultValue={selectedOrder.status}
                          onValueChange={(val) => updateStatusMutation.mutate({ orderId: selectedOrder.id, status: val })}
                        >
                          <SelectTrigger className="rounded-xl h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">جديد</SelectItem>
                            <SelectItem value="processing">قيد التنفيذ</SelectItem>
                            <SelectItem value="shipped">تم الشحن</SelectItem>
                            <SelectItem value="completed">مكتمل</SelectItem>
                            <SelectItem value="cancelled">ملغي</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="font-bold">حالة الدفع</Label>
                        <Select 
                          defaultValue={selectedOrder.paymentStatus}
                          onValueChange={(val) => updateStatusMutation.mutate({ orderId: selectedOrder.id, status: selectedOrder.status, paymentStatus: val })}
                        >
                          <SelectTrigger className="rounded-xl h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">معلق</SelectItem>
                            <SelectItem value="paid">تم الدفع</SelectItem>
                            <SelectItem value="refunded">مسترجع</SelectItem>
                            <SelectItem value="failed">فشل الدفع</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 p-8 rounded-3xl border-2 space-y-4">
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-muted-foreground font-medium">المجموع الفرعي</span>
                      <span className="font-bold">{selectedOrder.subtotal} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-muted-foreground font-medium">تكلفة الشحن</span>
                      <span className="font-bold">{selectedOrder.shippingCost || 0} ر.س</span>
                    </div>
                    <div className="pt-4 border-t-2 border-muted flex justify-between items-center">
                      <span className="text-xl font-black">الإجمالي النهائي</span>
                      <span className="text-3xl font-black text-primary">{selectedOrder.total} ر.س</span>
                    </div>
                  </div>
                      </div>

                      <DialogFooter className="pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex gap-2 w-full md:w-auto">
                          <Button 
                            variant="outline" 
                            className="flex-1 md:flex-none rounded-xl h-11 font-bold gap-2 hover-elevate"
                            onClick={() => handlePrint(selectedOrder)}
                          >
                            <Printer className="w-5 h-5" />
                            طباعة الفاتورة
                          </Button>
                          {selectedOrder.status !== "cancelled" && (
                            <Button 
                              variant="destructive" 
                              className="flex-1 md:flex-none rounded-xl h-11 font-bold gap-2"
                              onClick={() => {
                                if (confirm("هل أنت متأكد من إلغاء هذا الطلب؟")) {
                                  updateStatusMutation.mutate({ orderId: selectedOrder.id, status: "cancelled" });
                                  setSelectedOrder(null);
                                }
                              }}
                            >
                              <XCircle className="w-5 h-5" />
                              إلغاء الطلب
                            </Button>
                          )}
                        </div>
                        <Button 
                          className="w-full md:w-auto rounded-xl h-11 px-8 font-black"
                          onClick={() => setSelectedOrder(null)}
                        >
                          إغلاق التفاصيل
                        </Button>
                      </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}
