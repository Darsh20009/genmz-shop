import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, CheckCircle2 } from "lucide-react";
import logoImg from "@assets/Gen_M&Z_LOGO_1766644527859.png";

const forgotPasswordSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  phone: z.string().min(10, "رقم الجوال يجب أن يكون 10 أرقام على الأقل"),
});

export default function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      username: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/">
             <img src={logoImg} alt="Gen M & Z" className="h-24 w-auto mx-auto mb-6 cursor-pointer object-contain" />
          </Link>
          <h2 className="text-2xl font-black uppercase tracking-tighter">استعادة كلمة المرور</h2>
          <p className="text-muted-foreground mt-2">أدخل بياناتك للتحقق من هويتك</p>
        </div>

        <div className="bg-white border border-black/5 p-10 rounded-none shadow-2xl">
          {isSuccess ? (
            <div className="text-center space-y-6 py-4">
              <CheckCircle2 className="h-16 w-16 text-black mx-auto" />
              <div className="space-y-2">
                <h3 className="font-bold text-xl uppercase tracking-tight">تم إرسال طلبك بنجاح</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-black/40 leading-relaxed">
                  سيتواصل معك فريق الدعم الفني عبر البريد الإلكتروني أو الواتساب خلال ٢٤ ساعة لإعادة تعيين كلمة مرورك.
                </p>
              </div>
              <Link href="/login">
                <Button className="w-full h-16 font-bold uppercase tracking-[0.3em] text-xs rounded-none bg-black text-white hover-elevate active-elevate-2 border-none">
                  العودة لتسجيل الدخول
                </Button>
              </Link>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">رقم الجوال المسجل</FormLabel>
                      <FormControl>
                        <Input placeholder="05xxxxxxxx" {...field} className="h-12 bg-white border-black/10 rounded-none focus-visible:ring-black" />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-16 font-bold uppercase tracking-[0.3em] text-xs rounded-none bg-black text-white hover-elevate active-elevate-2 border-none mt-4" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "إرسال طلب التحقق"}
                </Button>
              </form>
            </Form>
          )}

          <div className="mt-10 text-center text-[10px] font-bold uppercase tracking-widest text-black/40">
            تذكرت كلمة المرور؟{" "}
            <Link href="/login" className="text-black hover:underline ml-1">
              سجل دخولك
            </Link>
          </div>
          
          <div className="mt-8 pt-8 border-t border-black/5 text-center">
            <a href="https://api.whatsapp.com/send/?phone=966501906069" target="_blank" rel="noreferrer" className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors">
              دعم فني مباشر عبر الواتساب
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
