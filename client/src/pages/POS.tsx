import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product, Category, Branch } from "@shared/schema";
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  Wallet,
  Barcode,
  Package,
  X,
  ChevronLeft,
  Loader2,
  Building
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface CartItem {
  productId: string;
  variantSku: string;
  name: string;
  variantName: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function POS() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: branch } = useQuery<Branch>({
    queryKey: ["/api/branches", user?.branchId],
    enabled: !!user?.branchId,
  });

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.variants.some(v => v.sku.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  const addToCart = (product: Product, variantSku: string) => {
    const variant = product.variants.find(v => v.sku === variantSku);
    if (!variant) return;

    setCart(prev => {
      const existing = prev.find(item => item.variantSku === variantSku);
      if (existing) {
        return prev.map(item => 
          item.variantSku === variantSku ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, {
        productId: product.id,
        variantSku: variant.sku,
        name: product.name,
        variantName: `${variant.color} / ${variant.size}`,
        price: Number(product.price),
        quantity: 1,
        image: product.images[0]
      }];
    });
  };

  const removeFromCart = (sku: string) => {
    setCart(prev => prev.filter(item => item.variantSku !== sku));
  };

  const updateQuantity = (sku: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.variantSku === sku) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Barcode scanner simulation handler
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput) return;
    
    const product = products?.find(p => p.variants.some(v => v.sku === barcodeInput));
    if (product) {
      addToCart(product, barcodeInput);
      setBarcodeInput("");
      toast({ title: "تمت الإضافة", description: "تم مسح الباركود بنجاح" });
    } else {
      toast({ variant: "destructive", title: "خطأ", description: "الباركود غير معروف" });
    }
  };

  return (
    <div className="flex h-screen w-full bg-secondary/5 overflow-hidden" dir="rtl">
      {/* Products Section */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        <header className="flex items-center gap-4 bg-white p-4 border border-black/5 shadow-sm">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="ابحث عن منتج أو امسح باركود..." 
              className="pr-10 rounded-none h-11 border-black/5"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <form onSubmit={handleBarcodeSubmit} className="w-48 relative">
            <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="الباركود..." 
              className="pr-10 rounded-none h-11 border-black/5 bg-secondary/20"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              autoFocus
            />
          </form>
          <div className="flex items-center gap-2 px-4 border-r border-black/10">
            <Building className="h-4 w-4 text-black/40" />
            <span className="text-xs font-black uppercase tracking-widest">{branch?.name || "المركز الرئيسي"}</span>
          </div>
        </header>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <Button 
            variant={selectedCategory === null ? "default" : "outline"}
            className="rounded-none h-9 font-bold text-xs"
            onClick={() => setSelectedCategory(null)}
          >
            الكل
          </Button>
          {categories?.map(cat => (
            <Button 
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              className="rounded-none h-9 font-bold text-xs"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Product Grid */}
        <ScrollArea className="flex-1">
          {productsLoading ? (
            <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map(product => (
                <Card key={product.id} className="rounded-none border-black/5 hover-elevate overflow-hidden group">
                  <div className="aspect-square relative overflow-hidden bg-black/5">
                    {product.images[0] ? (
                      <img src={product.images[0]} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <Package className="w-12 h-12 absolute inset-0 m-auto text-black/10" />
                    )}
                  </div>
                  <CardContent className="p-3 space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-tight line-clamp-1">{product.name}</h3>
                    <div className="flex flex-wrap gap-1">
                      {product.variants.map(v => (
                        <Button 
                          key={v.sku} 
                          variant="outline" 
                          size="sm" 
                          className="h-6 text-[8px] font-black rounded-none px-1.5"
                          onClick={() => addToCart(product, v.sku)}
                        >
                          {v.size} / {v.color}
                        </Button>
                      ))}
                    </div>
                    <p className="text-sm font-black">{product.price} SAR</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Cart Section */}
      <div className="w-[400px] bg-white border-r border-black/5 flex flex-col shadow-xl">
        <div className="p-4 border-b border-black/5 bg-black text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="font-black uppercase tracking-widest text-sm">سلة البيع</h2>
          </div>
          <Badge variant="outline" className="text-white border-white/20 rounded-none font-bold">
            {cart.length} أصناف
          </Badge>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Package className="h-12 w-12 opacity-10 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">السلة فارغة</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.variantSku} className="flex gap-3 bg-secondary/5 p-3 group relative">
                  <div className="w-12 h-12 bg-black/5 shrink-0 overflow-hidden">
                    {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[10px] font-black uppercase tracking-tight truncate">{item.name}</h4>
                    <p className="text-[9px] font-bold text-muted-foreground">{item.variantName}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-6 w-6 rounded-none"
                          onClick={() => updateQuantity(item.variantSku, -1)}
                        >
                          <Minus className="h-3 h-3" />
                        </Button>
                        <span className="text-xs font-black w-6 text-center">{item.quantity}</span>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-6 w-6 rounded-none"
                          onClick={() => updateQuantity(item.variantSku, 1)}
                        >
                          <Plus className="h-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs font-black">{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-black/5"
                    onClick={() => removeFromCart(item.variantSku)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Checkout Summary */}
        <div className="p-4 bg-secondary/10 border-t border-black/5 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-muted-foreground">
              <span>المجموع الفرعي</span>
              <span>{(total / 1.15).toFixed(2)} SAR</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-muted-foreground">
              <span>ضريبة القيمة المضافة (15%)</span>
              <span>{(total - (total / 1.15)).toFixed(2)} SAR</span>
            </div>
            <div className="flex justify-between text-lg font-black pt-2 border-t border-black/10">
              <span className="uppercase tracking-tighter">الإجمالي</span>
              <span>{total.toFixed(2)} SAR</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" className="rounded-none flex-col h-16 gap-1 border-black/10 hover:bg-black hover:text-white group">
              <Banknote className="h-4 w-4" />
              <span className="text-[9px] font-black uppercase">نقداً</span>
            </Button>
            <Button variant="outline" className="rounded-none flex-col h-16 gap-1 border-black/10 hover:bg-black hover:text-white group">
              <CreditCard className="h-4 w-4" />
              <span className="text-[9px] font-black uppercase">بطاقة</span>
            </Button>
            <Button variant="outline" className="rounded-none flex-col h-16 gap-1 border-black/10 hover:bg-black hover:text-white group">
              <Wallet className="h-4 w-4" />
              <span className="text-[9px] font-black uppercase">محفظة</span>
            </Button>
          </div>

          <Button className="w-full h-12 rounded-none font-black uppercase tracking-widest text-xs" disabled={cart.length === 0}>
            تأكيد الطلب وإصدار الفاتورة
          </Button>
        </div>
      </div>
    </div>
  );
}
