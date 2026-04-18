import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Loader2, TrendingUp, Users, ShoppingCart, Package, DollarSign, BarChart3, Calendar } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RePieChart, Pie, Cell } from 'recharts';
import { motion } from "framer-motion";

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminAnalytics() {
  const { data: overview, isLoading: overviewLoading } = useQuery<any>({
    queryKey: ["/api/admin/analytics/overview"],
  });

  const { data: timeSeries } = useQuery<any[]>({
    queryKey: ["/api/admin/analytics/time-series"],
  });

  const { data: topProducts } = useQuery<any[]>({
    queryKey: ["/api/admin/analytics/top-products"],
  });

  const { data: orderStatus } = useQuery<any[]>({
    queryKey: ["/api/admin/analytics/order-status"],
  });

  const { data: inventory } = useQuery<any>({
    queryKey: ["/api/admin/analytics/inventory"],
  });

  if (overviewLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse font-bold">جاري تحليل البيانات...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const formatCurrency = (value: number) => `${(value || 0).toLocaleString()} ر.س`;

  return (
    <Layout>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-4 lg:p-8 space-y-8" dir="rtl">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border shadow-sm"
        >
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-inner">
                <BarChart3 className="w-8 h-8" />
              </div>
              لوحة التحليلات الذكية
            </h1>
            <p className="text-muted-foreground font-medium pr-14 italic">تحليل مباشر لمؤشرات الأداء والنمو</p>
          </div>
          <div className="bg-slate-100/50 dark:bg-slate-800/50 px-6 py-3 rounded-2xl flex items-center gap-3 text-slate-600 dark:text-slate-300 font-black border shadow-sm">
            <div className="relative">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            تحديث مباشر
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[3rem] hover-elevate overflow-hidden group h-full">
              <div className="h-2 w-full bg-indigo-500/10 group-hover:bg-indigo-500 transition-colors" />
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-500 group-hover:rotate-12 transition-transform shadow-sm">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg font-black text-xs shadow-sm">+12%</Badge>
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي المبيعات</p>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white break-words tracking-tighter">{formatCurrency(overview?.allTime?.totalRevenue || 0)}</h2>
                <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center gap-3 text-xs font-bold text-slate-400">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  مبيعات اليوم: <span className="text-slate-900 dark:text-white">{formatCurrency(overview?.today?.totalRevenue || 0)}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] hover-elevate overflow-hidden group h-full">
              <div className="h-1.5 md:h-2 w-full bg-emerald-500/10 group-hover:bg-emerald-500 transition-colors" />
              <CardContent className="p-4 md:p-8">
                <div className="flex justify-between items-start mb-2 md:mb-4">
                  <div className="p-2 md:p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-500 group-hover:rotate-12 transition-transform">
                    <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none rounded-lg text-[10px] md:text-xs">نشط</Badge>
                </div>
                <p className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي الطلبات</p>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white break-words">{overview?.allTime?.totalOrders || 0}</h2>
                <div className="mt-2 md:mt-4 pt-2 md:pt-4 border-t border-slate-50 dark:border-slate-800 text-[10px] md:text-xs font-bold text-slate-400">
                  هذا الأسبوع: {overview?.thisWeek?.totalOrders || 0} طلب
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] hover-elevate overflow-hidden group h-full">
              <div className="h-1.5 md:h-2 w-full bg-amber-500/10 group-hover:bg-amber-500 transition-colors" />
              <CardContent className="p-4 md:p-8">
                <div className="flex justify-between items-start mb-2 md:mb-4">
                  <div className="p-2 md:p-3 bg-amber-50 dark:bg-amber-900/30 rounded-2xl text-amber-500 group-hover:rotate-12 transition-transform">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                </div>
                <p className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-widest mb-1">متوسط قيمة الطلب</p>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white break-words">{formatCurrency(overview?.allTime?.averageOrderValue || 0)}</h2>
                <div className="mt-2 md:mt-4 pt-2 md:pt-4 border-t border-slate-50 dark:border-slate-800 text-[10px] md:text-xs font-bold text-slate-400">
                  تحسن بنسبة 5% عن الشهر الماضي
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] hover-elevate overflow-hidden group h-full">
              <div className="h-1.5 md:h-2 w-full bg-rose-500/10 group-hover:bg-rose-500 transition-colors" />
              <CardContent className="p-4 md:p-8">
                <div className="flex justify-between items-start mb-2 md:mb-4">
                  <div className="p-2 md:p-3 bg-rose-50 dark:bg-rose-900/30 rounded-2xl text-rose-500 group-hover:rotate-12 transition-transform">
                    <Users className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                </div>
                <p className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي العملاء</p>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white break-words">{overview?.allTime?.totalCustomers || 0}</h2>
                <div className="mt-2 md:mt-4 pt-2 md:pt-4 border-t border-slate-50 dark:border-slate-800 text-[10px] md:text-xs font-bold text-slate-400">
                  {overview?.thisMonth?.newCustomers || 0} عملاء جدد هذا الشهر
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[3rem] p-4">
            <CardHeader className="p-6">
              <CardTitle className="text-xl font-black">المبيعات خلال 30 يوم</CardTitle>
              <CardDescription className="font-bold">تتبع إيراداتك اليومية بدقة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full pr-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeries || []}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                      formatter={(value: number) => [formatCurrency(value), "الإيرادات"]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[3rem] p-4">
            <CardHeader className="p-6">
              <CardTitle className="text-xl font-black">حجم الطلبات</CardTitle>
              <CardDescription className="font-bold">عدد الطلبات اليومية المنفذة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full pr-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeSeries || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                      cursor={{ fill: '#f8fafc', radius: 10 }}
                    />
                    <Bar dataKey="orders" fill="#10b981" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-sm bg-white dark:bg-slate-900 rounded-[3rem] p-4">
            <CardHeader className="p-6">
              <CardTitle className="text-xl font-black">المنتجات الأكثر مبيعاً</CardTitle>
              <CardDescription className="font-bold">أفضل 5 منتجات مبيعاً في متجرك</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(topProducts || []).map((product: any, index: number) => (
                  <div key={product.productId} className="flex items-center gap-6 p-4 rounded-[2rem] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-lg font-black text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      {index + 1}
                    </div>
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-2xl shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                        <Package className="w-8 h-8 text-slate-300" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-black text-slate-900 dark:text-white text-lg">{product.name}</div>
                      <div className="text-sm font-bold text-slate-400">{product.quantity} وحدة مباعة</div>
                    </div>
                    <div className="text-left font-black text-xl text-primary">{formatCurrency(product.revenue)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[3rem] p-4">
            <CardHeader className="p-6">
              <CardTitle className="text-xl font-black">توزيع الطلبات</CardTitle>
              <CardDescription className="font-bold">حالة الطلبات الحالية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={orderStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="count"
                      nameKey="status"
                    >
                      {(orderStatus || []).map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', fontWeight: 'bold' }} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {(orderStatus || []).map((item: any, index: number) => (
                  <div key={item.status} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="font-black text-sm text-slate-700 dark:text-slate-300">
                        {item.status === 'new' ? 'جديد' : item.status === 'completed' ? 'مكتمل' : item.status === 'cancelled' ? 'ملغي' : item.status}
                      </span>
                    </div>
                    <span className="font-black text-primary">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Health */}
        {inventory && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[3rem] p-4">
              <CardHeader className="p-6">
                <CardTitle className="flex items-center gap-4 text-2xl font-black">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-500">
                    <Package className="h-8 w-8" />
                  </div>
                  صحة المخزون
                </CardTitle>
                <CardDescription className="font-bold pr-14">نظرة عامة على مستويات المخزون الحالي</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 text-center hover-elevate transition-all">
                    <div className="text-4xl font-black text-slate-900 dark:text-white mb-2">{inventory.totalProducts}</div>
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">إجمالي المنتجات</div>
                  </div>
                  <div className="p-8 bg-amber-50 dark:bg-amber-900/20 rounded-[2rem] border border-amber-100 dark:border-amber-900/30 text-center hover-elevate transition-all">
                    <div className="text-4xl font-black text-amber-600 mb-2">{inventory.lowStock}</div>
                    <div className="text-xs font-black uppercase tracking-widest text-amber-600/60">مخزون منخفض</div>
                  </div>
                  <div className="p-8 bg-rose-50 dark:bg-rose-900/20 rounded-[2rem] border border-rose-100 dark:border-rose-900/30 text-center hover-elevate transition-all">
                    <div className="text-4xl font-black text-rose-600 mb-2">{inventory.outOfStock}</div>
                    <div className="text-xs font-black uppercase tracking-widest text-rose-600/60">نفذ من المخزون</div>
                  </div>
                  <div className="p-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30 text-center hover-elevate transition-all">
                    <div className="text-4xl font-black text-emerald-600 mb-2">{inventory.overstocked}</div>
                    <div className="text-xs font-black uppercase tracking-widest text-emerald-600/60">مخزون زائد</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
