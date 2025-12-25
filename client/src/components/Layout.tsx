import logoImg from "@assets/Gen_M&Z_LOGO_1766644527859.png";
import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, User, Menu, LogOut, Sun, Moon, Phone, Mail, Instagram, Twitter, Download, Globe } from "lucide-react";
import { SiTiktok, SiSnapchat, SiWhatsapp, SiX } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useTheme } from "@/components/theme-provider";
import { useLanguage } from "@/hooks/use-language";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const cartItems = useCart((state) => state.items);
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
    // Set initial direction
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden no-default-hover-elevate">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={language === 'ar' ? "right" : "left"} className="w-full flex flex-col p-0 border-none bg-white">
                <div className={`flex flex-col gap-6 mt-12 px-6 flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  <Link href="/" className={`text-2xl font-black uppercase transition-all hover:translate-x-1 ${location === '/' ? 'text-black' : 'text-muted-foreground'}`}>{t('home')}</Link>
                  <Link href="/products" className={`text-2xl font-black uppercase transition-all hover:translate-x-1 ${location === '/products' ? 'text-black' : 'text-muted-foreground'}`}>{t('shop')}</Link>
                  
                  {user && (
                    <>
                      <Link href="/dashboard" className="text-2xl font-black uppercase transition-all hover:translate-x-1 text-black">{t('myAccount')}</Link>
                      <Link href="/orders" className="text-2xl font-black uppercase transition-all hover:translate-x-1 text-black">{t('myOrders')}</Link>
                      {user.role === 'admin' && (
                        <Link href="/admin" className="text-2xl font-black uppercase transition-all hover:translate-x-1 text-primary">{t('adminPanel')}</Link>
                      )}
                    </>
                  )}

                  {deferredPrompt && (
                    <Button 
                      onClick={handleInstall}
                      variant="default"
                      className="mt-4 gap-2 font-black uppercase"
                    >
                      <Download className="h-5 w-5" />
                      {t('installApp')}
                    </Button>
                  )}
                </div>
                
                <div className="p-6 border-t bg-[#fafafa]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">{t('connectWithUs')}</p>
                  <div className={`flex gap-6 ${language === 'ar' ? 'justify-end' : 'justify-start'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <a href="https://www.instagram.com/genmz.sa/" target="_blank" rel="noreferrer" className="text-black hover:text-primary transition-colors"><Instagram className="h-6 w-6" /></a>
                    <a href="https://x.com/GenMZsa" target="_blank" rel="noreferrer" className="text-black hover:text-primary transition-colors"><SiX className="h-6 w-6" /></a>
                    <a href="https://www.tiktok.com/@genmz.sa" target="_blank" rel="noreferrer" className="text-black hover:text-primary transition-colors"><SiTiktok className="h-6 w-6" /></a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center py-2">
              <img src={logoImg} alt="Gen M & Z" className="h-10 w-auto md:h-12 object-contain" />
            </Link>
          </div>

          <div className={`hidden md:flex items-center gap-8 text-[11px] font-black uppercase ${language === 'en' ? 'tracking-widest' : ''}`}>
            <Link href="/" className={`transition-colors hover:text-primary ${location === '/' ? 'text-black' : 'text-muted-foreground'}`}>{t('home')}</Link>
            <Link href="/products" className={`transition-colors hover:text-primary ${location === '/products' ? 'text-black' : 'text-muted-foreground'}`}>{t('shop')}</Link>
            {deferredPrompt && (
              <Button 
                onClick={handleInstall}
                variant="ghost"
                size="sm"
                className="gap-2 font-black uppercase text-[10px] h-9"
              >
                <Download className="h-4 w-4" />
                {t('installApp')}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="no-default-hover-elevate hover:text-primary"
            >
              <Globe className="h-5 w-5" />
            </Button>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative no-default-hover-elevate hover:text-primary">
                <ShoppingBag className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className={`absolute -top-1 ${language === 'ar' ? '-right-1' : '-left-1'} h-3.5 w-3.5 rounded-full bg-black text-[9px] font-bold text-white flex items-center justify-center`}>
                    {cartItems.length}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="no-default-hover-elevate hover:text-primary">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={language === 'ar' ? "end" : "start"} className="w-56 rounded-none border-black/5 shadow-2xl bg-white">
                  <DropdownMenuLabel className={`${language === 'ar' ? 'text-right' : 'text-left'} font-black uppercase text-[10px] tracking-widest`}>{user.username}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard"><DropdownMenuItem className={`justify-start text-xs font-bold uppercase ${language === 'en' ? 'tracking-wider' : ''}`}>{t('myAccount')}</DropdownMenuItem></Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin"><DropdownMenuItem className={`justify-start text-xs font-bold uppercase text-primary ${language === 'en' ? 'tracking-wider' : ''}`}>{t('adminPanel')}</DropdownMenuItem></Link>
                  )}
                  <DropdownMenuItem onClick={() => logout()} className={`justify-start text-xs font-bold uppercase text-destructive ${language === 'en' ? 'tracking-wider' : ''}`}>{t('signOut')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className={`font-black uppercase text-[10px] ${language === 'en' ? 'tracking-widest' : ''} h-9 px-4`}>
                  {t('signIn')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      {/* Floating WhatsApp Button */}
      <a
        href="https://api.whatsapp.com/send/?phone=966501906069&text&type=phone_number&app_absent=0"
        target="_blank"
        rel="noreferrer"
        className={`fixed bottom-6 ${language === 'ar' ? 'right-6' : 'left-6'} z-50 flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:scale-110 transition-transform group`}
      >
        <span className="font-bold whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-500">{t('contactUs')}</span>
        <SiWhatsapp className="h-6 w-6" />
      </a>

      {/* Footer */}
      <footer className="border-t bg-card py-16 mt-24">
        <div className="container grid grid-cols-1 md:grid-cols-4 gap-12 px-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <img src={logoImg} alt="Gen M & Z" className="h-14 w-auto object-contain" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {language === 'ar' 
                ? "الفخامة العصرية للجيل الجديد. تصميم سعودي بأعلى معايير الجودة والتفرد."
                : "Modern luxury for the new generation. Saudi design with the highest standards of quality and uniqueness."}
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-6">{t('categories')}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-primary transition-colors">{t('allProducts')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-6">{t('help')}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-primary transition-colors">{t('terms')}</Link></li>
              <li className="hover:text-primary cursor-pointer transition-colors">{t('faq')}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-6">{t('contactUs')}</h3>
            <div className="space-y-4 text-sm text-muted-foreground">
              <a 
                href="tel:+966552469643" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-primary/5 hover:text-primary transition-all group"
              >
                <span className="bg-primary/10 p-2.5 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"><Phone className="h-4 w-4" /></span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-medium">{t('callUs')}</span>
                  <span dir="ltr" className="font-bold">+966 55 246 9643</span>
                </div>
              </a>
              <a 
                href="mailto:genmz.sa@gmail.com" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-primary/5 hover:text-primary transition-all group"
              >
                <span className="bg-primary/10 p-2.5 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"><Mail className="h-4 w-4" /></span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-medium">{t('email')}</span>
                  <span dir="ltr" className="font-bold">genmz.sa@gmail.com</span>
                </div>
              </a>
              <div className="flex items-center gap-3 p-2">
                <span className="bg-primary/10 p-2.5 rounded-lg text-primary"><SiWhatsapp className="h-4 w-4" /></span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-medium">{t('whatsapp')}</span>
                  <a href="https://api.whatsapp.com/send/?phone=966501906069" target="_blank" rel="noreferrer" dir="ltr" className="font-bold hover:text-primary transition-colors">+966 50 190 6069</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container mt-16 pt-8 border-t text-center text-sm text-muted-foreground px-4">
          <p>© 2026 Gen M & Z. {t('allRightsReserved')}.</p>
          <p className="mt-2 text-xs opacity-70">{t('madeWithLove')}</p>
          <div className="flex justify-center flex-wrap gap-4 mt-8">
            <a href="https://www.instagram.com/genmz.sa/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white rounded-full hover:scale-105 transition-transform shadow-lg">
              <Instagram className="h-4 w-4" />
              <span className="font-bold">Instagram</span>
            </a>
            <a href="https://x.com/GenMZsa" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:scale-105 transition-transform shadow-lg border border-white/10">
              <SiX className="h-4 w-4" />
              <span className="font-bold">X</span>
            </a>
            <a href="https://www.snapchat.com/@genmz.sa" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#FFFC00] text-black rounded-full hover:scale-105 transition-transform shadow-lg">
              <SiSnapchat className="h-4 w-4" />
              <span className="font-bold">Snapchat</span>
            </a>
            <a href="https://www.tiktok.com/@genmz.sa" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:scale-105 transition-transform shadow-lg border border-white/10">
              <SiTiktok className="h-4 w-4" />
              <span className="font-bold">TikTok</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
