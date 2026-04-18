import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Gift, Trophy, Star, Users, Coins, Settings, ArrowUpRight, TrendingUp, Sparkles, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function AdminLoyalty() {
  const { toast } = useToast();
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adjustPoints, setAdjustPoints] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustType, setAdjustType] = useState<"bonus" | "adjustment">("adjustment");

  const { data: rules, isLoading: rulesLoading } = useQuery({
    queryKey: ["/api/loyalty/rules"],
    queryFn: async () => {
      const res = await fetch("/api/loyalty/rules");
      return res.json();
    }
  });

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["/api/admin/customers"],
    queryFn: async () => {
      const res = await fetch("/api/admin/customers", { credentials: "include" });
      return res.json();
    }
  });

  const adjustMutation = useMutation({
    mutationFn: async ({ userId, points, description, type }: any) => {
      const endpoint = type === "bonus" ? "/api/admin/loyalty/bonus" : "/api/admin/loyalty/adjust";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, points: parseInt(points), description, type })
      });
      if (!res.ok) throw new Error("Failed to adjust points");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "تم تعديل النقاط بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customers"] });
      setShowAdjustDialog(false);
      setAdjustPoints("");
      setAdjustReason("");
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    }
  });

  const tierColors: Record<string, string> = {
    bronze: "from-orange-400 to-orange-600 shadow-orange-200 text-white",
    silver: "from-slate-300 to-slate-500 shadow-slate-200 text-white",
    gold: "from-amber-400 to-amber-600 shadow-amber-200 text-white",
    platinum: "from-indigo-400 to-indigo-600 shadow-indigo-200 text-white"
  };

  const tierNames: Record<string, string> = {
    bronze: "برونزي",
    silver: "فضي",
    gold: "ذهبي",
    platinum: "بلاتيني"
  };

  if (rulesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse font-bold">جاري تحميل برنامج الولاء...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-4 lg:p-8 space-y-8" dir="rtl">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border shadow-sm"
        >
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <Gift className="w-8 h-8" />
              </div>
              برنامج الولاء
            </h1>
            <p className="text-muted-foreground font-medium pr-14">إدارة نقاط المكافآت ومستويات العضوية والعملاء</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/30 px-6 py-3 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-black">
              <Sparkles className="w-5 h-5" />
              نشط الآن
            </div>
          </div>
        </motion.div>

        {/* Loyalty Rules Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] hover-elevate overflow-hidden group">
              <div className="h-2 w-full bg-indigo-500/10 group-hover:bg-indigo-500 transition-colors" />
              <CardContent className="p-8">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-500 w-fit mb-4 group-hover:rotate-12 transition-transform">
                  <Coins className="w-6 h-6" />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">نقاط لكل ريال</p>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white">{rules?.pointsPerSAR || 1}</h2>
                <p className="text-xs font-bold text-slate-400 mt-2">نقطة مقابل كل ريال إنفاق</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] hover-elevate overflow-hidden group">
              <div className="h-2 w-full bg-amber-500/10 group-hover:bg-amber-500 transition-colors" />
              <CardContent className="p-8">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-2xl text-amber-500 w-fit mb-4 group-hover:rotate-12 transition-transform">
                  <Star className="w-6 h-6" />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">قيمة الاستبدال</p>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white">{rules?.SARPerPoint || 0.1} <span className="text-xl">ر.س</span></h2>
                <p className="text-xs font-bold text-slate-400 mt-2">القيمة النقدية لكل نقطة</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] hover-elevate overflow-hidden group">
              <div className="h-2 w-full bg-emerald-500/10 group-hover:bg-emerald-500 transition-colors" />
              <CardContent className="p-8">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-500 w-fit mb-4 group-hover:rotate-12 transition-transform">
                  <Trophy className="w-6 h-6" />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">الحد الأدنى</p>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white">{rules?.minRedeemPoints || 100}</h2>
                <p className="text-xs font-bold text-slate-400 mt-2">أقل عدد نقاط للاستبدال</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] hover-elevate overflow-hidden group">
              <div className="h-2 w-full bg-rose-500/10 group-hover:bg-rose-500 transition-colors" />
              <CardContent className="p-8">
                <div className="p-3 bg-rose-50 dark:bg-rose-900/30 rounded-2xl text-rose-500 w-fit mb-4 group-hover:rotate-12 transition-transform">
                  <Settings className="w-6 h-6" />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">الصلاحية</p>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white">{rules?.expiryMonths || 12} <span className="text-xl">شهر</span></h2>
                <p className="text-xs font-bold text-slate-400 mt-2">مدة انتهاء صلاحية النقاط</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Membership Tiers */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[3rem] p-4">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-2xl font-black">مستويات العضوية</CardTitle>
              <CardDescription className="font-bold">المزايا والحوافز الخاصة بكل مستوى</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {rules?.tiers && Object.entries(rules.tiers).map(([key, tier]: [string, any]) => (
                  <div key={key} className={`p-8 rounded-[2.5rem] bg-gradient-to-br shadow-xl ${tierColors[key]} group hover:scale-105 transition-transform duration-500`}>
                    <div className="text-2xl font-black mb-6 flex items-center justify-between">
                      {tier.name || tierNames[key]}
                      <ArrowUpRight className="w-6 h-6 opacity-40 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase opacity-60">الحد الأدنى للإنفاق</span>
                        <span className="text-xl font-black">{tier.minSpent.toLocaleString()} ر.س</span>
                      </div>
                      <div className="flex items-center justify-between bg-white/10 p-3 rounded-2xl">
                        <span className="text-xs font-bold">مضاعف النقاط</span>
                        <span className="font-black">x{tier.pointsMultiplier}</span>
                      </div>
                      <div className="flex items-center justify-between bg-white/10 p-3 rounded-2xl">
                        <span className="text-xs font-bold">خصم دائم</span>
                        <span className="font-black">{tier.discountPercent}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Customers Table */}
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[3rem] p-4">
          <CardHeader className="p-8">
            <CardTitle className="flex items-center gap-4 text-2xl font-black">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <Users className="h-6 w-6" />
              </div>
              قائمة العملاء والنقاط
            </CardTitle>
            <CardDescription className="font-bold pr-14">إدارة ومتابعة أرصدة نقاط الولاء لعملائك</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            {customersLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto rounded-[2rem] border border-slate-50 dark:border-slate-800 shadow-inner bg-slate-50/30 dark:bg-slate-800/20">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="text-right p-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">العميل</th>
                      <th className="text-right p-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">المستوى</th>
                      <th className="text-right p-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">النقاط</th>
                      <th className="text-right p-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">إجمالي الإنفاق</th>
                      <th className="text-center p-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(customers || []).filter((c: any) => c.role === "customer").map((customer: any) => (
                      <tr key={customer._id || customer.id} className="group hover:bg-white dark:hover:bg-slate-800 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center font-black text-slate-500">
                              {customer.name?.charAt(0) || <UserIcon className="w-5 h-5" />}
                            </div>
                            <div>
                              <div className="font-black text-slate-900 dark:text-white">{customer.name || "عميل بدون اسم"}</div>
                              <div className="text-xs font-bold text-slate-400" dir="ltr">{customer.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <Badge className={`rounded-xl px-4 py-1.5 font-black text-[10px] bg-gradient-to-br border-none shadow-sm ${tierColors[customer.loyaltyTier || "bronze"]}`}>
                            {tierNames[customer.loyaltyTier || "bronze"]}
                          </Badge>
                        </td>
                        <td className="p-6 font-black text-xl text-primary">{(customer.loyaltyPoints || 0).toLocaleString()}</td>
                        <td className="p-6 font-black">{(customer.totalSpent || 0).toLocaleString()} <span className="text-xs text-slate-400">ر.س</span></td>
                        <td className="p-6 text-center">
                          <Button
                            variant="ghost"
                            className="rounded-xl h-12 px-6 font-black bg-slate-50 dark:bg-slate-700 hover:bg-primary hover:text-white transition-all shadow-sm"
                            onClick={() => {
                              setSelectedUser(customer);
                              setShowAdjustDialog(true);
                            }}
                          >
                            تعديل الرصيد
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Adjust Points Dialog */}
      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent dir="rtl" className="rounded-[3rem] border-none shadow-2xl p-10 max-w-lg bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-right mb-6">تعديل رصيد النقاط</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-6 rounded-[2rem]">
              <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <div className="font-black text-xl">{selectedUser?.name || selectedUser?.phone}</div>
                <div className="text-sm font-bold text-slate-400">الرصيد الحالي: <span className="text-primary">{selectedUser?.loyaltyPoints || 0} نقطة</span></div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-black text-sm pr-2 text-slate-500">نوع التعديل</Label>
              <Select value={adjustType} onValueChange={(v: any) => setAdjustType(v)}>
                <SelectTrigger className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-xl">
                  <SelectItem value="adjustment">تعديل يدوي (إضافة/خصم)</SelectItem>
                  <SelectItem value="bonus">مكافأة خاصة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-black text-sm pr-2 text-slate-500">عدد النقاط {adjustType === "adjustment" ? "(استخدم علامة - للخصم)" : ""}</Label>
              <Input
                type="number"
                value={adjustPoints}
                onChange={(e) => setAdjustPoints(e.target.value)}
                placeholder="مثال: 100 أو -50"
                className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-black text-sm pr-2 text-slate-500">سبب التعديل</Label>
              <Textarea
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="يرجى كتابة سبب التعديل للرجوع إليه لاحقاً في سجل العمليات..."
                className="rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-none p-6 font-bold min-h-[120px] focus-visible:ring-primary/20"
              />
            </div>
          </div>
          <DialogFooter className="flex-row-reverse gap-3 mt-6">
            <Button variant="ghost" className="h-14 rounded-2xl flex-1 font-black" onClick={() => setShowAdjustDialog(false)}>
              إلغاء
            </Button>
            <Button
              className="h-14 rounded-2xl flex-1 font-black bg-primary shadow-lg shadow-primary/20"
              onClick={() => {
                if (!adjustPoints || !adjustReason) {
                  toast({ title: "تنبيه", description: "يرجى تعبئة جميع الحقول المطلوبة", variant: "destructive" });
                  return;
                }
                adjustMutation.mutate({
                  userId: selectedUser?._id || selectedUser?.id,
                  points: adjustPoints,
                  description: adjustReason,
                  type: adjustType
                });
              }}
              disabled={adjustMutation.isPending}
            >
              {adjustMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "تأكيد التعديل"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
