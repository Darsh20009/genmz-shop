import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import logoImg from "@assets/Gen_M&Z_LOGO_1766644527859.png";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocation, Link } from "wouter";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const loginSchema = z.object({
  phone: z.string().min(10, "رقم الهاتف مطلوب"),
  password: z.string().optional(),
});

export default function Login() {
  const { login, isLoggingIn, user } = useAuth();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  if (user) {
    setLocation("/");
    return null;
  }

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    // For customers, auto-fill password with phone number
    // For staff/admin, use the entered password
    const password = isStaff ? (data.password || "") : data.phone;
    
    login({ 
      username: data.phone, 
      password: password
    }, {
      onSuccess: (user: any) => {
        // Redirect based on user role
        const redirectPath = user?.redirectTo || "/";
        setLocation(redirectPath);
      },
    });
  };

  const phoneValue = form.watch("phone");
  const checkIsStaff = (val: string) => {
    // Check if phone matches staff/admin/employee roles
    // Will be verified on backend - just show password field conditionally
    const staffNumbers = ["0552469643"];
    setIsStaff(staffNumbers.includes(val) || val.startsWith("staff_"));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
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
                      <div dir="ltr" className="phone-input-container">
                        <PhoneInput
                          country={'sa'}
                          value={field.value}
                          onChange={(phone) => {
                            field.onChange(phone);
                            checkIsStaff(phone);
                          }}
                          containerClass="!w-full !rounded-none"
                          inputClass="!w-full !h-14 !bg-white !border-black/10 !rounded-none !focus:ring-black !text-left"
                          buttonClass="!border-black/10 !rounded-none !bg-white"
                          placeholder="5xxxxxxxx"
                          onlyCountries={['sa', 'ae', 'kw', 'qa', 'bh', 'om', 'eg', 'jo']}
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
            <a href="https://api.whatsapp.com/send/?phone=966501906069" target="_blank" rel="noreferrer" className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors">
              هل تواجه مشكلة؟ تواصل مع الدعم الفني
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
