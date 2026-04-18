import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { Home, ArrowRight, PackageSearch } from "lucide-react";

export default function NotFound() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fcfcfc] dark:bg-slate-950 p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl w-full text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative inline-block mb-8">
            <h1 className="text-[12rem] md:text-[16rem] font-black leading-none tracking-tighter text-black/5 dark:text-white/5 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <PackageSearch className="w-24 h-24 md:w-32 md:h-32 text-primary opacity-20" />
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">
            {language === 'ar' ? 'عذراً، هذه الصفحة غير موجودة' : 'Oops! Page Not Found'}
          </h2>
          
          <p className="text-muted-foreground text-lg md:text-xl font-light italic mb-12 max-w-md mx-auto">
            {language === 'ar' 
              ? 'يبدو أن الصفحة التي تبحث عنها قد تم نقلها أو أنها غير موجودة حالياً.' 
              : "It seems the page you're looking for has been moved or doesn't exist anymore."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/">
              <Button size="lg" className="min-h-12 px-8 rounded-none font-black uppercase tracking-widest gap-2 group">
                <Home className="w-4 h-4" />
                {t('home')}
              </Button>
            </Link>
            
            <Link href="/shop">
              <Button variant="outline" size="lg" className="min-h-12 px-8 rounded-none font-black uppercase tracking-widest gap-2 border-black/10 group">
                {language === 'ar' ? 'تصفح المنتجات' : 'Browse Shop'}
                <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${language === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="pt-12 border-t border-black/5 flex flex-wrap justify-center gap-8 opacity-20 grayscale">
           <span className="text-xs font-black uppercase tracking-[0.3em]">Gen M & Z</span>
           <span className="text-xs font-black uppercase tracking-[0.3em]">Quality</span>
           <span className="text-xs font-black uppercase tracking-[0.3em]">Modern</span>
        </div>
      </div>
    </div>
  );
}
