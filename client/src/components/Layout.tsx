import logoImg from "@assets/Gen_M&Z_LOGO_1766644527859.png";
import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  ShoppingBag, User, Menu, LogOut, Sun, Moon, Phone, Mail, Instagram, Twitter, 
  Download, Globe, Check, Wallet, BarChart3, Package, PieChart, Image, Clock, 
  ShoppingCart, PlusCircle, Tags, Warehouse, Users, Star, MessageSquare, 
  Palette, Settings, Filter, Bell, MapPin, CheckCircle2, FileText
} from "lucide-react";
import { SiTiktok, SiSnapchat, SiWhatsapp, SiX } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useTheme } from "@/components/theme-provider";
import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { StoreSettings } from "@shared/schema";
import { ThemeToggle } from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { items: cartItems } = useCart();
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: settings } = useQuery<StoreSettings>({
    queryKey: ["/api/settings"],
  });

  const navLinks = (settings as any)?.navigationLinks || [];

  useEffect(() => {
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
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
    const sidebarItems = [
      { id: 'dashboard', label: language === 'ar' ? 'لوحة التحكم' : 'Dashboard', path: '/admin', icon: PieChart },
      { id: 'orders', label: language === 'ar' ? 'الطلبات' : 'Orders', path: '/admin/orders', icon: ShoppingBag, children: [
        { label: language === 'ar' ? 'الطلبات' : 'All Orders', path: '/admin/orders' },
        { label: language === 'ar' ? 'الطلبات اليدوية' : 'Manual Orders', path: '/admin/orders/manual' },
        { label: language === 'ar' ? 'السلات المتروكة' : 'Abandoned Carts', path: '/admin/abandoned-carts' },
      ]},
      { id: 'products', label: language === 'ar' ? 'المنتجات والمخزون' : 'Products & Inventory', path: '/admin/products', icon: Package, children: [
        { label: language === 'ar' ? 'المنتجات' : 'Products', path: '/admin/products' },
        { label: language === 'ar' ? 'التصنيفات' : 'Categories', path: '/admin/categories' },
        { label: language === 'ar' ? 'المخزون' : 'Inventory', path: '/admin/inventory' },
        { label: language === 'ar' ? 'طلبات النقل' : 'Transfer Requests', path: '/admin/transfers' },
        { label: language === 'ar' ? 'التقييمات' : 'Reviews', path: '/admin/reviews' },
        { label: language === 'ar' ? 'أسئلة المنتجات' : 'Product Questions', path: '/admin/product-questions' },
        { label: language === 'ar' ? 'مكتبة الخيارات' : 'Options Library', path: '/admin/options-library' },
        { label: language === 'ar' ? 'معايير التصفية' : 'Filter Criteria', path: '/admin/filter-criteria' },
        { label: language === 'ar' ? 'تنبيهات المخزون' : 'Stock Notifications', path: '/admin/stock-notifications' },
      ]},
      { id: 'customers', label: language === 'ar' ? 'العملاء' : 'Customers', path: '/admin/customers', icon: Users, children: [
        { label: language === 'ar' ? 'العملاء' : 'Customers', path: '/admin/customers' },
        { label: language === 'ar' ? 'مجموعات العملاء' : 'Customer Groups', path: '/admin/customer-groups' },
      ]},
      { id: 'pages', label: language === 'ar' ? 'الصفحات التعريفية' : 'Pages', path: '/admin/pages', icon: FileText },
      { id: 'branding', label: language === 'ar' ? 'الهوية البصرية' : 'Branding', path: '/admin/branding', icon: Palette },
      { id: 'themes', label: language === 'ar' ? 'الثيمات' : 'Themes', path: '/admin/themes', icon: Palette },
      { id: 'settings', label: language === 'ar' ? 'الإعدادات' : 'Settings', path: '/admin/settings', icon: Settings },
    ];

    const SidebarContent = () => (
      <div className="flex flex-col h-full bg-card overflow-hidden">
        <div className="flex h-16 items-center gap-3 border-b px-6 shrink-0">
          <img src={logoImg} alt="Logo" className="h-8 w-auto object-contain dark:invert" />
          <span className="font-black uppercase tracking-widest text-sm truncate">Gen M & Z</span>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
          {sidebarItems.map((item) => (
            <div key={item.id} className="space-y-1">
              <Link href={item.path} onClick={() => setIsSidebarOpen(false)}>
                <Button
                  variant={location === item.path ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 h-11 px-4 rounded-xl font-bold transition-all duration-200 ${
                    location === item.path ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10 translate-x-1" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <item.icon className={`h-5 w-5 shrink-0 ${location === item.path ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  <span className="truncate">{item.label}</span>
                </Button>
              </Link>
              {item.children && (location.startsWith(item.path) || item.children.some(c => location === c.path)) && (
                <div className={`ms-9 space-y-1 border-s-2 border-border ps-4 py-1 mt-1`}>
                  {item.children.map((child) => (
                    <Link key={child.path} href={child.path} onClick={() => setIsSidebarOpen(false)}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start text-xs h-9 rounded-lg font-bold transition-all ${
                          location === child.path ? "text-foreground bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                      >
                        <span className="truncate">{child.label}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="border-t p-4 bg-muted/30 shrink-0">
          <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 rounded-xl font-bold h-11" onClick={() => logout()}>
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="truncate">{language === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
          </Button>
        </div>
      </div>
    );

    return (
      <div className="flex min-h-screen bg-background text-foreground" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex fixed inset-y-0 z-50 w-72 flex-col border-e shadow-sm transition-all duration-300">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent side={language === 'ar' ? "right" : "left"} className="p-0 w-72 border-none">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        <div className="flex-1 lg:ms-72 w-full overflow-hidden">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 md:px-8 shadow-sm">
            <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
              <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 shrink-0" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="h-6 w-6" />
              </Button>
              <h2 className="text-xs md:text-sm font-black uppercase tracking-widest text-muted-foreground truncate">
                {sidebarItems.find(i => location.startsWith(i.path))?.label || t('adminPanel')}
              </h2>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <Button variant="ghost" size="icon" onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} className="rounded-full hover:bg-accent h-9 w-9 md:h-10 md:w-10">
                <Globe className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-1 md:px-2 hover:bg-accent rounded-full transition-all">
                    <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-[10px] md:text-xs shadow-inner">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-xs font-bold text-muted-foreground">{user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border-none shadow-2xl p-2 bg-popover text-popover-foreground">
                  <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-muted-foreground px-3 pb-2">{t('myAccount')}</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem onClick={() => logout()} className="text-destructive font-bold text-xs p-3 rounded-lg cursor-pointer hover:bg-destructive/5">
                    <LogOut className="h-4 w-4 me-2" />
                    {t('signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="p-4 md:p-8 min-h-[calc(100vh-64px)] w-full">
            <div className="max-w-full overflow-x-hidden">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md safe-top h-16 md:h-20">
        <div className="container flex h-full items-center justify-between gap-2 px-4 md:gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden no-default-hover-elevate h-10 w-10 hover:bg-accent">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side={language === 'ar' ? "right" : "left"} className="w-full flex flex-col p-0 border-none bg-background overflow-y-auto">
                <div className={`flex flex-col gap-4 sm:gap-8 mt-12 sm:mt-16 px-4 sm:px-8 flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  <Link href="/" onClick={closeSidebar} className={`text-2xl sm:text-4xl font-black uppercase transition-all active:scale-95 ${location === '/' ? 'text-foreground' : 'text-muted-foreground'}`}>{t('home')}</Link>
                  <Link href="/shop" onClick={closeSidebar} className={`text-2xl sm:text-4xl font-black uppercase transition-all active:scale-95 ${location === '/shop' ? 'text-foreground' : 'text-muted-foreground'}`}>{t('shop')}</Link>
                  
                  {navLinks.sort((a: any, b: any) => a.order - b.order).map((link: any) => (
                    <Link 
                      key={link.id} 
                      href={link.url} 
                      onClick={closeSidebar}
                      className="text-2xl sm:text-4xl font-black uppercase transition-all active:scale-95 text-muted-foreground"
                    >
                      {language === 'ar' ? link.titleAr : link.titleEn}
                    </Link>
                  ))}

                  {user && (
                    <>
                      <Link href="/orders" onClick={closeSidebar} className="text-2xl sm:text-4xl font-black uppercase transition-all active:scale-95 text-foreground">{t('myOrders')}</Link>
                      {user.role === 'admin' && (
                        <Link href="/admin" onClick={closeSidebar} className="text-2xl sm:text-4xl font-black uppercase transition-all active:scale-95 text-primary">{t('adminPanel')}</Link>
                      )}
                    </>
                  )}

                  {deferredPrompt && (
                    <Button 
                      onClick={() => { handleInstall(); closeSidebar(); }}
                      variant="default"
                      className="mt-4 sm:mt-8 h-12 sm:h-16 text-lg sm:text-xl font-black uppercase rounded-2xl shadow-xl active:scale-95 transition-transform"
                    >
                      <Download className="h-5 w-5 sm:h-6 sm:w-6" />
                      {t('installApp')}
                    </Button>
                  )}
                </div>
                
                <div className="p-4 sm:p-8 border-t bg-muted pb-8 sm:pb-12 mt-auto">
                  <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-4 sm:mb-6">{t('connectWithUs')}</p>
                  <div className={`flex gap-4 sm:gap-8 ${language === 'ar' ? 'justify-end' : 'justify-start'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <a href="https://www.instagram.com/genmz.sa/" target="_blank" rel="noreferrer" className="text-foreground hover:text-primary transition-colors active:scale-125 transition-transform"><Instagram className="h-6 w-6 sm:h-8 sm:w-8" /></a>
                    <a href="https://x.com/GenMZsa" target="_blank" rel="noreferrer" className="text-foreground hover:text-primary transition-colors active:scale-125 transition-transform"><SiX className="h-6 w-6 sm:h-8 sm:w-8" /></a>
                    <a href="https://www.tiktok.com/@genmz.sa" target="_blank" rel="noreferrer" className="text-foreground hover:text-primary transition-colors active:scale-125 transition-transform"><SiTiktok className="h-6 w-6 sm:h-8 sm:w-8" /></a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center py-2 hover:opacity-80 transition-opacity active:scale-95 transition-transform">
              <div className="flex items-center gap-2 md:gap-3">
                <img src={logoImg} alt="Gen M & Z" className="h-10 w-auto md:h-14 object-contain dark:invert" />
                <div className="hidden sm:flex flex-col border-l border-border pl-3">
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] leading-none text-muted-foreground mb-1">Modern Luxury</span>
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.1em] leading-none">Gen M & Z</span>
                </div>
              </div>
            </Link>
          </div>

          <div className={`hidden md:flex items-center gap-8 text-[11px] font-black uppercase ${language === 'en' ? 'tracking-widest' : ''}`}>
            <Link href="/" className={`transition-colors hover:text-primary ${location === '/' ? 'text-foreground' : 'text-muted-foreground'}`}>{t('home')}</Link>
            <Link href="/shop" className={`transition-colors hover:text-primary ${location === '/shop' ? 'text-foreground' : 'text-muted-foreground'}`}>{t('shop')}</Link>
            {navLinks.sort((a: any, b: any) => a.order - b.order).map((link: any) => (
              <Link 
                key={link.id} 
                href={link.url}
                className={`transition-colors hover:text-primary ${location === link.url ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {language === 'ar' ? link.titleAr : link.titleEn}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="no-default-hover-elevate hover:text-primary h-11 w-11 active:scale-95 transition-transform hover:bg-accent"
            >
              <Globe className="h-6 w-6" />
            </Button>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative no-default-hover-elevate hover:text-primary h-11 w-11 active:scale-95 transition-transform hover:bg-accent">
                <ShoppingBag className="h-6 w-6" />
                {cartItems.reduce((acc, item) => acc + item.quantity, 0) > 0 && (
                  <span className={`absolute -top-1 ${language === 'ar' ? '-right-1' : '-left-1'} h-5 w-5 rounded-full bg-primary text-[10px] font-black text-primary-foreground flex items-center justify-center shadow-md`}>
                    {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-11 px-2 md:px-4 flex items-center gap-2 md:gap-3 border border-border hover:border-border/50 transition-all rounded-none group no-default-hover-elevate active:scale-95 hover:bg-accent">
                    <div className="hidden xs:flex flex-col items-end">
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{t('myAccount')}</span>
                      <span className="text-[10px] md:text-[11px] font-bold text-muted-foreground truncate max-w-[80px] md:max-w-[100px]">{user?.name || user?.username}</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner">
                      <User className="h-5 w-5" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={language === 'ar' ? "end" : "start"} className="w-64 p-2 rounded-none border-border shadow-2xl bg-popover text-popover-foreground animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-3 py-4 mb-2 bg-muted flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-xl">
                      {(user?.name || user?.username || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('welcome')}</span>
                      <span className="text-sm font-bold text-foreground truncate max-w-[140px]">{user?.name || user?.username}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Link href="/profile">
                      <DropdownMenuItem className={`cursor-pointer gap-3 p-3 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all rounded-none ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <User className="h-4 w-4 opacity-40" />
                        {t('myAccount')}
                      </DropdownMenuItem>
                    </Link>
                    
                    <div className={`flex items-center justify-between p-3 mb-2 bg-primary/5 border border-primary/10 rounded-none ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <Wallet className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('wallet')}</span>
                      </div>
                      <span dir="ltr" className="text-sm font-black text-primary">{(user as any)?.walletBalance?.toLocaleString() || '0'} {t('currency')}</span>
                    </div>

                    <Link href="/orders">
                      <DropdownMenuItem className={`cursor-pointer gap-3 p-3 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all rounded-none ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <ShoppingBag className="h-4 w-4 opacity-40" />
                        {t('myOrders')}
                      </DropdownMenuItem>
                    </Link>
                    
                    {user?.role === 'admin' && (
                      <Link href="/admin">
                        <DropdownMenuItem className={`cursor-pointer gap-3 p-3 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground transition-all rounded-none ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                          <Check className="h-4 w-4" />
                          {t('adminPanel')}
                        </DropdownMenuItem>
                      </Link>
                    )}
                    
                    <DropdownMenuSeparator className="my-2 bg-border" />
                    
                    <DropdownMenuItem onClick={() => logout()} className={`cursor-pointer gap-3 p-3 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive hover:text-white transition-all rounded-none ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <LogOut className="h-4 w-4 opacity-40" />
                      {t('signOut')}
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className={`font-black uppercase text-[10px] ${language === 'en' ? 'tracking-widest' : ''} h-9 px-4 hover:bg-accent`}>
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
        className={`fixed bottom-6 ${language === 'ar' ? 'right-6' : 'left-6'} z-50 flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:scale-110 transition-transform group shadow-[#25D366]/20`}
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
                ? "جين إم آند زي - وجهتكم الأولى للأزياء العصرية والراقية التي تجمع بين الجودة والأناقة."
                : "Gen M & Z - Your premier destination for modern and elegant fashion that combines quality and style."}
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-6">{t('categories')}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/shop" className="hover:text-primary transition-colors">{t('allProducts')}</Link></li>
              {navLinks.map((link: any) => (
                <li key={link.id}><Link href={link.url} className="hover:text-primary transition-colors">{language === 'ar' ? link.titleAr : link.titleEn}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-6">{t('help')}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/guide" className="hover:text-primary transition-colors">{language === 'ar' ? 'دليل الاستخدام' : 'User Guide'}</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">{t('terms')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-6">{t('contactUs')}</h3>
            <div className="space-y-4 text-sm text-muted-foreground">
              <a 
                href="tel:552469643" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-primary/5 hover:text-primary transition-all group"
              >
                <span className="bg-primary/10 p-2.5 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"><Phone className="h-4 w-4" /></span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-medium">{t('callUs')}</span>
                  <span dir="ltr" className="font-bold">552469643</span>
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
                  <a href="https://api.whatsapp.com/send/?phone=966501906069" target="_blank" rel="noreferrer" dir="ltr" className="font-bold hover:text-primary transition-colors">966501906069</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container mt-16 pt-8 border-t text-center text-sm text-muted-foreground px-4">
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

          <div className="mt-12 pt-8 border-t">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">{language === 'ar' ? 'طرق الدفع المتاحة' : 'Available Payment Methods'}</p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <a href="#" title="Payment Method" className="h-12 w-12 flex items-center justify-center hover:scale-110 transition-transform">
                <img src="https://media.zid.store/cdn-cgi/image/h=80,q=100/https://media.zid.store/apps/296480bb-8f91-40d7-884d-496b563c1629.jpg" loading="lazy" alt="Payment method" className="h-full object-contain" />
              </a>
              <a href="#" title="Apple Pay" className="h-12 w-12 flex items-center justify-center hover:scale-110 transition-transform">
                <img src="https://media.zid.store/cdn-cgi/image/h=80,q=100/https://media.zid.store/static/apple_pay.svg" loading="lazy" alt="Apple Pay" className="h-full object-contain" />
              </a>
              <a href="#" title="Mada" className="h-12 w-12 flex items-center justify-center hover:scale-110 transition-transform">
                <img src="https://media.zid.store/cdn-cgi/image/h=80,q=100/https://media.zid.store/static/mada-circle.png" loading="lazy" alt="Mada" className="h-full object-contain" />
              </a>
              <a href="#" title="Visa" className="h-12 w-12 flex items-center justify-center hover:scale-110 transition-transform">
                <img src="https://media.zid.store/cdn-cgi/image/h=80,q=100/https://media.zid.store/static/visa-circle.png" loading="lazy" alt="Visa" className="h-full object-contain" />
              </a>
              <a href="#" title="Mastercard" className="h-12 w-12 flex items-center justify-center hover:scale-110 transition-transform">
                <img src="https://media.zid.store/cdn-cgi/image/h=80,q=100/https://media.zid.store/static/mastercard-circle.png" loading="lazy" alt="Mastercard" className="h-full object-contain" />
              </a>
              <a href="#" title="American Express" className="h-12 w-12 flex items-center justify-center hover:scale-110 transition-transform">
                <img src="https://media.zid.store/cdn-cgi/image/h=80,q=100/https://media.zid.store/static/amex.png" loading="lazy" alt="American Express" className="h-full object-contain" />
              </a>
              <a href="#" title="STC Pay" className="h-12 w-12 flex items-center justify-center hover:scale-110 transition-transform">
                <img src="https://media.zid.store/cdn-cgi/image/h=80,q=100/https://media.zid.store/static/stc_pay.png" loading="lazy" alt="STC Pay" className="h-full object-contain" />
              </a>
              <a href="#" title="Tabby" className="h-12 w-12 flex items-center justify-center hover:scale-110 transition-transform">
                <img src="https://media.zid.store/cdn-cgi/image/h=80,q=100/https://media.zid.store/static/tabby2.svg" loading="lazy" alt="Tabby" className="h-full object-contain" />
              </a>
              <a href="#" title="Tamara" className="h-12 w-12 flex items-center justify-center hover:scale-110 transition-transform">
                <img src="https://media.zid.store/cdn-cgi/image/h=80,q=100/https://media.zid.store/static/tamara2.svg" loading="lazy" alt="Tamara" className="h-full object-contain" />
              </a>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t flex justify-center">
            <a 
              href="https://eauthenticate.saudibusiness.gov.sa/certificate-details/0000203202" 
              target="_blank" 
              rel="noreferrer"
              className="flex flex-col items-center gap-2 hover:scale-110 transition-transform text-center"
            >
              <img 
                src="https://assets.zid.store/themes/f9f0914d-3c58-493b-bd83-260ed3cb4e82/business_center.png" 
                loading="lazy" 
                alt="Saudi Business Center Certification" 
                className="h-12 w-auto object-contain" 
              />
              <div className="text-xs text-muted-foreground font-semibold">0000203202</div>
            </a>
          </div>

          <div className="mt-12 pt-8 border-t">
            <p>© 2026 Gen M & Z. {t('allRightsReserved')}.</p>
            <p className="mt-2 text-xs opacity-70">{t('madeWithLove')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
