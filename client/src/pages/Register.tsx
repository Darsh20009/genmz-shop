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
import { useState } from "react";

export default function Register() {
  const { register, isRegistering, user } = useAuth();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  if (user) {
    setLocation("/");
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

  const onSubmit = (data: z.infer<typeof insertUserSchema>) => {
    register({
      ...data,
      username: data.phone,
      role: "customer"
    }, {
      onSuccess: () => setLocation("/"),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/">
             <h1 className="font-display text-4xl font-bold text-primary mb-2 cursor-pointer">Gen M & Z</h1>
          </Link>
          <p className="text-muted-foreground">أنشئ حسابك الجديد</p>
        </div>

        <div className="bg-white border border-black/5 p-10 rounded-none shadow-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="text-right">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">الاسم الكامل</FormLabel>
                    <FormControl>
                      <Input placeholder="فلان الفلاني" {...field} className="h-12 bg-white border-black/10 rounded-none focus-visible:ring-black" />
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
                            if (val.length <= 9 && (val.length === 0 || val.startsWith("5"))) {
                              field.onChange(val);
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
                    <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">كلمة المرور</FormLabel>
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
                {isRegistering ? <Loader2 className="animate-spin" /> : "إنشاء الحساب"}
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
