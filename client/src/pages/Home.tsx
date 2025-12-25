import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Star, ShieldCheck, Truck } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: products, isLoading } = useProducts();

  const featuredProducts = products?.filter(p => p.isFeatured).slice(0, 4) || [];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        {/* Abstract Dark Luxury Background */}
        <div className="absolute inset-0 bg-background z-0" />
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-background via-transparent to-background/50 z-0"></div>
        
        <div className="container relative z-10 grid md:grid-cols-2 gap-12 items-center px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-right"
          >
            <h1 className="font-display text-5xl md:text-8xl font-black leading-tight mb-8">
              <span className="text-primary block mb-2">Gen M & Z</span>
              أناقة الجيل الجديد
            </h1>
            <p className="text-muted-foreground text-lg md:text-2xl mb-12 max-w-lg mr-0 ml-auto leading-relaxed font-medium">
              تصاميم عصرية تجمع بين الفخامة والعملية، صنعت في المملكة لتناسب ذوقك الرفيع.
            </p>
            <div className="flex gap-6 justify-end">
              <Link href="/products">
                <Button size="lg" className="px-10 text-xl font-bold rounded-full h-16 shadow-2xl hover:scale-105 transition-transform">
                  تسوق الآن <ArrowLeft className="mr-3 h-6 w-6" />
                </Button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1, delay: 0.2 }}
             className="relative hidden md:block"
          >
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-white/5 aspect-[4/5] max-w-md mx-auto transform hover:scale-[1.02] transition-all duration-700">
               <img 
                 src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80" 
                 alt="Luxury Collection" 
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px]"></div>
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px]"></div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Star className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">جودة استثنائية</h3>
            <p className="text-muted-foreground">خامات مختارة بعناية لضمان أفضل تجربة.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">شحن سريع</h3>
            <p className="text-muted-foreground">توصيل لجميع مناطق المملكة خلال أيام.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">ضمان ذهبي</h3>
            <p className="text-muted-foreground">سياسة استرجاع مرنة لراحتك التامة.</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 container">
        <div className="flex items-center justify-between mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold">مختاراتنا لك</h2>
          <Link href="/products">
            <Button variant="link" className="text-primary font-bold">عرض الكل</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Newsletter / CTA */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="container relative z-10 text-center max-w-2xl mx-auto">
          <h2 className="font-display text-4xl font-bold mb-6">انضم لعائلتنا</h2>
          <p className="text-lg opacity-90 mb-8">
            سجل معنا ليصلك كل جديد من العروض الحصرية وتشكيلات الموسم قبل الجميع.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input 
              type="email" 
              placeholder="بريدك الإلكتروني" 
              className="px-6 py-3 rounded-full bg-white/10 border border-white/20 placeholder:text-white/60 focus:outline-none focus:bg-white/20 w-full sm:w-auto"
            />
            <Button size="lg" variant="secondary" className="rounded-full px-8 font-bold">
              اشتراك
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
