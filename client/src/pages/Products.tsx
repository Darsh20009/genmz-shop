import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";

export default function Products() {
  const { data: products, isLoading } = useProducts();
  const [search, setSearch] = useState("");
  const { t, language } = useLanguage();

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <Layout>
      <div className="container py-20">
        <div className={`flex flex-col md:flex-row justify-between items-end mb-16 gap-8 border-b border-black/5 pb-12 ${language === 'ar' ? '' : 'md:flex-row-reverse'}`}>
          <div className={language === 'ar' ? "text-right" : "text-left"}>
            <h1 className="font-display text-5xl md:text-7xl font-black mb-4 uppercase tracking-tighter">{t('fullCollection')}</h1>
            <p className="text-muted-foreground text-lg font-light italic">{language === 'ar' ? 'تصفح أحدث التصاميم العصرية' : 'Browse our latest modern designs'}</p>
          </div>
          <div className="relative w-full md:w-[400px]">
            <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-5 w-5 text-black/40`} />
            <Input 
              placeholder={t('searchPlaceholder')}
              className={`${language === 'ar' ? 'pr-12' : 'pl-12'} bg-white border border-black/10 h-14 rounded-none focus-visible:ring-black focus-visible:border-black text-lg`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-10">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-10">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32">
            <p className="text-2xl font-light text-muted-foreground italic">{t('noResults')}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
