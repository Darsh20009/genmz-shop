import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Users } from "lucide-react";

export default function AdminCustomers() {
  const { data: customers, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
  });

  const filteredCustomers = customers?.filter((u: any) => u.role === "customer") || [];

  return (
    <Layout>
      <div className="p-8 space-y-8" dir="rtl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black">قائمة العملاء</h1>
          <Users className="h-8 w-8 text-primary" />
        </div>

        <Card className="rounded-[2rem] border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-black">جميع عملاء متجرك</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الاسم</TableHead>
                      <TableHead className="text-right">الهاتف</TableHead>
                      <TableHead className="text-right">البريد الإلكتروني</TableHead>
                      <TableHead className="text-right">الرصيد</TableHead>
                      <TableHead className="text-right">نقاط الولاء</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer: any) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-bold">{customer.name}</TableCell>
                        <TableCell dir="ltr">{customer.phone}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.walletBalance} ر.س</TableCell>
                        <TableCell>{customer.loyaltyPoints || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
