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
          <div className="lg:col-span-3 mt-16 max-w-4xl mx-auto w-full">
            <div className="bg-white border border-black/5 p-8 lg:p-12 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-700">
              <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                {/* Discount Section */}
                <div className={`space-y-6 ${language === 'ar' ? 'text-right' : 'text-left'} border-b md:border-b-0 md:border-l border-black/5 pb-8 md:pb-0 md:pl-12 order-2 md:order-1`}>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-black/40">{t('discountCode') || 'كود الخصم'}</h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder={t('enterCoupon') || 'الكود'}
                      className="flex-1 bg-secondary border-none p-3 text-xs focus:ring-1 focus:ring-black/10 transition-all uppercase tracking-widest"
                    />
                    <Button variant="outline" className="h-11 px-6 border-black/10 hover:bg-black hover:text-white transition-all rounded-none uppercase text-[10px] font-bold tracking-widest">
                      {t('apply') || 'تطبيق'}
                    </Button>
                  </div>
                </div>

                {/* Calculation Section */}
                <div className={`space-y-6 ${language === 'ar' ? 'text-right' : 'text-left'} order-1 md:order-2`}>
                  <div className="space-y-3 text-xs font-bold uppercase tracking-widest text-black/60">
                    <div className={`flex justify-between ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
                      <span>{total().toLocaleString()} {t('currency')}</span>
                      <span className="opacity-40">{t('subtotal')}</span>
                    </div>
                    <div className={`flex justify-between ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
                      <span>{(total() * 0.15).toLocaleString()} {t('currency')}</span>
                      <span className="opacity-40">{t('tax')}</span>
                    </div>
                    <div className={`flex justify-between pt-4 font-black text-2xl tracking-tighter text-black ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
                      <span className="text-primary">{(total() * 1.15).toLocaleString()} {t('currency')}</span>
                      <span>{t('total')}</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link href="/checkout">
                      <Button size="lg" className="w-full font-bold h-14 uppercase tracking-[0.4em] rounded-none bg-black text-white hover:bg-primary border-none transition-all text-[10px]">
                        {t('checkout')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-[9px] uppercase tracking-[0.4em] opacity-20 text-center font-black">
                {t('freeShippingPromo')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
