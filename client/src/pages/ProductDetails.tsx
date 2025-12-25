import { Layout } from "@/components/Layout";
import { useProduct } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { useRoute } from "wouter";
import { useState, useEffect } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";

export default function ProductDetails() {
  const [, params] = useRoute("/products/:id");
  const id = params?.id;
  const { data: product, isLoading } = useProduct(id || "");
  const { addItem } = useCart();
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  // Ensure variants exist, otherwise provide default
  const variants = product?.variants && product.variants.length > 0 ? product.variants : [{ sku: 'default', color: 'Default', size: 'One Size', stock: 10 }];
  
  // Auto select first variant if not selected
  useEffect(() => {
    if (!selectedVariant && variants.length > 0) {
      setSelectedVariant(variants[0]);
    }
  }, [selectedVariant, variants]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12 animate-pulse">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="aspect-[3/4] bg-muted rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-muted w-2/3 rounded" />
              <div className="h-4 bg-muted w-1/3 rounded" />
              <div className="h-32 bg-muted rounded" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-24 text-center">
          <h2 className="text-2xl font-bold">{t('productNotFound')}</h2>
          <p className="text-muted-foreground mt-4">{t('noResults')}</p>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem(product, selectedVariant, quantity);
    toast({
      title: t('addedToCart'),
      description: `${product.name} ${t('addedToCartDesc')}`,
    });
  };

  return (
    <Layout>
      <div className="container py-24">
        <div className={`grid lg:grid-cols-2 gap-16 lg:gap-24 items-start ${language === 'ar' ? '' : 'lg:flex-row-reverse'}`}>
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="aspect-[3/4] bg-white overflow-hidden shadow-2xl border border-black/5 group flex items-center justify-center p-4">
              <img 
                src={selectedVariant?.image || product.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80"} 
                alt={product.name} 
                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-1000"
              />
            </div>
          </motion.div>

          {/* Details */}
          <div className={`flex flex-col ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            <div className="border-b border-black/5 pb-8 mb-8">
              <h1 className="font-display text-5xl md:text-6xl font-black mb-6 uppercase tracking-tighter">{product.name}</h1>
              <p className="text-3xl font-light text-primary tracking-tight">
                {Number(product.price).toLocaleString()} {t('currency')}
              </p>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground mb-12 font-light leading-relaxed italic">
              <p>{product.description}</p>
            </div>

            {/* Variants */}
            <div className="space-y-10 mb-12">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-6 text-black/40">{t('optionsLabel')}</label>
                <div className={`flex flex-wrap gap-6 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                  {variants.map((variant: any) => (
                    <div key={variant.sku} className="relative group">
                      <button
                        onClick={() => setSelectedVariant(variant)}
                        className={`
                          relative w-20 h-20 rounded-full overflow-hidden transition-all duration-700 p-0.5 border-2
                          ${selectedVariant?.sku === variant.sku 
                            ? 'border-black scale-110 shadow-xl' 
                            : 'border-transparent hover:border-black/20 hover:scale-105'}
                        `}
                      >
                        {variant.image ? (
                          <div className="w-full h-full rounded-full overflow-hidden bg-muted">
                            <img 
                              src={variant.image} 
                              alt={variant.color} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full rounded-full bg-black/5 flex items-center justify-center text-[10px] font-black uppercase">
                            {variant.color}
                          </div>
                        )}
                        
                        {selectedVariant?.sku === variant.sku && (
                          <div className="absolute inset-0 bg-black/10 flex items-center justify-center backdrop-blur-[1px]">
                            <Check className="h-5 w-5 text-white drop-shadow-md" />
                          </div>
                        )}
                      </button>
                      
                      {/* Tooltip-like label */}
                      <div className={`
                        absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-300 pointer-events-none
                        ${selectedVariant?.sku === variant.sku ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}
                      `}>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2 py-0.5">
                          {variant.color} • {variant.size}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-4 text-black/40">{t('quantityLabel')}</label>
                <div className={`flex items-center gap-6 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors text-xl font-light"
                  >
                    -
                  </button>
                  <span className="text-xl font-light w-12 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors text-xl font-light"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full h-20 text-sm font-bold uppercase tracking-[0.3em] rounded-none bg-black text-white hover-elevate active-elevate-2 border-none"
              onClick={handleAddToCart}
            >
              {language === 'ar' ? <ShoppingBag className="ml-3 h-5 w-5" /> : <ShoppingBag className="mr-3 h-5 w-5" />}
              {t('addToCart')}
            </Button>

            <div className="mt-12 pt-8 border-t border-black/5 flex flex-col gap-4 text-xs font-bold uppercase tracking-widest text-black/40">
               <div className={`flex items-center gap-3 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}><Check className="h-4 w-4 text-black"/> {t('originalProduct')}</div>
               <div className={`flex items-center gap-3 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}><Check className="h-4 w-4 text-black"/> {t('luxuryPackaging')}</div>
               <div className={`flex items-center gap-3 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}><Check className="h-4 w-4 text-black"/> {t('secureShipping')}</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
