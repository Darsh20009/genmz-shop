import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { MapPin, User as UserIcon, Plus, Trash2 } from "lucide-react";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
});

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      const res = await apiRequest("PATCH", "/api/user", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "تم التحديث", description: "تم تحديث بيانات الملف الشخصي بنجاح" });
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: async (address: any) => {
      const addresses = [...(user?.addresses || []), { ...address, id: Math.random().toString(36).substr(2, 9) }];
      const res = await apiRequest("PATCH", "/api/user", { addresses });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "تمت الإضافة", description: "تم إضافة العنوان بنجاح" });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      const addresses = user?.addresses.filter((a: any) => a.id !== addressId);
      const res = await apiRequest("PATCH", "/api/user", { addresses });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "تم الحذف", description: "تم حذف العنوان بنجاح" });
    },
  });

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <h1 className="text-3xl font-black mb-8 uppercase tracking-widest">حسابي</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="rounded-none border-black/10 shadow-none">
          <CardHeader className="border-b border-black/5">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              البيانات الشخصية
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-black/40">الاسم الكامل</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-none border-black/10 focus-visible:ring-black h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-black/40">البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-none border-black/10 focus-visible:ring-black h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 block mb-2">رقم الهاتف</span>
                  <div dir="ltr" className="h-12 flex items-center px-3 bg-black/5 text-sm font-bold border border-transparent">
                    +966 {user?.phone}
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-none bg-black text-white hover-elevate active-elevate-2 font-bold uppercase tracking-widest text-xs"
                  disabled={updateProfileMutation.isPending}
                >
                  حفظ التغييرات
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="rounded-none border-black/10 shadow-none">
          <CardHeader className="border-b border-black/5">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              عناوين الشحن
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {user?.addresses.map((address: any) => (
              <div key={address.id} className="p-4 border border-black/10 flex justify-between items-start group">
                <div className="text-right">
                  <p className="font-bold text-sm">{address.name}</p>
                  <p className="text-xs text-black/60 mt-1">{address.city}, {address.street}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity no-default-hover-elevate"
                  onClick={() => deleteAddressMutation.mutate(address.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              variant="outline"
              className="w-full h-12 rounded-none border-dashed border-black/20 hover:border-black transition-colors gap-2 text-[10px] font-bold uppercase tracking-widest"
              onClick={() => {
                const name = prompt("اسم العنوان (مثلاً: المنزل، العمل)");
                const city = prompt("المدينة");
                const street = prompt("الشارع");
                if (name && city && street) {
                  addAddressMutation.mutate({ name, city, street });
                }
              }}
            >
              <Plus className="h-4 w-4" />
              إضافة عنوان جديد
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
