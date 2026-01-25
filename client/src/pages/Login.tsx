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

        <div className="login-card bg-white border border-black/5 p-10 rounded-none shadow-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="text-right">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/40">رقم الهاتف</FormLabel>
                    <FormControl>
                      <div dir="ltr" className="flex items-center gap-2 h-14 bg-white dark:bg-slate-900 border border-black/10 dark:border-slate-800 px-4">
                        <span className="text-sm font-bold text-black/40 dark:text-white/40 border-r border-black/10 dark:border-slate-800 pr-2">+966</span>
                          <input
                            type="text"
                            className="flex-1 h-full bg-transparent border-none focus:outline-none text-sm font-bold tracking-widest text-black dark:text-white"
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
                        <Link href="/forgot-password" className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white">نسيت كلمة المرور؟</Link>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/40">كلمة المرور</FormLabel>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} className="h-14 bg-white dark:bg-slate-900 border-black/10 dark:border-slate-800 rounded-none focus-visible:ring-black dark:focus-visible:ring-primary pr-12 text-black dark:text-white" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white no-default-hover-elevate"
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

              <Button type="submit" className="w-full h-16 font-bold uppercase tracking-[0.3em] text-xs rounded-none bg-black dark:bg-primary text-white dark:text-primary-foreground hover-elevate active-elevate-2 border-none" disabled={isLoggingIn}>
                {isLoggingIn ? <Loader2 className="animate-spin" /> : "تسجيل الدخول"}
              </Button>
            </form>
          </Form>

          <div className="mt-10 text-center text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="text-black dark:text-white hover:underline ml-1">
              أنشئ حساب جديد
            </Link>
          </div>
          
          <div className="mt-6">
            <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white flex items-center justify-center gap-2">
              <span>العودة للرئيسية</span>
            </Link>
          </div>
          <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5 text-center">
            <a href="https://api.whatsapp.com/send/?phone=966501906069" target="_blank" rel="noreferrer" className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors">
              هل تواجه مشكلة؟ تواصل مع الدعم الفني
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
