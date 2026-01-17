import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocation, Link } from "wouter";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { useState, useRef } from "react";

export default function Register() {
  const { register, isRegistering, user } = useAuth();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  if (user) {
    // Only redirect if not already at destination
    const destination = "/";
    if (window.location.pathname !== destination) {
      setLocation(destination);
    }
    return null;
  }

  const form = useForm<z.infer<typeof insertUserSchema>>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      password: "",
      name: "",
      phone: "",
      email: "",
      role: "customer"
    },
  });

  const [isPrePopulated, setIsPrePopulated] = useState(false);
  const [employeeData, setEmployeeData] = useState<any>(null);

  // Get returnTo from URL query params
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const returnTo = searchParams.get('returnTo');

  const onSubmit = (data: z.infer<typeof insertUserSchema>) => {
    // Normalize phone to clean format for username
    const cleanPhone = data.phone.replace(/\D/g, "");
    
    console.log(`[REGISTER] Attempting registration for ${cleanPhone}`);
    
    register({
      ...data,
      phone: cleanPhone,
      username: cleanPhone,
      role: employeeData?.role || "customer"
    }, {
      onSuccess: () => {
        console.log("[REGISTER] Success, redirecting to login");
        const loginTarget = returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login";
        setLocation(loginTarget);
      },
      onError: (error) => {
        console.error("[REGISTER] Error:", error);
      }
    });
  };

  const lastCheckedPhoneRef = useRef<string | null>(null);

  const checkPhone = async (phone: string) => {
    if (phone === lastCheckedPhoneRef.current) return;
    lastCheckedPhoneRef.current = phone;
    
    // Normalize phone for API check
    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) cleanPhone = cleanPhone.substring(1);
    
    console.log("Checking phone:", cleanPhone);
    
    if (cleanPhone.length >= 9) {
      try {
        const response = await fetch(`/api/admin/users/by-phone/${cleanPhone}`);
        if (response.ok) {
          const userData = await response.json();
          console.log("Found user data:", userData);
          // If user exists and is not active (or pre-created by admin)
          if (userData.role !== "customer" && !userData.isActive) {
            setEmployeeData(userData);
            form.setValue("name", userData.name || "");
            setIsPrePopulated(true);
            // If the user already has an email in the system, pre-fill it
            if (userData.email) {
              form.setValue("email", userData.email);
            }
          } else {
            setEmployeeData(null);
            setIsPrePopulated(false);
          }
        } else {
          setEmployeeData(null);
          setIsPrePopulated(false);
        }
      } catch (error) {
        console.error("Error checking phone:", error);
      }
    } else {
      setEmployeeData(null);
      setIsPrePopulated(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/">
             <h1 className="font-display text-4xl font-bold text-primary mb-2 cursor-pointer">Gen M & Z</h1>
          </Link>
          <p className="text-muted-foreground">
            {isPrePopulated ? "تأكيد بيانات الموظف" : "أنشئ حسابك الجديد"}
          </p>
        </div>

        <div className="bg-white border border-black/5 p-10 rounded-none shadow-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {isPrePopulated && (
                <div className="bg-green-50 p-4 border border-green-100 mb-6 text-center">
                  <p className="text-green-800 font-bold text-sm">تم العثور على حساب موظف مرتبط بهذا الرقم</p>
                  <p className="text-green-600 text-[10px] mt-1">يرجى تأكيد الاسم وتعيين كلمة المرور لتفعيل الحساب</p>
                </div>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="text-right">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">الاسم الكامل</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="فلان الفلاني" 
                        {...field} 
                        readOnly={isPrePopulated}
                        className={`h-12 bg-white border-black/10 rounded-none focus-visible:ring-black ${isPrePopulated ? 'bg-gray-50' : ''}`} 
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="text-right">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">رقم الجوال</FormLabel>
                    <FormControl>
                      <div dir="ltr" className="flex items-center gap-2 h-12 bg-white border border-black/10 px-4">
                        <span className="text-sm font-bold text-black/40 border-r border-black/10 pr-2">+966</span>
                        <input
                          type="text"
                          className="flex-1 h-full bg-transparent border-none focus:outline-none text-sm font-bold tracking-widest"
                          placeholder="5x xxx xxxx"
                          maxLength={11}
                          value={field.value.replace(/(\d{2})(\d{3})(\d{4})/, "$1 $2 $3").trim()}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            // Normalized internal value - force start with 5, remove leading 0
                            let cleanVal = val;
                            if (cleanVal.startsWith("0")) {
                              cleanVal = cleanVal.substring(1);
                            }
                            
                            // Force start with 5 if not empty
                            if (cleanVal.length > 0 && !cleanVal.startsWith("5")) {
                              cleanVal = "5" + cleanVal.substring(1);
                            }

                            if (cleanVal.length <= 9) {
                              field.onChange(cleanVal);
                              if (cleanVal.length >= 9) {
                                checkPhone(cleanVal);
                              } else {
                                setIsPrePopulated(false);
                              }
                            }
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="text-right">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="example@email.com" {...field} value={field.value || ""} className="h-12 bg-white border-black/10 rounded-none focus-visible:ring-black" />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="text-right">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">كلمة المرور الجديدة</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} className="h-12 bg-white border-black/10 rounded-none focus-visible:ring-black pr-12" />
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

              <Button type="submit" className="w-full h-16 font-bold uppercase tracking-[0.3em] text-xs rounded-none bg-black text-white hover-elevate active-elevate-2 border-none mt-4" disabled={isRegistering}>
                {isRegistering ? <Loader2 className="animate-spin" /> : (isPrePopulated ? "تفعيل الحساب" : "إنشاء الحساب")}
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
                <span className="text-slate-700">التسجيل عبر جوجل</span>
              </Button>
            </form>
          </Form>

          <div className="mt-10 text-center text-[10px] font-bold uppercase tracking-widest text-black/40">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-black hover:underline ml-1">
              سجل دخولك
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
