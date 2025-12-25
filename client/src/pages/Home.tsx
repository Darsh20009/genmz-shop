import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Star, ShieldCheck, Truck, ChevronRight, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import heroImg from "@assets/Screenshot_2025-12-25_100613_1766646961781.png";
import tealImg from "@assets/Screenshot_2025-12-25_100641_1766646961781.png";
import greyImg from "@assets/Screenshot_2025-12-25_100700_1766646961782.png";
import burgundyImg from "@assets/Screenshot_2025-12-25_100738_1766646961782.png";
import blueImg from "@assets/Screenshot_2025-12-25_100724_1766646961782.png";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: products, isLoading } = useProducts();
  const { t, language } = useLanguage();

  useEffect(() => {
    if (user && ["admin", "employee", "support"].includes(user.role)) {
      setLocation("/admin");
    }
  }, [user, setLocation]);

  const featuredProducts = products?.filter(p => p.isFeatured).slice(0, 4) || [];

  return (
    <Layout>
      {/* Creative Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-white">
        <div className="container relative z-10 grid lg:grid-cols-2 gap-8 items-center px-4 pt-20">
          <motion.div 
            initial={{ opacity: 0, x: language === 'ar' ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className={language === 'ar' ? "text-right z-20" : "text-left z-20"}
          >
            <span className="inline-block text-xs font-bold tracking-[0.2em] text-primary mb-4 uppercase">{t('newCollection')}</span>
            <h1 className="font-display text-5xl md:text-8xl font-black leading-[0.9] mb-8 text-black tracking-tighter">
              GEN M & Z
              <span className="block text-2xl md:text-5xl mt-4 font-light text-muted-foreground italic font-serif">{t('heroTitle')}</span>
            </h1>
            <p className={`text-muted-foreground text-base md:text-xl mb-12 max-w-md ${language === 'ar' ? 'mr-0 ml-auto' : 'ml-0 mr-auto'} leading-relaxed font-light`}>
              {t('heroDesc')}
            </p>
            <div className={`flex gap-6 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
              <Link href="/products">
                <Button size="lg" className="px-10 py-8 text-sm font-bold uppercase tracking-[0.2em] rounded-none shadow-2xl hover-elevate transition-all bg-black text-white border-none active-elevate-2">
                  {t('discoverCollection')} {language === 'ar' ? <ChevronLeft className="mr-3 h-5 w-5 rotate-180" /> : <ChevronRight className="ml-3 h-5 w-5" />}
                </Button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1, delay: 0.2 }}
             className="relative"
          >
            <div className="relative aspect-[3/4] md:aspect-square max-w-xl mx-auto group">
              <div className="absolute inset-0 border-[20px] border-primary/5 -m-10 hidden md:block" />
              <img 
                src={heroImg} 
                alt="Gen M & Z Hero" 
                className="w-full h-full object-cover shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000"
              />
              <div className={`absolute -bottom-6 ${language === 'ar' ? '-right-6' : '-left-6'} bg-black text-white p-6 hidden md:block`}>
                <p className="text-[10px] tracking-widest uppercase font-bold mb-1">{t('featuredItem')}</p>
                <p className="text-lg font-black leading-none">BURGUNDY HOODIE</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-24 bg-white border-y border-black/5 overflow-hidden">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
                <Star className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest mb-4">{t('originalProduct')}</h3>
              <p className="text-muted-foreground font-light italic">{language === 'ar' ? 'نضمن لك جودة استثنائية وتصاميم حصرية لن تجدها في مكان آخر.' : 'We guarantee exceptional quality and exclusive designs found nowhere else.'}</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center group"
            >
              <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
                <Truck className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest mb-4">{t('secureShipping')}</h3>
              <p className="text-muted-foreground font-light italic">{language === 'ar' ? 'توصيل سريع وآمن لجميع مناطق المملكة مع تغليف فاخر يحمي مشترياتك.' : 'Fast and secure delivery to all regions with luxury packaging to protect your purchases.'}</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center group"
            >
              <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest mb-4">{t('goldenGuarantee')}</h3>
              <p className="text-muted-foreground font-light italic">{t('goldenGuaranteeDesc')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products showcase */}
      <section className="py-32 bg-white">
        <div className="container px-4">
          <div className={`flex flex-col md:flex-row justify-between items-end gap-8 mb-20 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            <div className="max-w-2xl">
              <span className="inline-block text-xs font-bold tracking-[0.2em] text-primary mb-4 uppercase">{t('discoverCollection')}</span>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">{t('exclusivePicks')}</h2>
              <p className="text-xl text-muted-foreground font-light italic">{t('heroDesc')}</p>
            </div>
            <Link href="/products">
              <Button size="lg" className="rounded-none border-black font-bold uppercase tracking-widest text-xs h-14 px-10 group bg-black text-white hover:bg-black/80 transition-all">
                {t('viewAllProducts')}
                {language === 'ar' ? <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> : <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {featuredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  data-testid={`card-product-${product.id}`}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-30" />
              <p className="text-lg text-muted-foreground mb-8">{language === 'ar' ? 'قريباً: منتجات جديدة قادمة' : 'Coming Soon: New Products Coming'}</p>
              <Link href="/products">
                <Button variant="outline" size="lg">{language === 'ar' ? 'استكشف جميع المنتجات' : 'Explore All Products'}</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Collection Spotlight Section */}
      <section className="py-32 bg-gradient-to-b from-white to-secondary/5">
        <div className="container px-4">
          <div className={`text-center max-w-3xl mx-auto mb-20 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">{language === 'ar' ? 'تصاميم حصرية' : 'Exclusive Designs'}</h2>
            <p className="text-lg text-muted-foreground font-light italic">{language === 'ar' ? 'اكتشف مجموعتنا الأخيرة من الملابس والإكسسوارات المصممة خصيصاً لك' : 'Discover our latest collection of clothing and accessories designed just for you'}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-lg aspect-square bg-muted hover-elevate"
            >
              <img 
                src={tealImg} 
                alt="Teal Collection" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                data-testid="img-teal-collection"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="text-sm uppercase tracking-widest mb-3 font-bold opacity-90">{language === 'ar' ? 'مجموعة جديدة' : 'New Collection'}</p>
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{language === 'ar' ? 'أزياء صيفية' : 'Summer Vibes'}</h3>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group relative overflow-hidden rounded-lg aspect-square bg-muted hover-elevate"
            >
              <img 
                src={greyImg} 
                alt="Grey Collection" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                data-testid="img-grey-collection"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="text-sm uppercase tracking-widest mb-3 font-bold opacity-90">{language === 'ar' ? 'الكلاسيكيات' : 'Classics'}</p>
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{language === 'ar' ? 'الرمادي الفاخر' : 'Luxury Grey'}</h3>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group relative overflow-hidden rounded-lg aspect-square bg-muted hover-elevate"
            >
              <img 
                src={blueImg} 
                alt="Blue Collection" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                data-testid="img-blue-collection"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="text-sm uppercase tracking-widest mb-3 font-bold opacity-90">{language === 'ar' ? 'أكثر طلباً' : 'Best Sellers'}</p>
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{language === 'ar' ? 'الأزرق الكلاسيكي' : 'Classic Blue'}</h3>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brand Story / CTA */}
      <section className="relative py-48 overflow-hidden bg-black text-white">
        <div className="absolute inset-0 opacity-20 grayscale">
          <img 
            src="https://images.unsplash.com/photo-1441984908747-d4121882c9b6?auto=format&fit=crop&q=80" 
            alt="Store background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container px-4 relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
          >
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-12 leading-[0.9]">{language === 'ar' ? 'أناقة تتحدث عنك' : 'Elegance That Speaks For You'}</h2>
            <p className="text-2xl font-light italic mb-16 opacity-60 leading-relaxed">{t('brandStoryDesc')}</p>
            <Link href="/products">
              <Button size="lg" className="h-20 px-16 text-sm font-black uppercase tracking-[0.4em] rounded-none bg-white text-black hover:bg-transparent hover:text-white border-2 border-white transition-all duration-500">
                <ShoppingBag className={`${language === 'ar' ? 'ml-3' : 'mr-3'} h-5 w-5`} />
                {language === 'ar' ? 'ابدأ التسوق الآن' : 'Start Shopping Now'}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
