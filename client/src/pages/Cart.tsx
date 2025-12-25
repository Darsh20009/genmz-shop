import { Layout } from "@/components/Layout";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag } from "lucide-react";
import { Link } from "wouter";

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-24 text-center">
          <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-4">سلة المشتريات فارغة</h1>
          <p className="text-muted-foreground mb-8">لم تقم بإضافة أي منتجات للسلة بعد.</p>
          <Link href="/products">
            <Button size="lg">تصفح المنتجات</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="font-display text-4xl font-bold mb-12">سلة المشتريات</h1>
        
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantSku}`} className="flex gap-6 p-4 rounded-xl bg-card border border-border">
                <div className="w-24 h-24 bg-secondary rounded-lg overflow-hidden shrink-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.color} / {item.size}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => updateQuantity(item.productId, item.variantSku, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 rounded border flex items-center justify-center hover:bg-secondary"
                      >
                        -
                      </button>
                      <span className="font-mono w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.variantSku, item.quantity + 1)}
                        className="w-8 h-8 rounded border flex items-center justify-center hover:bg-secondary"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="font-bold font-mono">{(item.price * item.quantity).toLocaleString()} ر.س</span>
                      <button 
                        onClick={() => removeItem(item.productId, item.variantSku)}
                        className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              <h3 className="font-display text-xl font-bold mb-6">ملخص الطلب</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-muted-foreground">
                  <span>المجموع الفرعي</span>
                  <span>{total().toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>الضريبة (15%)</span>
                  <span>{(total() * 0.15).toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>الشحن</span>
                  <span>مجاني</span>
                </div>
                <div className="border-t pt-4 flex justify-between font-bold text-xl">
                  <span>الإجمالي</span>
                  <span className="text-primary">{(total() * 1.15).toLocaleString()} ر.س</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button size="lg" className="w-full font-bold h-12">
                  إتمام الشراء
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
