import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Label } from "@/components/ui/label";

export default function AdminTransferRequests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const { data: transfers = [] } = useQuery({
    queryKey: ["/api/transfers"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/transfers");
      return res.json();
    },
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["/api/branches"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/branches");
      return res.json();
    },
  });

  const createTransferMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/transfers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transfers"] });
      setIsCreateOpen(false);
      toast({ title: "تم إنشاء طلب النقل بنجاح" });
    },
  });

  const filteredTransfers = (transfers as any[]).filter((t: any) =>
    t.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6 space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">طلبات النقل</h1>
            <p className="text-muted-foreground">تحديد موقع المخزن الأساسي والمخزن الذي سيتم النقل إليه</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 ml-2" />طلب نقل جديد</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إنشاء طلب نقل</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>المستودع المصدر</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المستودع" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((b: any) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>المستودع المقصد</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المستودع" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((b: any) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={() => createTransferMutation.mutate({})}>
                  إنشاء الطلب
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="p-4 sm:p-6 border-b bg-muted/10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="بحث عن طلب نقل..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pr-10 h-11 bg-background" 
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="table-responsive">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="font-black text-xs uppercase whitespace-nowrap">المنتج</TableHead>
                    <TableHead className="font-black text-xs uppercase whitespace-nowrap">من</TableHead>
                    <TableHead className="font-black text-xs uppercase whitespace-nowrap">إلى</TableHead>
                    <TableHead className="font-black text-xs uppercase whitespace-nowrap">الكمية</TableHead>
                    <TableHead className="font-black text-xs uppercase whitespace-nowrap">الحالة</TableHead>
                    <TableHead className="font-black text-xs uppercase whitespace-nowrap text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransfers.length > 0 ? (
                    filteredTransfers.map((transfer: any) => (
                      <TableRow key={transfer.id} className="hover:bg-muted/5 transition-colors">
                        <TableCell className="font-bold py-4 whitespace-nowrap">{transfer.productName}</TableCell>
                        <TableCell className="whitespace-nowrap">{transfer.fromBranch}</TableCell>
                        <TableCell className="whitespace-nowrap">{transfer.toBranch}</TableCell>
                        <TableCell className="whitespace-nowrap font-black">{transfer.quantity}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="secondary" className="rounded-lg font-black text-[10px]">{transfer.status || "قيد المعالجة"}</Badge>
                        </TableCell>
                        <TableCell className="text-left whitespace-nowrap">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/5 hover:text-primary"><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/5 hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground font-bold italic">لا توجد طلبات نقل حالياً</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
