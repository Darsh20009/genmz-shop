import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShoppingBag, Star, ShieldCheck, Truck, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import heroImg from "@assets/Screenshot_2025-12-25_100613_1766646961781.png";
import tealImg from "@assets/Screenshot_2025-12-25_100641_1766646961781.png";
import greyImg from "@assets/Screenshot_2025-12-25_100700_1766646961782.png";
import burgundyImg from "@assets/Screenshot_2025-12-25_100738_1766646961782.png";
import blueImg from "@assets/Screenshot_2025-12-25_100724_1766646961782.png";

export default function Home() {
  const { data: products, isLoading } = useProducts();
  const featuredProducts = products?.filter(p => p.isFeatured).slice(0, 4) || [];

  return (
    <Layout>
      {/* Creative Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-white">
        <div className="container relative z-10 grid lg:grid-cols-2 gap-8 items-center px-4 pt-20">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-right z-20"
          >
            <span className="inline-block text-xs font-bold tracking-[0.2em] text-primary mb-4 uppercase">New Collection 2026</span>
            <h1 className="font-display text-4xl md:text-7xl font-black leading-[1.1] mb-6 text-black">
              GEN M & Z
              <span className="block text-2xl md:text-4xl mt-2 font-medium text-muted-foreground italic font-serif">أناقة تتجاوز الحدود</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-lg mb-8 max-w-md mr-0 ml-auto leading-relaxed">
              نقدم لكم تشكيلة الهوديز الجديدة المصممة بعناية فائقة لتناسب أسلوب حياتكم العصري. جودة استثنائية وتفاصيل تروي قصة إبداع سعودي.
            </p>
            <div className="flex gap-4 justify-end">
              <Link href="/products">
                <Button size="lg" className="px-8 py-6 text-sm font-bold uppercase tracking-wider rounded-none shadow-xl hover-elevate transition-all bg-black text-white border-none">
                  اكتشف المجموعة <ChevronRight className="mr-2 h-4 w-4" />
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
              <div className="absolute -bottom-6 -right-6 bg-black text-white p-6 hidden md:block">
                <p className="text-[10px] tracking-widest uppercase font-bold mb-1">Featured item</p>
                <p className="text-lg font-black leading-none">BURGUNDY HOODIE</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Featured Products Showcase (Creative Grid) */}
      <section className="py-20 bg-[#f9f9f9]">
        <div className="container px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 mb-16">
            {[
              { img: burgundyImg, color: 'Burgundy', title: 'SINGLE-LAYER HOOD' },
              { img: tealImg, color: 'Teal', title: 'DOUBLE-LAYER HOOD' },
              { img: blueImg, color: 'Blue', title: 'LIMITED EDITION' },
              { img: greyImg, color: 'Grey', title: 'ESSENTIALS' }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative aspect-[3/4] overflow-hidden bg-white shadow-sm"
              >
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 md:p-6 text-white">
                  <span className="text-[10px] font-bold tracking-widest uppercase mb-1">{item.color}</span>
                  <h3 className="text-sm md:text-lg font-black leading-none">{item.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between border-t border-black/5 pt-12 gap-6">
            <h2 className="font-display text-2xl md:text-4xl font-black text-black">المختارات الحصرية</h2>
            <Link href="/products">
              <Button variant="outline" className="rounded-none border-black text-black font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                عرض جميع المنتجات
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Dynamic Product Grid */}
      <section className="py-20 container px-4">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
      {/* Brand Story Section */}
      <section className="py-32 overflow-hidden bg-white">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
               <div className="aspect-[4/5] bg-muted overflow-hidden">
                 <img src={tealImg} alt="Teal Hoodie" className="w-full h-full object-cover" />
               </div>
               <div className="absolute -top-10 -left-10 w-40 h-40 border-l-[1px] border-t-[1px] border-black opacity-20 hidden lg:block" />
            </div>
            <div className="text-right order-1 lg:order-2">
              <span className="text-primary font-bold text-xs uppercase tracking-[0.3em] mb-4 inline-block">Our Mission</span>
              <h2 className="text-4xl md:text-6xl font-black text-black mb-8 leading-tight">الجودة هي هويتنا</h2>
              <p className="text-muted-foreground text-sm md:text-lg mb-10 leading-relaxed">
                في Gen M & Z، نؤمن أن الملابس ليست مجرد أقمشة، بل هي تعبير عن الشخصية. نحرص على استخدام أجود أنواع القطن والتصاميم التي تجمع بين الراحة القصوى والجمالية العالية.
              </p>
              <div className="grid grid-cols-2 gap-8 text-right">
                <div>
                   <h4 className="font-black text-xl mb-2 text-black">+١٠٠</h4>
                   <p className="text-[10px] uppercase font-bold text-muted-foreground">عميل سعيد</p>
                </div>
                <div>
                   <h4 className="font-black text-xl mb-2 text-black">١٠٠٪</h4>
                   <p className="text-[10px] uppercase font-bold text-muted-foreground">صناعة متقنة</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Trust Badges */}
      <section className="py-16 border-y bg-[#fafafa]">
        <div className="container grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            { icon: Star, title: 'جودة استثنائية', desc: 'خامات مختارة بعناية لضمان التفرد' },
            { icon: Truck, title: 'شحن سريع', desc: 'توصيل لباب منزلك في أسرع وقت' },
            { icon: ShieldCheck, title: 'ضمان ذهبي', desc: 'تسوق بكل ثقة مع سياسة استرجاع مرنة' }
          ].map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <feature.icon className="h-6 w-6 text-black mb-4" strokeWidth={1} />
              <h3 className="font-black text-sm uppercase tracking-widest mb-2 text-black">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Newsletter */}
      <section className="py-32 bg-black text-white relative">
        <div className="container px-4 text-center max-w-xl mx-auto z-10 relative">
          <h2 className="text-3xl md:text-5xl font-black mb-6 uppercase tracking-tight">Stay Exclusive</h2>
          <p className="text-sm opacity-60 mb-12">
            كن أول من يعلم عن الإصدارات المحدودة والعروض الحصرية. انضم إلى قائمتنا البريدية.
          </p>
          <form className="flex flex-col sm:flex-row gap-0 border-b border-white/20 pb-2">
            <input 
              type="email" 
              placeholder="بريدك الإلكتروني" 
              className="bg-transparent border-none text-white placeholder:text-white/40 focus:ring-0 flex-1 text-center py-4"
            />
            <button className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors py-4 px-6">
              SUBSCRIBE
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
}
