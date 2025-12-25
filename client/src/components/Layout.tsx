import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, User, Menu, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useEffect, useState } from "react";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const cartItems = useCart((state) => state.items);
  const [location] = useLocation();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-4 mt-8 font-display">
                  <Link href="/" className="text-lg font-medium">الرئيسية</Link>
                  <Link href="/products" className="text-lg font-medium">المتجر</Link>
                  <Link href="/about" className="text-lg font-medium">عن العلامة</Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin" className="text-lg font-medium text-primary">لوحة التحكم</Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold tracking-tight text-primary">Gen M & Z</span>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/" className={`transition-colors hover:text-primary ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}>الرئيسية</Link>
              <Link href="/products" className={`transition-colors hover:text-primary ${location === '/products' ? 'text-primary' : 'text-muted-foreground'}`}>المتجر</Link>
              {user?.role === 'admin' && (
                 <Link href="/admin" className={`transition-colors hover:text-primary ${location.startsWith('/admin') ? 'text-primary' : 'text-muted-foreground'}`}>لوحة التحكم</Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
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
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>مرحباً, {user.username}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard">
                    <DropdownMenuItem>حسابي</DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4 ml-2" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm" className="hidden md:flex font-bold">
                  تسجيل الدخول
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/40 py-12 mt-24">
        <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="font-display text-2xl font-bold text-primary">Gen M & Z</span>
            <p className="mt-4 text-sm text-muted-foreground">
              الفخامة العصرية للجيل الجديد. تصميم سعودي بأعلى معايير الجودة.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products">المتجر</Link></li>
              <li><Link href="/about">عن العلامة</Link></li>
              <li><Link href="/contact">تواصل معنا</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">المساعدة</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>سياسة الشحن</li>
              <li>سياسة الاسترجاع</li>
              <li>الأسئلة الشائعة</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">تواصل معنا</h3>
            <p className="text-sm text-muted-foreground">الرياض، المملكة العربية السعودية</p>
            <p className="text-sm text-muted-foreground mt-2">info@genmz.sa</p>
          </div>
        </div>
        <div className="container mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © 2024 Gen M & Z. جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}
