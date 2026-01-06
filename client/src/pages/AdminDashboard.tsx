import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { 
  Loader2, DollarSign, ShoppingCart, TrendingUp, Users, Package, 
  CheckCircle2, Zap, Eye, Calendar, Wallet
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";

const COLORS = ['#f39c12', '#00a878', '#ef4444', '#6366f1', '#8b5cf6', '#ec4899'];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
    retry: 2
  });

  useEffect(() => {
    if (statsError && (statsError as any).onboardingRequired) {
      setLocation("/admin/settings?onboarding=true");
    }
  }, [statsError, setLocation]);

  if (authLoading || statsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium animate-pulse">جاري تحميل البيانات...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "employee")) {
    setLocation("/login");
    return null;
  }

  const currentDate = new Date();
  const dayName = currentDate.toLocaleDateString('ar-SA', { weekday: 'long' });
  const formattedDate = currentDate.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' });

  const displayStats = {
    allTime: { totalRevenue: stats?.allTime?.totalRevenue || 0 },
    today: { totalRevenue: stats?.today?.totalRevenue || 0 },
    thisMonth: { totalRevenue: stats?.thisMonth?.totalRevenue || 0 },
    totalOrders: stats?.totalOrders || 0,
    dailyOrders: stats?.dailyOrders || 0,
    netProfit: stats?.netProfit || 0,
    totalSales: stats?.totalSales || 0,
    totalCustomers: stats?.totalCustomers || 0,
    completedOrders: stats?.completedOrders || 0,
    processingOrders: stats?.processingOrders || 0,
    cancelledOrders: stats?.cancelledOrders || 0,
    pendingPayments: stats?.pendingPayments || 0,
    recentOrders: stats?.recentOrders || [],
    topProducts: stats?.topProducts || []
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] p-3 sm:p-6 lg:p-8 space-y-6" dir="rtl">
        {displayStats.pendingPayments > 0 && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-amber-50 border-2 border-amber-200 p-4 rounded-[1.5rem] flex items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-amber-900 text-sm">تنبيه: مراجعة دفع معلقة</h4>
                <p className="text-amber-700 text-xs font-bold">يوجد {displayStats.pendingPayments} طلبات بانتظار تأكيد التحويل البنكي</p>
              </div>
            </div>
            <Button 
              size="sm" 
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs"
              onClick={() => setLocation("/admin/orders?status=bank_transfer_pending")}
            >
              عرض الطلبات
            </Button>
          </motion.div>
        )}
        {/* Top Header */}
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="text-center sm:text-right">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              مرحباً، <span className="text-primary">{user?.name}</span>
            </h1>
            <p className="text-muted-foreground text-xs font-bold mt-1">
              {dayName}، {formattedDate}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="flex-1 sm:flex-none rounded-full px-6 h-12 gap-2 border-2 hover:bg-slate-50 transition-all font-bold"
              onClick={() => window.open('/', '_blank')}
            >
              <Eye className="w-4 h-4" />
              عرض المتجر
            </Button>
            <Button 
              className="flex-1 sm:flex-none rounded-full px-6 h-12 gap-2 bg-[#00a878] hover:bg-[#008f65] border-none shadow-lg shadow-emerald-100 font-bold text-white"
              onClick={() => setLocation('/admin/reports')}
            >
              <Zap className="w-4 h-4 fill-white" />
              تقرير سريع
            </Button>
          </div>
        </motion.div>

        {/* Sales Card - Main Focus */}
        <motion.div variants={item} initial="hidden" animate="show">
          <Card className="border-none shadow-xl bg-[#435ebe] text-white rounded-[2.5rem] p-6 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <DollarSign className="w-48 h-48" />
            </div>
            <div className="relative z-10 flex flex-col items-center text-center space-y-2">
              <div className="flex items-center gap-2 opacity-80 font-bold text-sm">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Wallet className="w-4 h-4" />
                </div>
                إجمالي المبيعات (الكل)
              </div>
              <div className="text-4xl sm:text-5xl font-black">
                {displayStats.allTime.totalRevenue.toLocaleString()} 
                <span className="text-lg font-medium mr-2 opacity-70">ر.س</span>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-4">
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
                  <p className="text-[10px] uppercase tracking-wider opacity-60 font-bold">اليوم</p>
                  <p className="text-lg font-black">{displayStats.today.totalRevenue.toLocaleString()} <span className="text-[10px] opacity-60">ر.س</span></p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
                  <p className="text-[10px] uppercase tracking-wider opacity-60 font-bold">الشهر</p>
                  <p className="text-lg font-black">{displayStats.thisMonth.totalRevenue.toLocaleString()} <span className="text-[10px] opacity-60">ر.س</span></p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 shadow-sm border-none bg-white dark:bg-slate-900 flex flex-col items-center text-center space-y-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-bold">إجمالي الطلبات</p>
            <div className="text-3xl sm:text-4xl font-black">{displayStats.totalOrders}</div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs text-muted-foreground">مكتمل اليوم:</span>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 rounded-lg font-black text-[10px] sm:text-xs">{displayStats.dailyOrders}</Badge>
            </div>
          </Card>

          <Card className="rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 shadow-sm border-none bg-white dark:bg-slate-900 flex flex-col items-center text-center space-y-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-bold">صافي الأرباح</p>
            <div className="text-2xl sm:text-3xl font-black text-amber-600">
              {displayStats.netProfit.toLocaleString()}
              <span className="text-xs font-medium mr-1">ر.س</span>
            </div>
            <div className="w-full space-y-1">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[67%]" />
              </div>
              <p className="text-[10px] font-bold text-slate-400">67% من إجمالي المبيعات</p>
            </div>
          </Card>

          <Card className="rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 shadow-sm border-none bg-white dark:bg-slate-900 flex flex-col items-center text-center space-y-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-bold">قاعدة العملاء</p>
            <div className="text-3xl sm:text-4xl font-black">{displayStats.totalCustomers}</div>
            <div className="flex -space-x-2 space-x-reverse">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white bg-slate-200" />
              ))}
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white bg-primary flex items-center justify-center text-[8px] sm:text-[10px] text-white font-bold">
                +18
              </div>
            </div>
          </Card>
        </div>

        {/* Chart Section */}
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black">نمو المبيعات</h3>
              <p className="text-muted-foreground text-xs font-bold">أداء الإيرادات خلال الأسبوع</p>
            </div>
            <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl">
              <Button size="sm" variant="ghost" className="rounded-xl px-4 font-bold text-xs h-8">يومي</Button>
              <Button size="sm" className="rounded-xl px-4 font-bold text-xs h-8 shadow-sm">شهري</Button>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: 'السبت', revenue: 4000 },
                { name: 'الأحد', revenue: 3000 },
                { name: 'الأثنين', revenue: 2000 },
                { name: 'الثلاثاء', revenue: 2780 },
                { name: 'الأربعاء', revenue: 1890 },
                { name: 'الخميس', revenue: 2390 },
                { name: 'الجمعة', revenue: 3500 },
              ]}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#435ebe" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#435ebe" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#435ebe" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Status Breakdown */}
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-6">
          <h3 className="text-xl font-black text-center mb-1">توزيع الحالات</h3>
          <p className="text-muted-foreground text-xs font-bold text-center mb-6">نظرة عامة على الطلبات</p>
          <div className="flex flex-col items-center">
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={[
                      { name: 'مكتمل', value: 25 },
                      { name: 'معالجة', value: 0 },
                      { name: 'ملغي', value: 0 }
                    ]}
                    cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="value"
                  >
                    <Cell fill="#f39c12" />
                    <Cell fill="#00a878" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-800">25</span>
                <span className="text-[10px] font-bold text-muted-foreground">إجمالي</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-8 mt-6 w-full max-w-xs">
              <div className="text-center">
                <div className="text-xl font-black text-[#f39c12]">25</div>
                <div className="text-[10px] font-bold text-muted-foreground">مكتمل</div>
              </div>
              <div className="text-center opacity-30">
                <div className="text-xl font-black">0</div>
                <div className="text-[10px] font-bold text-muted-foreground">معالجة</div>
              </div>
              <div className="text-center opacity-30">
                <div className="text-xl font-black">0</div>
                <div className="text-[10px] font-bold text-muted-foreground">ملغي</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Bottom Section: Recent Orders & Top Products */}
        <div className="space-y-6">
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-slate-50">
              <h3 className="text-xl font-black">آخر الطلبات</h3>
              <Button variant="ghost" className="text-primary font-bold text-sm h-8" asChild>
                <Link href="/admin/orders">عرض الكل</Link>
              </Button>
            </div>
            <div className="p-4 space-y-4">
              {displayStats.recentOrders.map((order: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-3xl transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-white transition-colors">
                      <ShoppingCart className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-primary">#{order.id}</p>
                      <p className="text-[10px] font-bold text-muted-foreground">عميل عام • {new Date(order.createdAt).toLocaleDateString('ar-SA')}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-sm">{order.total} ر.س</p>
                    <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg text-[9px] font-black h-5 px-2">مكتمل</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-6">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              الأكثر مبيعاً
            </h3>
            <div className="space-y-6">
              {displayStats.topProducts.map((product: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 group">
                  <div className="relative">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-16 h-16 rounded-[1.5rem] object-cover shadow-sm group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-primary text-white text-xs font-black rounded-full flex items-center justify-center border-4 border-white">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-slate-900 text-sm">{product.name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground">{product.quantity} عملية بيع</p>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-emerald-600 text-base">{product.revenue.toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-muted-foreground opacity-60">ر.س</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full rounded-2xl h-12 mt-4 border-2 font-bold text-slate-500" asChild>
                <Link href="/admin/products">عرض كل المنتجات</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
