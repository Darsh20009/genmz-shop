import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">تعديل الرصيد</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>تعديل رصيد المحفظة - {customer.name}</DialogTitle>
                              </DialogHeader>
                              <BalanceForm customerId={customer.id} />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
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

function BalanceForm({ customerId }: { customerId: string }) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"deposit" | "withdrawal">("deposit");
  const [description, setDescription] = useState("");

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", `/api/admin/customers/${customerId}/wallet`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "تم تحديث الرصيد بنجاح" });
    },
  });

  return (
    <div className="space-y-4 pt-4">
      <div className="grid gap-2">
        <Label>نوع العملية</Label>
        <Select value={type} onValueChange={(v: any) => setType(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deposit">إيداع (إضافة)</SelectItem>
            <SelectItem value="withdrawal">سحب (خصم)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>المبلغ (ر.س)</Label>
        <Input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          placeholder="0.00"
        />
      </div>
      <div className="grid gap-2">
        <Label>ملاحظات (اختياري)</Label>
        <Input 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="سبب العملية"
        />
      </div>
      <Button 
        className="w-full" 
        onClick={() => mutation.mutate({ amount: parseFloat(amount), type, description })}
        disabled={mutation.isPending || !amount}
      >
        {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
        تأكيد العملية
      </Button>
    </div>
  );
}
