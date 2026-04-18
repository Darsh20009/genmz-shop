import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Warehouse, ArrowRight, User } from "lucide-react";

export default function AdminInventoryChanges() {
  const changes = [
    { id: 1, product: "منتج تجريبي 1", warehouse: "المستودع الرئيسي", type: "زيادة", amount: "+10", user: "أحمد علي", date: "2025-12-30 14:20" },
    { id: 2, product: "منتج تجريبي 2", warehouse: "مستودع الرياض", type: "نقص", amount: "-5", user: "سارة محمد", date: "2025-12-30 11:45" },
  ];

  return (
    <Layout>
      <div className="p-8" dir="rtl">
        <div className="mb-8">
          <h1 className="text-3xl font-black">إدارة تغييرات المخزون</h1>
          <p className="text-muted-foreground font-bold mt-2">راجع وحدث تفاصيل المنتجات والمخزون حسب كل مستودع لتواكب احتياجات متجرك.</p>
        </div>

        <Card className="rounded-[2rem] border-none shadow-xl shadow-muted/20 overflow-hidden">
          <CardHeader className="bg-muted/30 pb-6 border-b">
            <CardTitle className="text-xl font-bold">سجل العمليات الأخير</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-muted/10 border-b">
                    <th className="px-6 py-4 font-black text-sm text-muted-foreground">المنتج</th>
                    <th className="px-6 py-4 font-black text-sm text-muted-foreground">المستودع</th>
                    <th className="px-6 py-4 font-black text-sm text-muted-foreground">النوع</th>
                    <th className="px-6 py-4 font-black text-sm text-muted-foreground">الكمية</th>
                    <th className="px-6 py-4 font-black text-sm text-muted-foreground">المسؤول</th>
                    <th className="px-6 py-4 font-black text-sm text-muted-foreground">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {changes.map((change) => (
                    <tr key={change.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-6 py-4 font-bold">{change.product}</td>
                      <td className="px-6 py-4 font-medium flex items-center gap-2">
                        <Warehouse className="w-4 h-4 text-primary" />
                        {change.warehouse}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${change.type === 'زيادة' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {change.type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 font-black ${change.type === 'زيادة' ? 'text-green-600' : 'text-red-600'}`}>
                        {change.amount}
                      </td>
                      <td className="px-6 py-4 font-medium flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {change.user}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground font-bold">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {change.date}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
