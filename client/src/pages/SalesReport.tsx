import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2, DollarSign, ShoppingBag, CreditCard, Wallet, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

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
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 space-y-8" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">تقارير المبيعات والنقد</h1>
            <p className="text-muted-foreground">ملخص شامل للعمليات المالية والمبيعات</p>
          </div>
          <Button onClick={downloadCSV} className="gap-2">
            <Download className="h-4 w-4" />
            تصدير CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(report?.totalSales || 0)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">مبيعات POS</CardTitle>
              <ShoppingBag className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(report?.posSales || 0)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">مبيعات أونلاين</CardTitle>
              <CreditCard className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(report?.onlineSales || 0)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">استخدام المحفظة</CardTitle>
              <Wallet className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(report?.walletUsage || 0)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                سجل الورديات المالية (Cash Shifts)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الفرع</TableHead>
                    <TableHead className="text-right">المحاسب</TableHead>
                    <TableHead className="text-right">الرصيد الافتتاحي</TableHead>
                    <TableHead className="text-right">المبلغ الفعلي</TableHead>
                    <TableHead className="text-right">العجز / الزيادة</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shifts?.map((shift: any) => (
                    <TableRow key={shift.id}>
                      <TableCell>{format(new Date(shift.openedAt), 'PPP p', { locale: ar })}</TableCell>
                      <TableCell>{shift.branchId}</TableCell>
                      <TableCell>{shift.cashierId}</TableCell>
                      <TableCell>{formatCurrency(shift.openingBalance)}</TableCell>
                      <TableCell>{shift.actualCash ? formatCurrency(shift.actualCash) : '-'}</TableCell>
                      <TableCell className={shift.difference < 0 ? "text-red-500 font-bold" : "text-green-500"}>
                        {shift.difference ? formatCurrency(shift.difference) : '-'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${shift.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {shift.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!shifts || shifts.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        لا يوجد سجل ورديات متاح
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
