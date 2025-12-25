import { Layout } from "@/components/Layout";
import { useProduct } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { useRoute } from "wouter";
import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function ProductDetails() {
  const [, params] = useRoute("/products/:id");
  const id = Number(params?.id);
  const { data: product, isLoading } = useProduct(id);
  const { addItem } = useCart();
  const { toast } = useToast();

  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

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

  if (!product) return <div>Product not found</div>;

  // Ensure variants exist, otherwise provide default
  const variants = product.variants && product.variants.length > 0 ? product.variants : [{ sku: 'default', color: 'Default', size: 'One Size', stock: 10 }];
  
  // Auto select first variant if not selected
  if (!selectedVariant && variants.length > 0) {
    setSelectedVariant(variants[0]);
  }

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem(product, selectedVariant, quantity);
    toast({
      title: "تمت الإضافة للسلة",
      description: `${product.name} أضيف إلى سلة مشترياتك.`,
    });
  };

  return (
    <Layout>
      <div className="container py-24">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 sticky top-24"
          >
            <div className="aspect-[3/4] bg-white overflow-hidden shadow-2xl border border-black/5 group">
              <img 
                src={product.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80"} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
            </div>
          </motion.div>

          {/* Details */}
          <div className="flex flex-col text-right">
            <div className="border-b border-black/5 pb-8 mb-8">
              <h1 className="font-display text-5xl md:text-6xl font-black mb-6 uppercase tracking-tighter">{product.name}</h1>
              <p className="text-3xl font-light text-primary tracking-tight">
                {Number(product.price).toLocaleString()} ر.س
              </p>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground mb-12 font-light leading-relaxed italic">
              <p>{product.description}</p>
            </div>

            {/* Variants */}
            <div className="space-y-10 mb-12">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-4 text-black/40">الخيار (اللون / المقاس)</label>
                <div className="flex flex-wrap gap-3 justify-end">
                  {variants.map((variant: any) => (
                    <button
                      key={variant.sku}
                      onClick={() => setSelectedVariant(variant)}
                      className={`
                        px-6 py-3 border text-xs font-bold uppercase tracking-widest transition-all duration-300
                        ${selectedVariant?.sku === variant.sku 
                          ? 'border-black bg-black text-white' 
                          : 'border-black/10 hover:border-black/30 text-black/60'}
                      `}
                    >
                      {variant.color} | {variant.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-4 text-black/40">الكمية</label>
                <div className="flex items-center gap-6 justify-end">
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
              <ShoppingBag className="ml-3 h-5 w-5" />
              إضافة إلى حقيبة التسوق
            </Button>

            <div className="mt-12 pt-8 border-t border-black/5 flex flex-col gap-4 text-xs font-bold uppercase tracking-widest text-black/40">
               <div className="flex items-center gap-3 justify-end"><Check className="h-4 w-4 text-black"/> قطعة أصلية وحصرية</div>
               <div className="flex items-center gap-3 justify-end"><Check className="h-4 w-4 text-black"/> تغليف فاخر</div>
               <div className="flex items-center gap-3 justify-end"><Check className="h-4 w-4 text-black"/> شحن سريع وآمن</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
