import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Loader2, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminManualOrder() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items, setItems] = useState<{ productId: string; productName: string; price: number; quantity: number; variantSku?: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const addItem = (productId: string) => {
    const product = products?.find((p) => p.id === productId);
    if (!product) return;

    const existingItem = items.find((item) => item.productId === productId);
    if (existingItem) {
      setItems(items.map((item) => 
        item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setItems([...items, {
        productId: product.id,
        productName: product.name,
        price: parseFloat(product.price),
        quantity: 1,
        variantSku: product.variants?.[0]?.sku
      }]);
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    setItems(items.map((item, i) => i === index ? { ...item, quantity } : item));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إضافة منتج واحد على الأقل",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/orders", {
        customerName,
        customerPhone,
        items,
        subtotal,
        tax,
        total,
        status: "new",
        type: "online",
        paymentStatus: "paid",
        paymentMethod: "cash",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء الطلب اليدوي بنجاح",
      });
      setLocation("/admin/orders");
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إنشاء الطلب",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="p-8" dir="rtl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black">إنشاء طلب يدوي</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl font-bold">معلومات العميل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم العميل</Label>
                    <Input 
                      id="name" 
                      value={customerName} 
                      onChange={(e) => setCustomerName(e.target.value)} 
                      placeholder="أدخل اسم العميل"
                      className="rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input 
                      id="phone" 
                      value={customerPhone} 
                      onChange={(e) => setCustomerPhone(e.target.value)} 
                      placeholder="05xxxxxxxx"
                      className="rounded-xl h-12"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-xl font-bold">المنتجات المختارة</CardTitle>
                <div className="w-64">
                  <Select onValueChange={addItem}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="اختر منتجاً لإضافته" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingProducts ? (
                        <div className="p-2 flex justify-center"><Loader2 className="h-4 w-4 animate-spin" /></div>
                      ) : (
                        products?.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - {product.price} ر.س
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-[2rem]">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>لم يتم إضافة أي منتجات بعد</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                        <div className="flex-1">
                          <h4 className="font-bold">{item.productName}</h4>
                          <p className="text-sm text-muted-foreground">{item.price} ر.س</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border rounded-xl overflow-hidden">
                            <button 
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                              className="px-3 py-1 hover:bg-muted"
                            >-</button>
                            <span className="px-4 py-1 border-x font-bold">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                              className="px-3 py-1 hover:bg-muted"
                            >+</button>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold">ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>المجموع الفرعي</span>
                    <span>{subtotal.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>ضريبة القيمة المضافة (15%)</span>
                    <span>{tax.toFixed(2)} ر.س</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between text-xl font-black">
                    <span>الإجمالي</span>
                    <span>{total.toFixed(2)} ر.س</span>
                  </div>
                </div>

                <Button 
                  className="w-full rounded-2xl h-14 text-lg font-bold" 
                  disabled={isSubmitting || items.length === 0}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : <Plus className="h-5 w-5 ml-2" />}
                  تأكيد الطلب
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
