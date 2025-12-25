import logoImg from "@assets/Gen_M&Z_LOGO_1766644527859.png";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocation, Link } from "wouter";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export default function Login() {
  const { login, isLoggingIn, user } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    setLocation("/");
    return null;
  }

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    login(data, {
      onSuccess: () => setLocation("/"),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/">
             <img src={logoImg} alt="Gen M & Z" className="h-24 w-auto mx-auto mb-6 cursor-pointer object-contain" />
          </Link>
          <p className="text-muted-foreground">سجل دخولك للمتابعة</p>
        </div>

        <div className="bg-white border border-black/5 p-10 rounded-none shadow-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="text-right">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">اسم المستخدم</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} className="h-14 bg-white border-black/10 rounded-none focus-visible:ring-black" />
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
                    <div className="flex justify-between items-center mb-1">
                      <Link href="/forgot-password" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black">نسيت كلمة المرور؟</Link>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">كلمة المرور</FormLabel>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} className="h-14 bg-white border-black/10 rounded-none focus-visible:ring-black" />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

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
