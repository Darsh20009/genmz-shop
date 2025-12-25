import logoImg from "@assets/Gen_M&Z_LOGO_1766644527859.png";
import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, User, Menu, LogOut, Sun, Moon, Phone, Mail, Instagram, Twitter } from "lucide-react";
import { SiTiktok, SiSnapchat, SiWhatsapp, SiX } from "react-icons/si";
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
    <div className="min-h-screen bg-white text-black flex flex-col" dir="rtl">
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
              <SheetContent side="right" className="w-full flex flex-col p-0 border-none bg-white">
                <div className="flex flex-col gap-8 mt-20 px-8 flex-1" dir="rtl">
                  <Link href="/" className={`text-4xl font-black uppercase tracking-tighter ${location === '/' ? 'text-black' : 'text-muted-foreground'}`}>الرئيسية</Link>
                  <Link href="/products" className={`text-4xl font-black uppercase tracking-tighter ${location === '/products' ? 'text-black' : 'text-muted-foreground'}`}>المتجر</Link>
                  <Link href="/categories/single-cab" className="text-4xl font-black uppercase tracking-tighter text-muted-foreground">سنقل كاب</Link>
                  <Link href="/categories/double-cab" className="text-4xl font-black uppercase tracking-tighter text-muted-foreground">دبل كاب</Link>
                </div>
                
                <div className="p-8 border-t bg-[#fafafa]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Connect with us</p>
                  <div className="flex gap-6">
                    <a href="https://www.instagram.com/genmz.sa/" target="_blank" rel="noreferrer" className="text-black"><Instagram className="h-6 w-6" /></a>
                    <a href="https://x.com/GenMZsa" target="_blank" rel="noreferrer" className="text-black"><SiX className="h-6 w-6" /></a>
                    <a href="https://www.tiktok.com/@genmz.sa" target="_blank" rel="noreferrer" className="text-black"><SiTiktok className="h-6 w-6" /></a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center py-2">
              <img src={logoImg} alt="Gen M & Z" className="h-10 w-auto md:h-12 object-contain" />
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest">
            <Link href="/" className={`transition-colors hover:text-primary ${location === '/' ? 'text-black' : 'text-muted-foreground'}`}>الرئيسية</Link>
            <Link href="/products" className={`transition-colors hover:text-primary ${location === '/products' ? 'text-black' : 'text-muted-foreground'}`}>المتجر</Link>
            <Link href="/categories/single-cab" className="transition-colors hover:text-primary text-muted-foreground">سنقل كاب</Link>
            <Link href="/categories/double-cab" className="transition-colors hover:text-primary text-muted-foreground">دبل كاب</Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative no-default-hover-elevate hover:text-primary">
                <ShoppingBag className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-black text-[9px] font-bold text-white flex items-center justify-center">
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
                <DropdownMenuContent align="end" className="w-56 rounded-none border-black/5 shadow-2xl bg-white" dir="rtl">
                  <DropdownMenuLabel className="text-right font-black uppercase text-[10px] tracking-widest">{user.username}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard"><DropdownMenuItem className="justify-start text-xs font-bold uppercase tracking-wider">حسابي</DropdownMenuItem></Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin"><DropdownMenuItem className="justify-start text-xs font-bold uppercase tracking-wider text-primary">لوحة التحكم</DropdownMenuItem></Link>
                  )}
                  <DropdownMenuItem onClick={() => logout()} className="justify-start text-xs font-bold uppercase tracking-wider text-destructive">تسجيل الخروج</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-black uppercase text-[10px] tracking-widest h-9 px-4">
                  Sign In
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
              <img src={logoImg} alt="Gen M & Z" className="h-14 w-auto object-contain" />
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
          <p>© 2026 Gen M & Z. جميع الحقوق محفوظة.</p>
          <p className="mt-2 text-xs opacity-70">صنع بحب Ma3k tec solutions</p>
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
