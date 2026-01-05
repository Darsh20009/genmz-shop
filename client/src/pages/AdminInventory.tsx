import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Edit, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";
import { apiRequest } from "@/lib/queryClient";

export default function AdminInventory() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["/api/branches"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/branches");
      return res.json();
    },
  });

  const filteredProducts = (products as any[]).filter((p: any) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = filteredProducts.filter((p: any) => {
    const totalStock = p.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
    return totalStock < 10;
  });

  return (
    <Layout>
      <div className="p-6 space-y-6" dir="rtl">
        <div>
          <h1 className="text-3xl font-bold">إدارة المخزون</h1>
          <p className="text-muted-foreground">إدارة كميات منتجاتك بسهولة وتحديث البيانات لضمان دقة المخزون</p>
        </div>

        {lowStockProducts.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                تنبيهات المخزون المنخفض
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockProducts.map(p => (
                  <div key={p.id} className="text-sm text-orange-900">
                    {p.name} - المخزون المتبقي: {p.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>المخزون الحالي</CardTitle>
            <div className="flex items-center gap-4 mt-4">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input placeholder="بحث عن منتج..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم المنتج</TableHead>
                    <TableHead>الحد الأدنى للمخزون</TableHead>
                    <TableHead>الحد الأقصى للمخزون</TableHead>
                    <TableHead>الكمية الحالية</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product: any) => {
                    const currentStock = product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
                    let status = "جيد";
                    let statusColor = "bg-green-100 text-green-800";
                    
                    if (currentStock < 10) {
                      status = "منخفض";
                      statusColor = "bg-red-100 text-red-800";
                    } else if (currentStock < 20) {
                      status = "تحذير";
                      statusColor = "bg-yellow-100 text-yellow-800";
                    }
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>5</TableCell>
                        <TableCell>100</TableCell>
                        <TableCell>{currentStock}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={statusColor}>{status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
