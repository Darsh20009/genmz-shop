import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2, DollarSign, ShoppingBag, CreditCard, Wallet, Calendar, Download, TrendingUp, ArrowUpRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function SalesReport() {
  const { data: report, isLoading } = useQuery<any>({
    queryKey: ["/api/admin/reports/sales"],
  });

  const { data: shifts } = useQuery<any[]>({
    queryKey: ["/api/cash-shifts"],
  });

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR' }).format(amount).replace('SAR', 'ر.س');

  const downloadCSV = () => {
    if (!report) return;
    const headers = ["البيان", "القيمة"];
    const rows = [
      ["إجمالي المبيعات", report.totalSales],
      ["مبيعات POS", report.posSales],
      ["مبيعات أونلاين", report.onlineSales],
      ["عدد الطلبات", report.orderCount],
      ["استخدام المحفظة", report.walletUsage]
    ];
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += headers.join(",") + "\n";
    rows.forEach(row => {
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-bold animate-pulse">جاري إعداد التقارير...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-4 lg:p-8 space-y-8" dir="rtl">
        {/* Header Section */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border shadow-sm"
        >
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <TrendingUp className="w-8 h-8" />
              </div>
              تقارير المبيعات
            </h1>
            <p className="text-muted-foreground font-medium pr-14 italic">تحليل دقيق للتدفقات النقدية والعمليات المالية</p>
          </div>
          <Button onClick={downloadCSV} className="rounded-2xl h-12 px-8 gap-2 bg-black hover:bg-slate-800 text-white font-bold shadow-lg transition-all hover-elevate">
            <Download className="h-5 w-5" />
            تصدير البيانات (CSV)
          </Button>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] hover-elevate overflow-hidden group border-t-4 border-t-indigo-500">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-500">
                  <DollarSign className="w-6 h-6" />
                </div>
                <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg">+5.2%</Badge>
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي المبيعات</p>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(report?.totalSales || 0)}</h2>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] hover-elevate overflow-hidden group border-t-4 border-t-blue-500">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-500">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">نقاط البيع</div>
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">مبيعات POS</p>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(report?.posSales || 0)}</h2>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] hover-elevate overflow-hidden group border-t-4 border-t-emerald-500">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-500">
                  <CreditCard className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">مبيعات أونلاين</p>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(report?.onlineSales || 0)}</h2>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] hover-elevate overflow-hidden group border-t-4 border-t-orange-500">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-2xl text-orange-500">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">استخدام المحفظة</p>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(report?.walletUsage || 0)}</h2>
            </CardContent>
          </Card>
        </div>

        {/* Cash Shifts Table */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
              <CardTitle className="flex items-center gap-4 text-2xl font-black">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-900 dark:text-white">
                  <Clock className="w-6 h-6" />
                </div>
                سجل الورديات المالية (Cash Shifts)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                  <TableRow className="hover:bg-transparent border-b border-slate-50 dark:border-slate-800">
                    <TableHead className="text-right py-6 font-black text-xs uppercase tracking-wider text-slate-400">التاريخ</TableHead>
                    <TableHead className="text-right py-6 font-black text-xs uppercase tracking-wider text-slate-400">الفرع</TableHead>
                    <TableHead className="text-right py-6 font-black text-xs uppercase tracking-wider text-slate-400">المحاسب</TableHead>
                    <TableHead className="text-right py-6 font-black text-xs uppercase tracking-wider text-slate-400">الرصيد الافتتاحي</TableHead>
                    <TableHead className="text-right py-6 font-black text-xs uppercase tracking-wider text-slate-400">المبلغ الفعلي</TableHead>
                    <TableHead className="text-right py-6 font-black text-xs uppercase tracking-wider text-slate-400">العجز / الزيادة</TableHead>
                    <TableHead className="text-right py-6 font-black text-xs uppercase tracking-wider text-slate-400 text-center">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shifts?.map((shift: any) => (
                    <TableRow key={shift.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0">
                      <TableCell className="py-6 font-bold">{format(new Date(shift.openedAt), 'PPP p', { locale: ar })}</TableCell>
                      <TableCell className="py-6 font-bold text-slate-600">{shift.branchId}</TableCell>
                      <TableCell className="py-6 font-bold text-slate-600">{shift.cashierId}</TableCell>
                      <TableCell className="py-6 font-black text-slate-900 dark:text-white">{formatCurrency(shift.openingBalance)}</TableCell>
                      <TableCell className="py-6 font-black text-slate-900 dark:text-white">{shift.actualCash ? formatCurrency(shift.actualCash) : '-'}</TableCell>
                      <TableCell className={`py-6 font-black ${shift.difference < 0 ? "text-rose-500" : "text-emerald-500"}`}>
                        {shift.difference ? (shift.difference > 0 ? '+' : '') + formatCurrency(shift.difference) : '-'}
                      </TableCell>
                      <TableCell className="py-6 text-center">
                        <Badge className={`rounded-xl px-4 py-1.5 font-black text-[10px] shadow-sm ${shift.status === 'open' ? 'bg-emerald-500 text-white border-none' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 border-none'}`}>
                          {shift.status === 'open' ? 'مفتوحة الآن' : 'تم الإغلاق'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!shifts || shifts.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-20">
                        <div className="flex flex-col items-center gap-2 opacity-20">
                          <ShoppingBag className="w-16 h-16" />
                          <p className="text-xl font-black">لا توجد ورديات مسجلة حالياً</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
