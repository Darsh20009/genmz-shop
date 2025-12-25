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
      <div className="container py-24">
        <h1 className="font-display text-5xl md:text-7xl font-black mb-16 uppercase tracking-tighter text-right border-b border-black/5 pb-12">حقيبة التسوق</h1>
        
        <div className="grid lg:grid-cols-3 gap-16 items-start">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantSku}`} className="flex flex-col sm:flex-row gap-8 p-6 bg-white border border-black/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-full sm:w-32 aspect-[3/4] bg-white border border-black/5 overflow-hidden shrink-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between text-right">
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <span className="font-light text-xl tracking-tight">{(item.price * item.quantity).toLocaleString()} ر.س</span>
                      <h3 className="font-black text-xl uppercase tracking-tight">{item.title}</h3>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-black/40">
                      {item.color} | {item.size}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-8">
                    <button 
                      onClick={() => removeItem(item.productId, item.variantSku)}
                      className="text-black/40 hover:text-black transition-colors uppercase text-[10px] font-bold tracking-[0.2em] border-b border-black/20 pb-1"
                    >
                      إزالة القطعة
                    </button>

                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => updateQuantity(item.productId, item.variantSku, Math.max(1, item.quantity - 1))}
                        className="w-10 h-10 border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors text-xl font-light"
                      >
                        -
                      </button>
                      <span className="text-xl font-light w-8 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.variantSku, item.quantity + 1)}
                        className="w-10 h-10 border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors text-xl font-light"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-black text-white p-10 sticky top-24 shadow-2xl">
              <h3 className="font-display text-2xl font-black mb-10 uppercase tracking-widest border-b border-white/10 pb-6">ملخص الحقيبة</h3>
              
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
                  <span>الإجمالي</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button size="lg" className="w-full font-bold h-16 uppercase tracking-[0.3em] rounded-none bg-white text-black hover:bg-primary hover:text-white border-none transition-all">
                  إتمام عملية الشراء
                </Button>
              </Link>
              
              <div className="mt-8 text-[10px] uppercase tracking-[0.2em] opacity-40 text-center">
                شحن مجاني على جميع الطلبات لفترة محدودة
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
