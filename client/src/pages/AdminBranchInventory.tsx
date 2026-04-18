import { useQuery, useMutation } from "@tanstack/react-query";
import { Branch, Product, BranchInventory, StockTransfer } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Package, AlertTriangle, ArrowRightLeft, Building, Plus, Check, X, Search, ChevronRight, History } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/Layout";

export default function AdminBranchInventory() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("stock");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [search, setSearch] = useState("");

  const { data: branches } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: inventory, isLoading: invLoading } = useQuery<BranchInventory[]>({
    queryKey: ["/api/branch-inventory"],
  });

  const { data: transfers } = useQuery<StockTransfer[]>({
    queryKey: ["/api/stock-transfers"],
  });

  const filteredProducts = products?.filter((product: Product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const updateTransferStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/stock-transfers/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stock-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/branch-inventory"] });
      toast({ title: "تم تحديث حالة التحويل بنجاح" });
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      return apiRequest("PATCH", `/api/branch-inventory/${id}`, { stock });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branch-inventory"] });
      toast({ title: "تم تحديث المخزون بنجاح" });
    },
  });

  const createTransferMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/stock-transfers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stock-transfers"] });
      toast({ title: "تم إنشاء طلب التحويل بنجاح" });
    },
  });

  return (
    <Layout>
      <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8 space-y-8" dir="rtl">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border shadow-sm"
        >
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <Package className="w-8 h-8 text-primary" />
              إدارة المخزون
            </h1>
            <p className="text-muted-foreground">تتبع مستويات المخزون وعمليات التحويل بين الفروع</p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList className="rounded-2xl bg-slate-100 p-1">
              <TabsTrigger value="stock" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">المخزون</TabsTrigger>
              <TabsTrigger value="transfers" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">التحويلات</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "stock" ? (
            <motion.div
              key="stock"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-none shadow-sm rounded-[2rem] overflow-hidden">
                  <CardHeader className="bg-white border-b p-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                      <div className="relative w-full md:w-64">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="ابحث عن منتج..." 
                          className="pr-10 rounded-2xl border-slate-100 focus:ring-primary"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </div>
                      <div className="w-full md:w-64">
                        <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                          <SelectTrigger className="rounded-2xl border-slate-100">
                            <Building className="w-4 h-4 ml-2 opacity-40" />
                            <SelectValue placeholder="اختر الفرع للمعاينة" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl shadow-xl border-none">
                            <SelectItem value="central">المستودع الرئيسي</SelectItem>
                            {branches?.map(b => (
                              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {!selectedBranchId ? (
                      <div className="py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                          <Building className="w-10 h-10 text-slate-200" />
                        </div>
                        <p className="text-muted-foreground font-medium italic">يرجى اختيار فرع لعرض قائمة المنتجات والمخزون</p>
                      </div>
                    ) : invLoading ? (
                      <div className="py-20 flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-muted-foreground animate-pulse">جاري جلب بيانات المخزون...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredProducts?.map(product => {
                          const productInventory = inventory?.filter(i => i.productId === product.id);
                          if (!productInventory?.length && selectedBranchId !== "central") return null;

                          return (
                            <motion.div
                              key={product.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 hover-elevate"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                                  <Package className="w-5 h-5 text-primary" />
                                  {product.name}
                                </h3>
                                <Badge variant="outline" className="rounded-lg bg-white">
                                  {(product as any).variants?.length || 0} خيارات
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 gap-3">
                                {(product as any).variants?.map((variant: any) => {
                                  const invItem = inventory?.find(i => i.variantSku === variant.sku);
                                  const currentStock = selectedBranchId === "central" ? variant.stock : (invItem?.stock || 0);
                                  const isLow = currentStock <= (invItem?.minStockLevel || 5);
                                  
                                  return (
                                    <div key={variant.sku} className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between border border-slate-100">
                                      <div className="space-y-1">
                                        <p className="font-bold text-sm">{variant.color} - {variant.size}</p>
                                        <div className="flex items-center gap-2">
                                          <p className="text-[10px] text-muted-foreground font-mono bg-slate-100 px-2 py-0.5 rounded-full">{variant.sku}</p>
                                          {isLow && (
                                            <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                                              <AlertTriangle className="w-3 h-3" /> مخزون منخفض
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <Label className="text-[10px] font-black uppercase text-slate-400">الكمية</Label>
                                        <Input 
                                          type="number" 
                                          value={currentStock}
                                          onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (selectedBranchId === "central") {
                                              toast({ title: "تنبيه", description: "يتم تحديث مخزون المركز الرئيسي من صفحة المنتجات" });
                                            } else if (invItem) {
                                              updateStockMutation.mutate({ id: invItem.id, stock: val });
                                            }
                                          }}
                                          className="w-20 h-10 rounded-xl text-center font-black border-slate-100 bg-slate-50 focus:bg-white"
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="border-none shadow-sm rounded-[2rem] bg-indigo-600 text-white p-8">
                    <div className="space-y-6">
                      <div className="bg-white/10 p-4 rounded-2xl w-fit">
                        <ArrowRightLeft className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black tracking-tight">تحويل مخزني</h3>
                        <p className="text-indigo-100 text-sm">قم بنقل المنتجات بين الفروع والمستودع المركزي بكل سهولة.</p>
                      </div>
                      {selectedBranchId && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="w-full h-12 rounded-2xl bg-white text-indigo-600 font-bold hover:bg-indigo-50 active-elevate-2">
                              إنشاء طلب جديد
                            </Button>
                          </DialogTrigger>
                          <DialogContent dir="rtl" className="rounded-[2.5rem] p-8 border-none shadow-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-black mb-6">طلب تحويل مخزني</DialogTitle>
                            </DialogHeader>
                            <form className="space-y-6" onSubmit={(e) => {
                              e.preventDefault();
                              const formData = new FormData(e.currentTarget);
                              createTransferMutation.mutate({
                                fromBranchId: formData.get("fromBranchId"),
                                toBranchId: selectedBranchId,
                                productId: formData.get("productId"),
                                variantSku: formData.get("variantSku"),
                                quantity: parseInt(formData.get("quantity") as string),
                                notes: formData.get("notes")
                              });
                            }}>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <Label className="font-bold pr-2">من فرع</Label>
                                  <Select name="fromBranchId" required>
                                    <SelectTrigger className="rounded-2xl h-12 bg-slate-50 border-none">
                                      <SelectValue placeholder="اختر فرع المصدر" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-xl">
                                      <SelectItem value="central">المستودع الرئيسي</SelectItem>
                                      {branches?.filter(b => b.id !== selectedBranchId).map(b => (
                                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="font-bold pr-2">إلى فرع</Label>
                                  <div className="h-12 bg-slate-100 rounded-2xl flex items-center px-4 font-bold text-slate-500">
                                    {selectedBranchId === 'central' ? 'المستودع الرئيسي' : branches?.find(b => b.id === selectedBranchId)?.name}
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="font-bold pr-2">المنتج</Label>
                                <Select name="productId" required>
                                  <SelectTrigger className="rounded-2xl h-12 bg-slate-50 border-none">
                                    <SelectValue placeholder="اختر المنتج المطلوب" />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-2xl border-none shadow-xl">
                                    {products?.map(p => (
                                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="font-bold pr-2">الكمية</Label>
                                <Input type="number" name="quantity" min="1" required className="rounded-2xl h-12 bg-slate-50 border-none font-black text-center text-lg" />
                              </div>
                              <Button type="submit" className="w-full h-14 rounded-2xl bg-indigo-600 text-lg font-black" disabled={createTransferMutation.isPending}>
                                {createTransferMutation.isPending ? <Loader2 className="animate-spin" /> : "إرسال طلب التحويل"}
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="transfers"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {transfers?.map((transfer, idx) => (
                  <motion.div
                    key={transfer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden hover-elevate group">
                      <div className={`h-2 w-full ${
                        transfer.status === 'completed' ? 'bg-emerald-500' :
                        transfer.status === 'cancelled' ? 'bg-rose-500' : 'bg-amber-500'
                      }`} />
                      <CardContent className="p-8 space-y-6">
                        <div className="flex justify-between items-start">
                          <div className="bg-slate-50 p-4 rounded-3xl">
                            <History className="w-6 h-6 text-slate-400" />
                          </div>
                          <Badge className={`rounded-full px-4 py-1 font-bold border-none ${
                            transfer.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                            transfer.status === 'cancelled' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {transfer.status === 'pending' ? 'قيد الانتظار' : transfer.status === 'completed' ? 'مكتمل' : 'ملغي'}
                          </Badge>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="text-right">
                              <p className="text-[10px] font-black uppercase text-slate-400">من</p>
                              <p className="font-bold">{transfer.fromBranchId === 'central' ? 'المستودع' : branches?.find(b => b.id === transfer.fromBranchId)?.name}</p>
                            </div>
                            <ArrowRightLeft className="w-4 h-4 text-slate-300" />
                            <div className="text-left">
                              <p className="text-[10px] font-black uppercase text-slate-400">إلى</p>
                              <p className="font-bold">{transfer.toBranchId === 'central' ? 'المستودع' : branches?.find(b => b.id === transfer.toBranchId)?.name}</p>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                            <span className="text-sm font-black text-primary">{transfer.quantity} قطعة</span>
                            <span className="text-[10px] font-bold text-slate-400">{new Date(transfer.createdAt as any).toLocaleDateString('ar-SA')}</span>
                          </div>
                        </div>

                        {transfer.status === "pending" && (
                          <div className="flex gap-2 pt-2">
                            <Button 
                              className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 h-12 font-black"
                              onClick={() => updateTransferStatusMutation.mutate({ id: transfer.id, status: "completed" })}
                            >
                              <Check className="w-4 h-4 ml-2" /> قبول
                            </Button>
                            <Button 
                              variant="outline"
                              className="flex-1 rounded-2xl border-rose-100 text-rose-600 hover:bg-rose-50 h-12 font-black"
                              onClick={() => updateTransferStatusMutation.mutate({ id: transfer.id, status: "cancelled" })}
                            >
                              <X className="w-4 h-4 ml-2" /> رفض
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              {(!transfers || transfers.length === 0) && (
                <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <History className="w-12 h-12 text-slate-200" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-400 italic">لا توجد طلبات تحويل مخزني حالياً</h3>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
