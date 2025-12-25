import { Layout } from "@/components/Layout";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const { t, language } = useLanguage();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-24 text-center">
          <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-4">{t('emptyCart')}</h1>
          <p className="text-muted-foreground mb-8">{t('emptyCartDesc')}</p>
          <Link href="/products">
            <Button size="lg">{t('browseProducts')}</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-24">
        <h1 className={`font-display text-5xl md:text-7xl font-black mb-16 uppercase tracking-tighter ${language === 'ar' ? 'text-right' : 'text-left'} border-b border-black/5 pb-12`}>{t('shoppingBag')}</h1>
        
        <div className="grid lg:grid-cols-3 gap-16 items-start">
          {/* Cart Items */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantSku}`} className="group flex gap-6 p-4 bg-white border border-black/5 shadow-sm hover:shadow-lg transition-all duration-500">
                  <div className="w-24 aspect-[3/4] bg-white border border-black/5 overflow-hidden shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  
                  <div className={`flex-1 flex flex-col justify-between ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    <div>
                      <h3 className="font-black text-sm uppercase tracking-tight mb-1 truncate">{item.title}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-2">
                        {item.color} | {item.size}
                      </p>
                      <span className="font-light text-sm tracking-tight block">{(item.price * item.quantity).toLocaleString()} {t('currency')}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <button 
                        onClick={() => removeItem(item.productId, item.variantSku)}
                        className="text-black/30 hover:text-red-500 transition-colors uppercase text-[9px] font-bold tracking-widest"
                      >
                        {t('removeItem')}
                      </button>

                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.variantSku, Math.max(1, item.quantity - 1))}
                          className="w-7 h-7 border border-black/5 flex items-center justify-center hover:bg-black hover:text-white transition-colors text-sm font-light"
                        >
                          -
                        </button>
                        <span className="text-sm font-light w-5 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.variantSku, item.quantity + 1)}
                          className="w-7 h-7 border border-black/5 flex items-center justify-center hover:bg-black hover:text-white transition-colors text-sm font-light"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-3 mt-24">
            <div className="bg-black text-white p-12 lg:p-20 shadow-2xl relative overflow-hidden">
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              
              <div className="grid lg:grid-cols-2 gap-16 items-start relative z-10">
                {/* Discount Section */}
                <div className={`space-y-8 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <h3 className="font-display text-2xl font-black uppercase tracking-widest">{t('discountCode') || 'كود الخصم'}</h3>
                  <p className="text-sm font-light opacity-60 italic">{t('discountDesc') || 'أدخل كود الخصم الخاص بك للحصول على عرض حصري'}</p>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder={t('enterCoupon') || 'أدخل الكود هنا'}
                      className="flex-1 bg-white/10 border border-white/20 p-4 text-sm focus:outline-none focus:border-white transition-colors"
                    />
                    <Button variant="outline" className="h-14 px-8 border-white/20 hover:bg-white hover:text-black transition-all rounded-none uppercase text-xs font-bold tracking-widest">
                      {t('apply') || 'تطبيق'}
                    </Button>
                  </div>
                </div>

                {/* Calculation Section */}
                <div className={`space-y-8 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <h3 className="font-display text-2xl font-black uppercase tracking-widest border-b border-white/10 pb-6">{t('bagSummary')}</h3>
                  
                  <div className="space-y-6 text-sm font-light">
                    <div className={`flex justify-between opacity-60 ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
                      <span>{total().toLocaleString()} {t('currency')}</span>
                      <span>{t('subtotal')}</span>
                    </div>
                    <div className={`flex justify-between opacity-60 ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
                      <span>{(total() * 0.15).toLocaleString()} {t('currency')}</span>
                      <span>{t('tax')}</span>
                    </div>
                    <div className={`flex justify-between border-t border-white/10 pt-8 font-bold text-4xl tracking-tighter ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
                      <span className="text-primary">{(total() * 1.15).toLocaleString()} {t('currency')}</span>
                      <span>{t('total')}</span>
                    </div>
                  </div>

                  <div className="pt-8">
                    <Link href="/checkout">
                      <Button size="lg" className="w-full font-bold h-20 uppercase tracking-[0.4em] rounded-none bg-white text-black hover:bg-primary hover:text-white border-none transition-all text-sm">
                        {t('checkout')}
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="text-[10px] uppercase tracking-[0.3em] opacity-40 text-center">
                    {t('freeShippingPromo')}
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
