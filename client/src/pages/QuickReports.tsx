import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2, FileText, Download, TrendingUp, Users, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function QuickReports() {
  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-bold animate-pulse">جاري تحميل التقارير...</p>
        </div>
      </Layout>
    );
  }

  const reports = [
    {
      title: "تقرير المبيعات",
      description: "إحصائيات الإيرادات والمبيعات التفصيلية",
      value: `${(stats?.totalSales || 0).toLocaleString()} ر.س`,
      icon: TrendingUp,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      path: "/admin/reports/sales"
    },
    {
      title: "تقرير الطلبات",
      description: "تحليل حالات الطلبات والنمو اليومي",
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      path: "/admin/orders"
    },
    {
      title: "تقرير العملاء",
      description: "بيانات نمو وتفاعل قاعدة العملاء",
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      path: "/admin/customers"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-4 lg:p-8 space-y-8" dir="rtl">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border shadow-sm"
        >
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <FileText className="w-8 h-8" />
              </div>
              التقارير السريعة
            </h1>
            <p className="text-muted-foreground font-medium pr-14 italic">نظرة عامة سريعة على أداء متجرك</p>
          </div>
          <Button className="rounded-2xl h-12 px-8 gap-2 bg-black hover:bg-slate-800 text-white font-bold shadow-lg transition-all hover-elevate">
            <Download className="h-5 w-5" />
            تصدير الكل
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report, index) => (
            <motion.div
              key={report.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden group hover-elevate h-full">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 ${report.bgColor} ${report.color} rounded-2xl group-hover:scale-110 transition-transform`}>
                      <report.icon className="w-6 h-6" />
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-xl" asChild>
                      <Link href={report.path}>
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </Button>
                  </div>
                  <div className="space-y-1 mb-6">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{report.title}</h3>
                    <p className="text-sm font-medium text-slate-400">{report.description}</p>
                  </div>
                  <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                    <div className="text-3xl font-black text-primary">{report.value}</div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">القيمة الحالية</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
