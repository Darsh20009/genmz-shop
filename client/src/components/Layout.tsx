import logoImg from "@assets/Gen_M&Z_LOGO_1766644527859.png";
import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, User, Menu, LogOut, Sun, Moon, Phone, Mail, Instagram, Twitter } from "lucide-react";
import { SiTiktok, SiSnapchat, SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useTheme } from "@/components/theme-provider";
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

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-4 md:gap-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden no-default-hover-elevate">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] flex flex-col">
                <div className="flex flex-col gap-6 mt-12 px-2 flex-1" dir="rtl">
                  <Link href="/" className={`text-xl font-bold ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}>الرئيسية</Link>
                  <Link href="/products" className={`text-xl font-bold ${location === '/products' ? 'text-primary' : 'text-muted-foreground'}`}>المتجر</Link>
                  <Link href="/categories/single-cab" className="text-xl font-bold text-muted-foreground">سنقل كاب</Link>
                  <Link href="/categories/double-cab" className="text-xl font-bold text-muted-foreground">دبل كاب</Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin" className="text-xl font-bold text-primary">لوحة التحكم</Link>
                  )}
                </div>

                <div className="mt-auto border-t pt-6 pb-8 px-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">تواصل معنا</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <a href="https://www.instagram.com/genmz.sa/" target="_blank" rel="noreferrer" className="flex items-center justify-center p-3 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white rounded-xl shadow-sm hover:scale-105 transition-transform">
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a href="https://x.com/GenMZsa" target="_blank" rel="noreferrer" className="flex items-center justify-center p-3 bg-black text-white rounded-xl shadow-sm hover:scale-105 transition-transform border border-white/10">
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a href="https://www.snapchat.com/@genmz.sa" target="_blank" rel="noreferrer" className="flex items-center justify-center p-3 bg-[#FFFC00] text-black rounded-xl shadow-sm hover:scale-105 transition-transform">
                      <SiSnapchat className="h-5 w-5" />
                    </a>
                    <a href="https://www.tiktok.com/@genmz.sa" target="_blank" rel="noreferrer" className="flex items-center justify-center p-3 bg-black text-white rounded-xl shadow-sm hover:scale-105 transition-transform border border-white/10">
                      <SiTiktok className="h-5 w-5" />
                    </a>
                  </div>
                  <div className="mt-4 space-y-2">
                    <a href="tel:+966552469643" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                      <Phone className="h-4 w-4" />
                      <span dir="ltr">+966 55 246 9643</span>
                    </a>
                    <a href="https://api.whatsapp.com/send/?phone=966501906069" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                      <SiWhatsapp className="h-4 w-4 text-[#25D366]" />
                      <span dir="ltr">+966 50 190 6069</span>
                    </a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center">
              <img src={logoImg} alt="Gen M & Z" className="h-10 w-auto md:h-12" />
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm font-bold">
              <Link href="/" className={`transition-colors hover:text-primary ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}>الرئيسية</Link>
              <Link href="/products" className={`transition-colors hover:text-primary ${location === '/products' ? 'text-primary' : 'text-muted-foreground'}`}>المتجر</Link>
              <Link href="/categories/single-cab" className="transition-colors hover:text-primary text-muted-foreground">سنقل كاب</Link>
              <Link href="/categories/double-cab" className="transition-colors hover:text-primary text-muted-foreground">دبل كاب</Link>
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="no-default-hover-elevate">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative no-default-hover-elevate">
                <ShoppingBag className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="no-default-hover-elevate">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" dir="rtl">
                  <DropdownMenuLabel className="text-right">مرحباً, {user.username}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard">
                    <DropdownMenuItem className="justify-start">حسابي</DropdownMenuItem>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin">
                      <DropdownMenuItem className="justify-start text-primary font-bold">لوحة التحكم</DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuItem onClick={() => logout()} className="justify-start text-destructive">
                    <LogOut className="h-4 w-4 ml-2" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm" className="font-bold h-9">
                  تسجيل الدخول
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main>{children}</main>

      {/* Floating WhatsApp Button */}
      <a
        href="https://api.whatsapp.com/send/?phone=966501906069&text&type=phone_number&app_absent=0"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:scale-110 transition-transform group"
      >
        <span className="font-bold whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-500">تواصل معنا</span>
        <SiWhatsapp className="h-6 w-6" />
      </a>

      {/* Footer */}
      <footer className="border-t bg-card py-16 mt-24">
        <div className="container grid grid-cols-1 md:grid-cols-4 gap-12 px-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <img src={logoImg} alt="Gen M & Z" className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              الفخامة العصرية للجيل الجديد. تصميم سعودي بأعلى معايير الجودة والتفرد.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-6">التصنيفات</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-primary transition-colors">جميع المنتجات</Link></li>
              <li><Link href="/categories/single-cab" className="hover:text-primary transition-colors">سنقل كاب</Link></li>
              <li><Link href="/categories/double-cab" className="hover:text-primary transition-colors">دبل كاب</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-6">المساعدة</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="hover:text-primary cursor-pointer transition-colors">سياسة الشحن</li>
              <li className="hover:text-primary cursor-pointer transition-colors">سياسة الاسترجاع</li>
              <li className="hover:text-primary cursor-pointer transition-colors">الأسئلة الشائعة</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-6">تواصل معنا</h3>
            <div className="space-y-4 text-sm text-muted-foreground">
              <a 
                href="tel:+966552469643" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-primary/5 hover:text-primary transition-all group"
              >
                <span className="bg-primary/10 p-2.5 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"><Phone className="h-4 w-4" /></span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-medium">اتصل بنا</span>
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
                  <span className="text-[10px] text-muted-foreground font-medium">البريد الإلكتروني</span>
                  <span dir="ltr" className="font-bold">genmz.sa@gmail.com</span>
                </div>
              </a>
              <div className="flex items-center gap-3 p-2">
                <span className="bg-primary/10 p-2.5 rounded-lg text-primary"><SiWhatsapp className="h-4 w-4" /></span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-medium">واتساب</span>
                  <a href="https://api.whatsapp.com/send/?phone=966501906069" target="_blank" rel="noreferrer" dir="ltr" className="font-bold hover:text-primary transition-colors">+966 50 190 6069</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container mt-16 pt-8 border-t text-center text-sm text-muted-foreground px-4">
          © 2024 Gen M & Z. جميع الحقوق محفوظة.
          <div className="flex justify-center flex-wrap gap-4 mt-8">
            <a href="https://www.instagram.com/genmz.sa/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white rounded-full hover:scale-105 transition-transform shadow-lg">
              <Instagram className="h-4 w-4" />
              <span className="font-bold">Instagram</span>
            </a>
            <a href="https://x.com/GenMZsa" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:scale-105 transition-transform shadow-lg border border-white/10">
              <Twitter className="h-4 w-4" />
              <span className="font-bold">Twitter</span>
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
