import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocation, Link } from "wouter";
import { Loader2 } from "lucide-react";
import { z } from "zod";

export default function Register() {
  const { register, isRegistering, user } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    setLocation("/");
    return null;
  }

  const form = useForm<z.infer<typeof insertUserSchema>>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      phone: "",
      role: "customer"
    },
  });

  const onSubmit = (data: z.infer<typeof insertUserSchema>) => {
    register(data, {
      onSuccess: () => setLocation("/login"),
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
                name="username"
                render={({ field }) => (
                  <FormItem className="text-right">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">اسم المستخدم</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} className="h-12 bg-white border-black/10 rounded-none focus-visible:ring-black" />
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
                      <Input type="email" placeholder="email@example.com" {...field} className="h-12 bg-white border-black/10 rounded-none focus-visible:ring-black" />
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
                      <Input placeholder="05xxxxxxxx" {...field} value={field.value || ""} className="h-12 bg-white border-black/10 rounded-none focus-visible:ring-black" />
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
                      <Input type="password" placeholder="••••••••" {...field} className="h-12 bg-white border-black/10 rounded-none focus-visible:ring-black" />
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
