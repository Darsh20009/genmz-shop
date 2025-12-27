import logoImg from "@assets/Gen_M&Z_LOGO_1766644527859.png";
import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, User, Menu, LogOut, Sun, Moon, Phone, Mail, Instagram, Twitter, Download, Globe, Check, Wallet } from "lucide-react";
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

  const isDashboard = location.startsWith('/dashboard') || location.startsWith('/admin');

  if (isDashboard) {
    return <main className="min-h-screen bg-[#f8fafc]">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/80 backdrop-blur-md safe-top h-16 md:h-20">
        <div className="container flex h-full items-center justify-between gap-2 px-4 md:gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden no-default-hover-elevate h-10 w-10">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side={language === 'ar' ? "right" : "left"} className="w-full flex flex-col p-0 border-none bg-white">
                <div className={`flex flex-col gap-8 mt-16 px-8 flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  <Link href="/" className={`text-4xl font-black uppercase transition-all active:scale-95 ${location === '/' ? 'text-black' : 'text-muted-foreground'}`}>{t('home')}</Link>
                  <Link href="/products" className={`text-4xl font-black uppercase transition-all active:scale-95 ${location === '/products' ? 'text-black' : 'text-muted-foreground'}`}>{t('shop')}</Link>
                  
                  {user && (
                    <>
                      <Link href="/orders" className="text-4xl font-black uppercase transition-all active:scale-95 text-black">{t('myOrders')}</Link>
                      {user.role === 'admin' && (
                        <Link href="/admin" className="text-4xl font-black uppercase transition-all active:scale-95 text-primary">{t('adminPanel')}</Link>
                      )}
                    </>
                  )}

                  {deferredPrompt && (
                    <Button 
                      onClick={handleInstall}
                      variant="default"
                      className="mt-8 h-16 text-xl font-black uppercase rounded-2xl shadow-xl active:scale-95 transition-transform"
                    >
                      <Download className="h-6 w-6" />
                      {t('installApp')}
                    </Button>
                  )}
                </div>
                
                <div className="p-8 border-t bg-[#fafafa] pb-12">
                  <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-6">{t('connectWithUs')}</p>
                  <div className={`flex gap-8 ${language === 'ar' ? 'justify-end' : 'justify-start'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <a href="https://www.instagram.com/genmz.sa/" target="_blank" rel="noreferrer" className="text-black hover:text-primary transition-colors active:scale-125 transition-transform"><Instagram className="h-8 w-8" /></a>
                    <a href="https://x.com/GenMZsa" target="_blank" rel="noreferrer" className="text-black hover:text-primary transition-colors active:scale-125 transition-transform"><SiX className="h-8 w-8" /></a>
                    <a href="https://www.tiktok.com/@genmz.sa" target="_blank" rel="noreferrer" className="text-black hover:text-primary transition-colors active:scale-125 transition-transform"><SiTiktok className="h-8 w-8" /></a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center py-2 hover:opacity-80 transition-opacity active:scale-95 transition-transform">
              <div className="flex items-center gap-2 md:gap-3">
                <img src={logoImg} alt="Gen M & Z" className="h-10 w-auto md:h-14 object-contain" />
                <div className="hidden sm:flex flex-col border-l border-black/10 pl-3">
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] leading-none text-black/40 mb-1">Modern Luxury</span>
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.1em] leading-none">Gen M & Z</span>
                </div>
              </div>
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

          <div className="flex items-center gap-1 md:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="no-default-hover-elevate hover:text-primary h-11 w-11 active:scale-95 transition-transform"
            >
              <Globe className="h-6 w-6" />
            </Button>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative no-default-hover-elevate hover:text-primary h-11 w-11 active:scale-95 transition-transform">
                <ShoppingBag className="h-6 w-6" />
                {cartItems.length > 0 && (
                  <span className={`absolute -top-1 ${language === 'ar' ? '-right-1' : '-left-1'} h-5 w-5 rounded-full bg-black text-[10px] font-black text-white flex items-center justify-center shadow-md`}>
                    {cartItems.length}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-11 px-2 md:px-4 flex items-center gap-2 md:gap-3 border border-black/5 hover:border-black/20 transition-all rounded-none group no-default-hover-elevate active:scale-95">
                    <div className="hidden xs:flex flex-col items-end">
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-black/40 group-hover:text-black transition-colors">{t('myAccount') || 'حسابي'}</span>
                      <span className="text-[10px] md:text-[11px] font-bold text-black/60 truncate max-w-[80px] md:max-w-[100px]">{user?.name || user?.username}</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500 shadow-inner">
                      <User className="h-5 w-5" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={language === 'ar' ? "end" : "start"} className="w-64 p-2 rounded-none border-black/5 shadow-2xl bg-white animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-3 py-4 mb-2 bg-black/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-black text-xl">
                      {(user?.name || user?.username || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-black/40">{t('welcome') || 'مرحباً بك'}</span>
                      <span className="text-sm font-bold text-black truncate max-w-[140px]">{user?.name || user?.username}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Link href="/profile">
                      <DropdownMenuItem className={`cursor-pointer gap-3 p-3 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all rounded-none ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <User className="h-4 w-4 opacity-40" />
                        {t('myAccount') || 'حسابي'}
                      </DropdownMenuItem>
                    </Link>
                    
                    <div className={`flex items-center justify-between p-3 mb-2 bg-primary/5 border border-primary/10 rounded-none ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <Wallet className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-black/40">{t('wallet') || 'المحفظة'}</span>
                      </div>
                      <span dir="ltr" className="text-sm font-black text-primary">{(user as any)?.walletBalance?.toLocaleString() || '0'} {t('currency')}</span>
                    </div>

                    <Link href="/orders">
                      <DropdownMenuItem className={`cursor-pointer gap-3 p-3 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all rounded-none ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <ShoppingBag className="h-4 w-4 opacity-40" />
                        {t('myOrders') || 'طلباتي'}
                      </DropdownMenuItem>
                    </Link>
                    
                    {user?.role === 'admin' && (
                      <Link href="/admin">
                        <DropdownMenuItem className={`cursor-pointer gap-3 p-3 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-black hover:text-white transition-all rounded-none ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                          <Check className="h-4 w-4" />
                          {t('adminPanel')}
                        </DropdownMenuItem>
                      </Link>
                    )}
                    
                    <DropdownMenuSeparator className="my-2 bg-black/5" />
                    
                    <DropdownMenuItem onClick={() => logout()} className={`cursor-pointer gap-3 p-3 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive hover:text-white transition-all rounded-none ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <User className="h-4 w-4 opacity-40" />
                      {t('signOut')}
                    </DropdownMenuItem>
                  </div>
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
        href="https://api.whatsapp.com/send/?phone=966567326086&text&type=phone_number&app_absent=0"
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
                href="tel:+966567326086" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-primary/5 hover:text-primary transition-all group"
              >
                <span className="bg-primary/10 p-2.5 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"><Phone className="h-4 w-4" /></span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-medium">{t('callUs')}</span>
                  <span dir="ltr" className="font-bold">966 56 732 6086</span>
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
                  <a href="https://api.whatsapp.com/send/?phone=966567326086" target="_blank" rel="noreferrer" dir="ltr" className="font-bold hover:text-primary transition-colors">966 56 732 6086</a>
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
