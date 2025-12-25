import { Layout } from "@/components/Layout";
import { useProduct } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { useRoute } from "wouter";
import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      <div className="container py-12">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-secondary rounded-2xl overflow-hidden shadow-2xl border border-border/50">
              <img 
                src={product.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80"} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbnails could go here */}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">{product.name}</h1>
            <p className="text-2xl font-mono text-primary font-bold mb-8">
              {Number(product.price).toLocaleString()} ر.س
            </p>

            <div className="prose prose-invert max-w-none text-muted-foreground mb-12">
              <p>{product.description}</p>
            </div>

            {/* Variants */}
            <div className="space-y-6 mb-12">
              <div>
                <label className="block text-sm font-bold mb-3">الخيار (اللون / المقاس)</label>
                <div className="flex flex-wrap gap-3">
                  {variants.map((variant: any) => (
                    <button
                      key={variant.sku}
                      onClick={() => setSelectedVariant(variant)}
                      className={`
                        px-4 py-2 rounded-lg border text-sm font-medium transition-all
                        ${selectedVariant?.sku === variant.sku 
                          ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary' 
                          : 'border-border hover:border-primary/50'}
                      `}
                    >
                      {variant.color} - {variant.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-bold mb-3">الكمية</label>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-secondary"
                  >
                    -
                  </button>
                  <span className="text-lg font-mono w-8 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-secondary"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full h-14 text-lg font-bold rounded-xl"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="ml-2 h-5 w-5" />
              إضافة للسلة
            </Button>

            <div className="mt-8 flex gap-4 text-sm text-muted-foreground">
               <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> منتج أصلي 100%</div>
               <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> دفع آمن</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
