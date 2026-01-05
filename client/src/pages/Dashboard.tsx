import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Loader2, Play, CheckCircle2, Clock, 
  Target, TrendingUp, AlertCircle, Package,
  Pause, CheckCircle, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: activeShift, isLoading: shiftLoading } = useQuery<any>({
    queryKey: ["/api/admin/shifts/active"],
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/orders"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "تم تحديث حالة الطلب" });
    }
  });

  if (statsLoading || shiftLoading || ordersLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const queueOrders = orders?.filter(o => o.status === "new" || o.status === "processing") || [];
  const employeeStats = {
    processedToday: stats?.dailyOrders || 0,
    dailyTarget: 20,
    activeTasks: queueOrders.length,
    efficiency: 85,
  };

  const progress = (employeeStats.processedToday / employeeStats.dailyTarget) * 100;

  return (
    <Layout>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] p-4 sm:p-8 space-y-6" dir="rtl">
        {/* Shift Management Header */}
        <Card className="rounded-[2rem] p-4 border-none shadow-sm bg-white dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full animate-pulse ${activeShift ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <div>
                <h2 className="font-black text-lg">حالة الوردية: {activeShift ? 'مفتوحة' : 'مغلقة'}</h2>
                {activeShift && <p className="text-xs text-muted-foreground font-bold">بدأت في: {new Date(activeShift.openedAt).toLocaleTimeString('ar-SA')}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              {!activeShift ? (
                <Button className="rounded-xl px-6 bg-emerald-600 hover:bg-emerald-700 font-bold" onClick={() => {
                  const balance = prompt("أدخل الرصيد الافتتاحي:");
                  if (balance) {
                    apiRequest("POST", "/api/admin/shifts/open", { openingBalance: balance })
                      .then(() => queryClient.invalidateQueries({ queryKey: ["/api/admin/shifts/active"] }));
                  }
                }}>فتح وردية جديدة</Button>
              ) : (
                <Button variant="destructive" className="rounded-xl px-6 font-bold" onClick={() => {
                  const balance = prompt("أدخل رصيد الإغلاق:");
                  const actual = prompt("أدخل المبلغ الفعلي في الصندوق:");
                  if (balance && actual) {
                    apiRequest("POST", "/api/admin/shifts/close", { closingBalance: balance, actualCash: actual })
                      .then(() => queryClient.invalidateQueries({ queryKey: ["/api/admin/shifts/active"] }));
                  }
                }}>إغلاق الوردية</Button>
              )}
              <Button variant="outline" className="rounded-xl px-6 border-2 font-bold" asChild>
                <Link href="/pos">نظام POS</Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Order Queue Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" />
                طابور تجهيز الطلبات
              </h3>
              <Badge className="bg-primary/10 text-primary border-none px-4 py-1 rounded-full font-bold">
                {queueOrders.length} طلب ينتظر
              </Badge>
            </div>
            
            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {queueOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden hover-elevate transition-all">
                      <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <div className={`p-4 rounded-2xl ${order.status === 'new' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                            {order.status === 'new' ? <Play className="w-6 h-6" /> : <Loader2 className="w-6 h-6 animate-spin" />}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-lg">#{order.orderNumber || order.id.slice(-6).toUpperCase()}</span>
                              <Badge variant="outline" className="rounded-md text-[10px] font-bold">
                                {order.type === 'pos' ? 'كاشير' : 'متجر أونلاين'}
                              </Badge>
                            </div>
                            <p className="text-sm font-bold text-muted-foreground">
                              {order.customerName || 'عميل مجهول'} • {order.items?.length || 0} منتجات
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                          {order.status === 'new' ? (
                            <Button 
                              className="flex-1 md:flex-none rounded-xl bg-primary font-bold h-11 px-8"
                              onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'processing' })}
                              disabled={updateStatusMutation.isPending}
                            >
                              بدء التجهيز
                            </Button>
                          ) : (
                            <Button 
                              className="flex-1 md:flex-none rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold h-11 px-8"
                              onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'completed' })}
                              disabled={updateStatusMutation.isPending}
                            >
                              تم التجهيز
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="rounded-xl h-11 w-11" asChild>
                            <Link href={`/admin/orders/${order.id}`}>
                              <ChevronRight className="w-5 h-5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {queueOrders.length === 0 && (
                <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4 opacity-20" />
                  <p className="font-bold text-muted-foreground">لا توجد طلبات في الانتظار.. عمل رائع!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <Card className="rounded-[2.5rem] p-6 shadow-sm border-none bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between mb-6">
                <CardTitle className="text-xl font-black">هدفي اليومي</CardTitle>
                <Target className="w-8 h-8 text-primary opacity-20" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span>التقدم</span>
                  <span>{employeeStats.processedToday} / {employeeStats.dailyTarget}</span>
                </div>
                <Progress value={progress} className="h-4 rounded-full" />
                <p className="text-xs text-muted-foreground font-bold text-center">
                  أنت على بعد {Math.max(0, employeeStats.dailyTarget - employeeStats.processedToday)} طلبات من هدفك!
                </p>
              </div>
            </Card>

            <Card className="rounded-[2.5rem] p-6 shadow-sm border-none bg-primary text-white">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <p className="font-bold opacity-80">الكفاءة التشغيلية</p>
                <div className="text-4xl font-black">{employeeStats.efficiency}%</div>
              </div>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-rose-50 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                </div>
                <h3 className="text-lg font-black">تنبيهات عاجلة</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100">
                  <p className="text-xs font-bold text-rose-600">نقص مخزون:</p>
                  <p className="font-black text-sm">أكواب ورقية (باقي 5)</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
