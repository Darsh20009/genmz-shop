import { SEO } from "@/components/SEO";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { useProduct } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { useRoute } from "wouter";
import { useState, useEffect, useRef, useMemo } from "react";
import { ShoppingBag, Check, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";

// Generate unique UUID for Tamara widget
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function ProductDetails() {
  const [, params] = useRoute("/products/:id");
  const id = params?.id;
  const { data: product, isLoading, error } = useProduct(id || "");
  const { addItem } = useCart();
  const { toast } = useToast();
  const { t, language } = useLanguage();

  // Debug log to trace data
  useEffect(() => {
    if (product) {
      console.log("[PRODUCT DETAILS] Final product object in component:", product);
    }
  }, [product]);

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const tabbyWidgetRef = useRef<HTMLDivElement>(null);

  // Collect all unique images (product images only, excluding variant images as per request)
  const allImages = useMemo(() => {
    console.log("[PRODUCT DETAILS] Processing images for product:", product?.name);
    const images = product?.images || [];
    const validImages = images.filter(img => img && typeof img === 'string' && img.trim() !== "");
    
    if (validImages.length > 0) {
      console.log("[PRODUCT DETAILS] Found valid product images:", validImages.length);
      return validImages;
    }
    
    // Check if any variant has an image
    const variantImages = product?.variants?.map((v: any) => v.image).filter((img: any) => img && typeof img === 'string' && img.trim() !== "") || [];
    if (variantImages.length > 0) {
      console.log("[PRODUCT DETAILS] Using variant images as fallback:", variantImages.length);
      return variantImages;
    }

    console.log("[PRODUCT DETAILS] No images found, using placeholder");
    return ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=100"];
  }, [product?.images, product?.variants, product?.name]);

  // Initialize Tabby widget when product or price changes
  useEffect(() => {
    const initTabby = () => {
      if (typeof window !== 'undefined' && product?.price) {
        console.log("[PRODUCT DETAILS] Initializing Tabby for price:", product.price);
        const TabbyPromoClass = (window as any).TabbyPromo;
        if (TabbyPromoClass) {
          try {
            new TabbyPromoClass({
              selector: '.tabby-product-widget',
              currency: 'SAR',
              lang: language === 'ar' ? 'ar' : 'en',
              price: Number(product.price),
              installmentsCount: 4,
              source: 'product'
            });
          } catch (e) {
            console.error("Tabby widget initialization error:", e);
          }
        }
      }
    };

    const timer = setTimeout(initTabby, 300);
    return () => clearTimeout(timer);
  }, [product?.price, language]);

  // Update current image when variant changes (if variant has an image)
  useEffect(() => {
    if (selectedVariant?.image) {
      const index = allImages.indexOf(selectedVariant.image);
      if (index !== -1) {
        setCurrentImageIndex(index);
      }
    }
  }, [selectedVariant, allImages]);

  // Ensure variants exist, otherwise provide default
  const variants = useMemo(() => {
    const rawVariants = product?.variants || [];
    // More robust validation for variants
    const validVariants = rawVariants.filter((v: any) => v && (v.sku || v.color || v.size));
    
    if (validVariants.length > 0) return validVariants;
    
    // Create a sensible default variant if none exist or are invalid
    return [{ 
      sku: product?.barcode || 'default-' + (product?.id || 'id'), 
      color: 'Default', 
      size: 'One Size', 
      stock: product?.outOfStock ? 0 : 99, 
      image: product?.images?.[0] || '',
      price: product?.price || "0"
    }];
  }, [product?.variants, product?.barcode, product?.outOfStock, product?.images, product?.price, product?.id]);
  
  // Extract unique colors
  const colors = useMemo(() => 
    Array.from(new Set(variants.map((v: any) => v.color))),
    [variants]
  );
  
  // Get available sizes for selected color
  const availableSizes = useMemo(() => 
    selectedColor 
      ? Array.from(new Set(variants.filter((v: any) => v.color === selectedColor).map((v: any) => v.size)))
      : Array.from(new Set(variants.map((v: any) => v.size))),
    [selectedColor, variants]
  );
  
  // Get variant images grouped by color
  const colorImages = useMemo(() => {
    const images: Record<string, string> = {};
    colors.forEach(color => {
      const variant = variants.find((v: any) => v.color === color);
      if (variant?.image) {
        images[color] = variant.image;
      }
    });
    return images;
  }, [colors, variants]);
  
  // Auto select first color if not selected
  useEffect(() => {
    if (colors.length > 0 && !selectedColor) {
      setSelectedColor(colors[0]);
    }
  }, [colors, selectedColor]);

  // Auto select first size when color changes
  useEffect(() => {
    if (availableSizes.length > 0) {
      if (!selectedSize || !availableSizes.includes(selectedSize)) {
        setSelectedSize(availableSizes[0]);
      }
    } else {
      setSelectedSize(null);
    }
  }, [selectedColor, availableSizes, selectedSize]);

  // Find and set selected variant based on color and size
  useEffect(() => {
    if (selectedColor && selectedSize) {
      const variant = variants.find((v: any) => v.color === selectedColor && v.size === selectedSize);
      if (variant) {
        setSelectedVariant(variant);
      }
    }
  }, [selectedColor, selectedSize, variants]);

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

  // Debugging: Log the product data
  if (product) {
    console.log("[PRODUCT DETAILS] Product data received:", product);
  }

  if (!product) {
    console.error("[PRODUCT DETAILS] Product not found for ID:", id);
    return (
      <Layout>
        <div className="container py-24 text-center">
          <h2 className="text-2xl font-bold">{t('productNotFound')}</h2>
          <p className="text-muted-foreground mt-4">{t('noResults')}</p>
        </div>
      </Layout>
    );
  }

  // Safety check: if product exists but has no name, it might be an empty object
  if (!product.name) {
    console.warn("[PRODUCT DETAILS] Product data incomplete:", product);
  }

  const handleVariantSelect = (variant: any) => {
    setSelectedVariant(variant);
    // Find index of the variant's image in product images to sync gallery
    const imageIndex = allImages.findIndex(img => img === variant.image);
    if (imageIndex !== -1) {
      setCurrentImageIndex(imageIndex);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    
    setIsAnimating(true);
    // Ensure the variant image is passed correctly to the cart
    addItem(product, selectedVariant, quantity);
    
    // Animation reset
    setTimeout(() => setIsAnimating(false), 1000);
  };

  return (
    <Layout>
      <SEO 
        title={product.name} 
        description={product.description} 
        image={product.images?.[0]} 
        type="product"
      />
      <div className="container py-8 sm:py-12 md:py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col lg:grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-24 items-start ${language === 'ar' ? '' : 'lg:flex-row-reverse'}`}>
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-4 sm:space-y-6"
          >
            <div 
              className="aspect-[3/4] w-full bg-white overflow-hidden shadow-xl sm:shadow-2xl border border-black/5 group flex flex-col items-center justify-center p-2 sm:p-4 cursor-pointer"
              onClick={() => {
                const img = allImages[currentImageIndex];
                if (img) window.open(img, '_blank');
              }}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  key={currentImageIndex}
                  src={allImages[currentImageIndex] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=100"} 
                  alt={product.name} 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=100";
                  }}
                  className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-1000"
                />
              </div>
            </div>
            
            {/* Thumbnails - Improved responsiveness and layout */}
            {allImages.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto py-2 w-full justify-start sm:justify-center no-scrollbar touch-pan-x">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`
                      relative w-14 h-18 sm:w-16 sm:h-20 flex-shrink-0 border-2 transition-all duration-300 overflow-hidden
                      ${currentImageIndex === idx ? 'border-black scale-105 shadow-md' : 'border-black/5 opacity-60 hover:opacity-100'}
                    `}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <div className={`w-full flex flex-col ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            <div className="border-b border-black/5 pb-6 sm:pb-8 mb-6 sm:mb-8">
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 uppercase tracking-tighter leading-tight">{product.name}</h1>
              <div className="flex items-center gap-4">
                <p className="text-2xl sm:text-3xl font-light text-primary tracking-tight">
                  {product.price ? Number(product.price).toLocaleString() : '0'} {t('currency')}
                </p>
                {product.barcode && (
                  <span className="text-sm text-muted-foreground font-mono">
                    {t('product_code')}: {product.barcode}
                  </span>
                )}
              </div>
            </div>

            <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none text-muted-foreground mb-8 sm:mb-12 font-light leading-relaxed italic">
              <p>{product.description}</p>
            </div>

            {/* SKU Display */}
            {selectedVariant && selectedVariant.sku && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 p-6 bg-black/2 border border-black/5 backdrop-blur-sm"
                data-testid="section-sku"
              >
                <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2 text-black/40">{language === 'ar' ? 'رمز المنتج' : 'Product Code'}</p>
                <p className="font-mono text-lg font-bold tracking-widest text-black" data-testid="text-product-sku">{selectedVariant.sku}</p>
              </motion.div>
            )}

            {/* Variants - Colors Section */}
            <div className="space-y-8 sm:space-y-10 mb-8 sm:mb-12">
              {/* Colors */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-4 sm:mb-6 text-black/40">{t('colorLabel')}</label>
                <div className={`flex flex-wrap gap-3 sm:gap-4 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                  {colors.map((color: string) => (
                    <div key={color} className="relative group">
                      <button
                        onClick={() => setSelectedColor(color)}
                        className={`
                          relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden transition-all duration-300 p-0.5 border-2
                          ${selectedColor === color 
                            ? 'border-black scale-110 shadow-xl' 
                            : 'border-transparent hover:border-black/20 hover:scale-105'}
                        `}
                        data-testid={`button-color-${color}`}
                      >
                        {colorImages[color] ? (
                          <div className="w-full h-full rounded-full overflow-hidden bg-muted">
                            <img 
                              src={colorImages[color]} 
                              alt={color} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full rounded-full bg-black/5 flex items-center justify-center text-[8px] sm:text-[10px] font-black uppercase text-center px-1">
                            {color}
                          </div>
                        )}
                        
                        {selectedColor === color && (
                          <div className="absolute inset-0 bg-black/10 flex items-center justify-center backdrop-blur-[1px]">
                            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-white drop-shadow-md" />
                          </div>
                        )}
                      </button>
                      
                      {/* Tooltip-like label */}
                      <div className={`
                        absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-300 pointer-events-none z-10
                        ${selectedColor === color ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}
                      `}>
                        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest bg-black text-white px-2 py-0.5">
                          {color}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-4 sm:mb-6 text-black/40">{t('sizeLabel')}</label>
                <div className={`flex flex-wrap gap-2 sm:gap-3 md:gap-4 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                  {availableSizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`
                        px-4 py-2 sm:px-6 sm:py-3 border-2 rounded-none font-bold uppercase tracking-widest text-xs sm:text-sm transition-all duration-300
                        ${selectedSize === size
                          ? 'border-black bg-black text-white shadow-lg'
                          : 'border-black/20 hover:border-black text-black hover:bg-black/5'}
                      `}
                      data-testid={`button-size-${size}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-4 text-black/40">{t('quantityLabel')}</label>
                <div className={`flex items-center gap-4 sm:gap-6 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 sm:w-12 sm:h-12 border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors text-lg sm:text-xl font-light"
                    data-testid="button-decrease-quantity"
                  >
                    -
                  </button>
                  <span className="text-lg sm:text-xl font-light w-10 sm:w-12 text-center" data-testid="text-quantity">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 sm:w-12 sm:h-12 border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors text-lg sm:text-xl font-light"
                    data-testid="button-increase-quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Installment Plans Section - Real Tamara & Tabby Widgets */}
            <div className="mb-8 sm:mb-12 space-y-4" data-testid="section-installment-plans">
              {/* Tamara Widget */}
              <div className="relative">
                <div 
                  className="w-full overflow-hidden opacity-50 grayscale pointer-events-none"
                  dangerouslySetInnerHTML={{
                    __html: `
                      <tamara-widget 
                        class="tamara-product-widget" 
                        type="tamara-summary" 
                        inline-type="2" 
                        uuid="${generateUUID()}" 
                        amount="${product.price || 0}"
                      ></tamara-widget>
                    `
                  }}
                />
                <div className="absolute top-0 left-0 bg-black text-white text-[10px] font-bold px-2 py-1 z-10">
                  قريباً
                </div>
              </div>
              
              {/* Tabby Product Widget */}
              <div 
                ref={tabbyWidgetRef}
                className="tabby-product-widget w-full overflow-hidden" 
                style={{ marginTop: '15px' }} 
                data-currency="SAR" 
                data-lang={language === 'ar' ? 'ar' : 'en'}
                data-price={product.price || 0}
                data-installments-count="4"
              >
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full h-16 sm:h-20 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] rounded-none bg-black text-white hover-elevate active-elevate-2 border-none relative overflow-visible"
              onClick={handleAddToCart}
              disabled={isAnimating}
            >
              {isAnimating && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 1, x: 0, y: 0 }}
                  animate={{ 
                    scale: 0.2, 
                    opacity: 0,
                    x: language === 'ar' ? -400 : 400,
                    y: -800,
                    rotate: 360
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                >
                  <div className="w-20 h-20 bg-white shadow-2xl p-1 border border-black/5">
                    <img 
                      src={selectedVariant?.image || product.images[0]} 
                      alt="" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </motion.div>
              )}
              {language === 'ar' ? <ShoppingBag className="ml-3 h-5 w-5" /> : <ShoppingBag className="mr-3 h-5 w-5" />}
              {t('addToCart')}
            </Button>

            <div className="mt-12 pt-8 border-t border-black/5 flex flex-col gap-4 text-xs font-bold uppercase tracking-widest text-black/40">
               <div className={`flex items-center gap-3 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}><Check className="h-4 w-4 text-black"/> {t('originalProduct')}</div>
               <div className={`flex items-center gap-3 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}><Check className="h-4 w-4 text-black"/> {t('luxuryPackaging')}</div>
               <div className={`flex items-center gap-3 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}><Check className="h-4 w-4 text-black"/> {t('secureShipping')}</div>
            </div>

            {/* Reviews Section */}
            <div className="mt-16 pt-8 border-t border-black/5">
              <h3 className="text-xl font-bold mb-8">{language === 'ar' ? 'تقييمات العملاء' : 'Customer Reviews'}</h3>
              <div className="space-y-6">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review: any) => (
                    <Card key={review.id} className="p-6 rounded-none border-black/5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-bold text-lg">{review.customerName}</p>
                          <div className="flex gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < (review.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground uppercase tracking-widest">
                          {new Date(review.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed mb-4 italic">"{review.comment}"</p>
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-3 flex-wrap">
                          {review.images.map((img: string, idx: number) => (
                            <img 
                              key={idx} 
                              src={img} 
                              alt="Review image" 
                              className="w-24 h-32 object-cover grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer border border-black/5"
                              onClick={() => window.open(img, '_blank')}
                            />
                          ))}
                        </div>
                      )}
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">{language === 'ar' ? 'لا توجد تقييمات بعد لهذا المنتج.' : 'No reviews yet for this product.'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
