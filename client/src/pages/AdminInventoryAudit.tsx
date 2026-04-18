import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, AlertTriangle, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";

export default function AdminInventoryAudit() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const filteredProducts = (products as any[]).filter((p: any) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6 space-y-6" dir="rtl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">إدارة جرد المخزون</h1>
            <p className="text-muted-foreground">إدارة كميات منتجاتك بسهولة وتحديث البيانات لضمان دقة المخزون</p>
          </div>
          <Button className="gap-2">
            <RefreshCcw className="w-4 h-4" />
            بدء جرد جديد
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="بحث عن منتج..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="max-w-sm" 
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم المنتج</TableHead>
                    <TableHead>المخزون الحالي</TableHead>
                    <TableHead>الكمية الفعلية</TableHead>
                    <TableHead>الفارق</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product: any) => {
                    const currentStock = product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{currentStock}</TableCell>
                        <TableCell>
                          <Input type="number" className="w-24" defaultValue={currentStock} />
                        </TableCell>
                        <TableCell>0</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">متطابق</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">تحديث</Button>
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
