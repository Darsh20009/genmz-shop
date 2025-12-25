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
                <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-4 text-black/40">{t('optionsLabel')}</label>
                <div className={`flex flex-wrap gap-4 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                  {variants.map((variant: any) => (
                    <button
                      key={variant.sku}
                      onClick={() => setSelectedVariant(variant)}
                      className={`
                        group relative flex items-center gap-3 p-2 border transition-all duration-500 rounded-none overflow-hidden
                        ${selectedVariant?.sku === variant.sku 
                          ? 'border-black ring-1 ring-black' 
                          : 'border-black/5 hover:border-black/20'}
                      `}
                    >
                      {variant.image && (
                        <div className="w-12 h-16 bg-muted overflow-hidden">
                          <img 
                            src={variant.image} 
                            alt={variant.color} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                      )}
                      <div className="flex flex-col items-start px-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-0.5">{variant.size}</span>
                        <span className="text-xs font-black uppercase tracking-tighter">{variant.color}</span>
                      </div>
                      
                      {selectedVariant?.sku === variant.sku && (
                        <div className="absolute top-1 right-1">
                          <Check className="h-3 w-3 text-black" />
                        </div>
                      )}
                    </button>
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
