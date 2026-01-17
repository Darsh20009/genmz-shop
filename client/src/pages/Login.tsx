import { SEO } from "@/components/SEO";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import logoImg from "@assets/logo.png";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link, Redirect } from "wouter";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";

  const loginSchema = z.object({
  phone: z.string().min(9, "رقم الهاتف يجب أن يتكون من 9 أرقام"),
  password: z.string().optional(),
});

export default function Login() {
  const { login, isLoggingIn, user } = useAuth();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  
  // Get returnTo from URL query params
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const returnTo = searchParams.get('returnTo');

  // Initialize form early to avoid hook order issues
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    // For customers, we use entered password or fallback to phone
    // Ensure we use the clean phone number as the fallback password
    const cleanPhone = data.phone.replace(/\D/g, "");
    
    // Normalize phone number to match how it might be stored
    let normalizedPhone = cleanPhone;
    if (normalizedPhone.startsWith("966")) {
      normalizedPhone = normalizedPhone.substring(3);
    }
    if (normalizedPhone.startsWith("0")) {
      normalizedPhone = normalizedPhone.substring(1);
    }
    
    const password = data.password || normalizedPhone;
    
    console.log(`[LOGIN] Attempting login for ${normalizedPhone}, isStaff: ${isStaff}`);
    
    try {
      await login({ 
        username: normalizedPhone, 
        password: password
      }, {
        onSuccess: (userData: any) => {
          // Check for explicit returnTo parameter first
          if (returnTo) {
            setLocation(returnTo);
            return;
          }
          
          // Check if there are items in the guest cart
          const cartStorage = localStorage.getItem('cart-storage');
          let hasCartItems = false;
          if (cartStorage) {
            try {
              const cartData = JSON.parse(cartStorage);
              hasCartItems = cartData.state?.items && cartData.state.items.length > 0;
            } catch (e) {}
          }
          
          // Use userData.redirectTo if provided by server, otherwise logic based on role
          let target = "/";
          if (hasCartItems) {
            target = "/cart";
          } else if (userData?.redirectTo) {
            target = userData.redirectTo;
          } else if (userData?.role === "admin" || userData?.role === "employee") {
            target = "/admin";
          }
          
          console.log(`[LOGIN] Success, redirecting to: ${target}`);
          setLocation(target);
        },
      });
    } catch (error) {
      console.error("[LOGIN] Submission error:", error);
    }
  };

  const phoneValue = form.watch("phone");
  const lastCheckedPhoneRef = useRef<string | null>(null);
  const isCheckingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user && !returnTo) {
      const targetPath = (user.role === "admin" || user.role === "employee") ? "/admin" : "/";
      if (window.location.pathname !== targetPath) {
        setLocation(targetPath);
      }
    } else if (user && returnTo) {
      setLocation(returnTo);
    }
  }, [user?.id, setLocation, returnTo]);

  // Effect to check staff status whenever phone changes (with debounce protection)
  useEffect(() => {
    const val = phoneValue.replace(/\D/g, "");
    
    // Normalize phone number
    let normalizedPhone = val;
    if (normalizedPhone.startsWith("966")) {
      normalizedPhone = normalizedPhone.substring(3);
    }
    if (normalizedPhone.startsWith("0")) {
      normalizedPhone = normalizedPhone.substring(1);
    }
    
    // Clear any pending timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Skip if same phone was already checked or currently checking
    if (lastCheckedPhoneRef.current === normalizedPhone || isCheckingRef.current) {
      return;
    }
    
    // Only check when we have a valid 9-digit phone
    if (normalizedPhone.length !== 9) {
      setIsStaff(false);
      lastCheckedPhoneRef.current = null;
      return;
    }
    
    // Debounce the check by 500ms
    debounceTimerRef.current = setTimeout(async () => {
      isCheckingRef.current = true;
      try {
        console.log(`[LOGIN] Checking staff status for: ${normalizedPhone}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(`/api/admin/users/by-phone/${normalizedPhone}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (response.ok) {
          const userData = await response.json();
          const staffStatus = !!(userData && userData.role && userData.role !== "customer");
          setIsStaff(staffStatus);
          console.log(`[LOGIN] User found: ${userData.role}, isStaff set to: ${staffStatus}`);
        } else {
          setIsStaff(false);
        }
        lastCheckedPhoneRef.current = normalizedPhone;
      } catch (error) {
        console.error("[LOGIN] Staff check error:", error);
        setIsStaff(false);
      } finally {
        isCheckingRef.current = false;
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [phoneValue]);

  // Early return after all hooks are defined
  if (user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <SEO title="تسجيل الدخول" />
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/">
             <img src={logoImg} alt="Gen M & Z" className="h-24 w-auto mx-auto mb-6 cursor-pointer object-contain" />
          </Link>
          <p className="text-muted-foreground">سجل دخولك برقم الهاتف للمتابعة</p>
        </div>

        <div className="bg-white border border-black/5 p-10 rounded-none shadow-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="text-right">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">رقم الهاتف</FormLabel>
                    <FormControl>
                      <div dir="ltr" className="flex items-center gap-2 h-14 bg-white border border-black/10 px-4">
                        <span className="text-sm font-bold text-black/40 border-r border-black/10 pr-2">+966</span>
                          <input
                            type="text"
                            className="flex-1 h-full bg-transparent border-none focus:outline-none text-sm font-bold tracking-widest"
                            placeholder="5x xxx xxxx"
                            maxLength={11}
                            value={field.value.replace(/(\d{2})(\d{3})(\d{4})/, "$1 $2 $3").trim()}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              let cleanVal = val;
                              if (cleanVal.startsWith("966")) {
                                cleanVal = cleanVal.substring(3);
                              }
                              if (cleanVal.startsWith("0")) {
                                cleanVal = cleanVal.substring(1);
                              }
                              if (cleanVal.length <= 9) {
                                field.onChange(cleanVal);
                              }
                            }}
                          />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              
              {isStaff && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <div className="flex justify-between items-center mb-1">
                        <Link href="/forgot-password" className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black">نسيت كلمة المرور؟</Link>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">كلمة المرور</FormLabel>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} className="h-14 bg-white border-black/10 rounded-none focus-visible:ring-black pr-12" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 text-black/40 hover:text-black no-default-hover-elevate"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit" className="w-full h-16 font-bold uppercase tracking-[0.3em] text-xs rounded-none bg-black text-white hover-elevate active-elevate-2 border-none" disabled={isLoggingIn}>
                {isLoggingIn ? <Loader2 className="animate-spin" /> : "تسجيل الدخول"}
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/5"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="bg-white px-4 text-black/40">أو</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-14 font-bold uppercase tracking-[0.1em] text-xs rounded-lg border-slate-200 hover:bg-slate-50 transition-all duration-200 flex items-center justify-center gap-3 shadow-sm"
                onClick={() => window.location.href = "/api/auth/google"}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-5.38z"
                  />
                </svg>
                <span className="text-slate-700">الدخول عبر جوجل</span>
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/5"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="bg-white px-4 text-black/40">أو</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-16 font-bold uppercase tracking-[0.3em] text-xs rounded-none border-black/10 hover-elevate active-elevate-2"
                onClick={() => window.location.href = "/api/auth/google"}
              >
                <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-5.38z"
                  />
                </svg>
                الدخول عبر جوجل
              </Button>
            </form>
          </Form>

          <div className="mt-10 text-center text-[10px] font-bold uppercase tracking-widest text-black/40">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="text-black hover:underline ml-1">
              أنشئ حساب جديد
            </Link>
          </div>
          
          <div className="mt-6">
            <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black flex items-center justify-center gap-2">
              <span>العودة للرئيسية</span>
            </Link>
          </div>
          <div className="mt-8 pt-8 border-t border-black/5 text-center">
            <a href="https://api.whatsapp.com/send/?phone=966567326086" target="_blank" rel="noreferrer" className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors">
              هل تواجه مشكلة؟ تواصل مع الدعم الفني
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
