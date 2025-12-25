import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useProducts, useCreateProduct } from "@/hooks/use-products";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React, { useState, useMemo, memo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct, orderStatuses } from "@shared/schema";
import { api } from "@shared/routes";
import { Loader2, Plus, DollarSign, ShoppingCart, TrendingUp, BarChart3, ArrowUpRight, Trash2, Search, Filter, ChevronDown, CheckCircle2, XCircle, Truck, PackageCheck, AlertCircle, LayoutGrid, Tag } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Components extracted to prevent hook issues

const StatsCards = memo(() => {
  const { data: stats, isLoading } = useQuery({ 
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
       const res = await fetch("/api/admin/stats");
       if (!res.ok) throw new Error("Failed to fetch stats");
       return res.json();
    }
  });

  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {[1, 2, 3, 4].map(i => <Card key={i} className="h-32 animate-pulse bg-secondary/20" />)}
    </div>
  );

  return (
    <React.Fragment>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="hover-elevate border-black/5 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">إجمالي المبيعات</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{Number(stats?.totalSales || 0).toLocaleString()} <span className="text-xs">ر.س</span></div>
          </CardContent>
        </Card>
        
        <Card className="hover-elevate border-black/5 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">صافي الربح</CardTitle>
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{Number(stats?.netProfit || 0).toLocaleString()} <span className="text-xs">ر.س</span></div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="text-[8px] font-bold opacity-40 uppercase tracking-tighter">يومي: {Number(stats?.dailySales || 0).toLocaleString()}</div>
              <div className="text-[8px] font-bold opacity-40 uppercase tracking-tighter text-left">شهري: {Number(stats?.monthlySales || 0).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate border-black/5 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">إجمالي الطلبات</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{stats?.totalOrders || 0}</div>
          </CardContent>
        </Card>

        <Card className="hover-elevate border-black/5 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">متوسط الطلب</CardTitle>
            <div className="p-2 bg-orange-50 rounded-lg">
              <BarChart3 className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">
              {stats?.totalOrders ? (stats.totalSales / stats.totalOrders).toFixed(2) : 0} <span className="text-xs">ر.س</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="border-black/5 bg-white shadow-sm p-6">
          <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between mb-6">
            <CardTitle className="text-sm font-black uppercase tracking-widest">أكثر المنتجات مبيعاً</CardTitle>
          </CardHeader>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.topProducts || []} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 10, fontWeight: 'bold' }} 
                  width={80}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8f8f8' }}
                />
                <Bar dataKey="quantity" radius={[0, 4, 4, 0]}>
                  {(stats?.topProducts || []).map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#000' : '#888'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-black/5 bg-white shadow-sm p-6">
          <CardHeader className="px-0 pt-0 mb-6">
            <CardTitle className="text-sm font-black uppercase tracking-widest">حالات الطلبات</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {Object.entries(stats?.orderStatusCounts || {}).map(([status, count]: [string, any]) => (
              <div key={status} className="flex items-center justify-between p-4 bg-secondary/20 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'new' ? 'bg-primary' : 
                    status === 'processing' ? 'bg-blue-500' : 
                    status === 'shipped' ? 'bg-orange-500' : 'bg-green-500'
                  }`} />
                  <span className="text-sm font-bold uppercase tracking-widest">
                    {status === 'new' ? 'جديد' : 
                     status === 'processing' ? 'قيد التنفيذ' : 
                     status === 'shipped' ? 'تم الشحن' : 'مكتمل'}
                  </span>
                </div>
                <span className="font-black">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </React.Fragment>
  );
});

const ProductsTable = memo(() => {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useQuery<any[]>({ queryKey: ["/api/categories"] });
  const createProduct = useCreateProduct();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "0",
      cost: "0",
      images: [],
      categoryId: "",
      variants: [],
      isFeatured: false,
    }
  });

  useEffect(() => {
    if (editingProduct) {
      form.reset({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        cost: editingProduct.cost,
        images: editingProduct.images || [],
        categoryId: editingProduct.categoryId,
        isFeatured: editingProduct.isFeatured,
      });
      setVariants(editingProduct.variants || []);
    } else {
      form.reset({
        name: "",
        description: "",
        price: "0",
        cost: "0",
        images: [],
        categoryId: "",
        variants: [],
        isFeatured: false,
      });
      setVariants([]);
    }
  }, [editingProduct, form]);

  const addVariant = () => {
    setVariants([...variants, { color: "", size: "", sku: `SKU-${Date.now()}`, stock: 0 }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "تم حذف المنتج بنجاح" });
    }
  });

  const onSubmit = async (data: InsertProduct) => {
    try {
      if (editingProduct) {
        await apiRequest("PATCH", `/api/products/${editingProduct.id}`, {
          ...data,
          variants,
          price: data.price.toString(),
          cost: data.cost.toString(),
        });
        toast({ title: "تم تحديث المنتج بنجاح" });
      } else {
        await createProduct.mutateAsync({ 
          ...data, 
          variants,
          price: data.price.toString(),
          cost: data.cost.toString(),
        });
      }
      setOpen(false);
      setEditingProduct(null);
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
    } catch (e) {
      toast({ title: "خطأ", description: "فشل حفظ المنتج", variant: "destructive" });
    }
  };

  if (isLoading) return <Loader2 className="animate-spin" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold uppercase tracking-tight text-right w-full">إدارة المخزون</h2>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditingProduct(null); }}>
          <DialogTrigger asChild>
            <Button className="rounded-none font-bold uppercase tracking-widest text-xs h-10 px-6">
              <Plus className="ml-2 h-4 w-4" /> إضافة منتج جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl rounded-none border-none shadow-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-right font-black uppercase tracking-tight">
                {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-8" dir="rtl">
              <div className="grid grid-cols-2 gap-6 text-right">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-black/40">اسم المنتج</Label>
                  <Input {...form.register("name")} className="rounded-none h-12 text-right" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-black/40">السعر الأساسي (ر.س)</Label>
                  <Input type="number" {...form.register("price")} className="rounded-none h-12 text-right" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 text-right">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-black/40">الفئة</Label>
                  <Select value={form.watch("categoryId")} onValueChange={(v) => form.setValue("categoryId", v)}>
                    <SelectTrigger className="rounded-none h-12 text-right">
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-black/40">التكلفة (ر.س)</Label>
                  <Input type="number" {...form.register("cost")} className="rounded-none h-12 text-right" />
                </div>
              </div>

              <div className="space-y-2 text-right">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-black/40">رابط صورة المنتج</Label>
                <Input {...form.register("images.0")} className="rounded-none h-12 text-left" placeholder="https://..." />
                <p className="text-[8px] text-black/40 mt-1">يمكنك إضافة روابط صور لكل متغير أدناه</p>
              </div>

              <div className="space-y-2 text-right">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-black/40">الوصف التفصيلي</Label>
                <Textarea {...form.register("description")} className="rounded-none min-h-[100px] text-right" />
              </div>

              <div className="space-y-4 pt-4 border-t border-black/5 text-right">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">المتغيرات (الألوان والمقاسات)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addVariant} className="rounded-none text-[10px] font-black uppercase tracking-widest h-8">
                    إضافة متغير <Plus className="mr-1 h-3 w-3" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {variants.map((v, i) => (
                    <div key={i} className="grid grid-cols-6 gap-3 items-end bg-secondary/10 p-4 border border-black/5">
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold">اللون</Label>
                        <Input value={v.color} onChange={(e) => updateVariant(i, "color", e.target.value)} className="h-8 rounded-none text-xs text-right" placeholder="أسود" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold">المقاس</Label>
                        <Input value={v.size} onChange={(e) => updateVariant(i, "size", e.target.value)} className="h-8 rounded-none text-xs text-right" placeholder="L" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold">المخزون</Label>
                        <Input type="number" value={v.stock} onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value))} className="h-8 rounded-none text-xs text-right" />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-[9px] font-bold">رابط صورة اللون</Label>
                        <Input value={v.image || ""} onChange={(e) => updateVariant(i, "image", e.target.value)} className="h-8 rounded-none text-xs text-left" placeholder="https://..." />
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(i)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse pt-4 border-t border-black/5">
                <Switch 
                  id="isFeatured" 
                  checked={form.watch("isFeatured")} 
                  onCheckedChange={(checked) => form.setValue("isFeatured", checked)}
                />
                <Label htmlFor="isFeatured" className="text-[10px] font-black uppercase tracking-widest cursor-pointer">تمييز المنتج في الصفحة الرئيسية</Label>
              </div>

              <Button type="submit" disabled={createProduct.isPending} className="w-full h-14 rounded-none font-black uppercase tracking-widest text-lg">
                {createProduct.isPending ? <Loader2 className="animate-spin" /> : editingProduct ? "تحديث المنتج" : "نشر المنتج"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-none border border-black/5 overflow-hidden bg-white shadow-sm">
        <div className="p-6 grid grid-cols-6 font-black uppercase tracking-widest text-[10px] bg-secondary/10 text-black/40 border-b border-black/5">
          <div className="text-right">المنتج</div>
          <div className="text-right">الفئة</div>
          <div className="text-right">السعر</div>
          <div className="text-right">المخزون</div>
          <div className="text-right">الحالة</div>
          <div className="text-right">الإجراءات</div>
        </div>
        <div className="divide-y divide-black/5">
          {products?.map(product => {
            const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
            const category = categories?.find(c => c.id === product.categoryId);
            return (
              <div key={product.id} className="p-6 grid grid-cols-6 items-center hover:bg-secondary/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary/20 rounded-none overflow-hidden border border-black/5">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <PackageCheck className="w-4 h-4 m-4 opacity-20" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xs">{product.name}</div>
                    <div className="text-[8px] font-black uppercase opacity-40">{product.variants?.length || 0} خيارات متاحة</div>
                  </div>
                </div>
                <div className="text-[10px] font-black uppercase opacity-60">
                  {category?.name || "بدون فئة"}
                </div>
                <div className="font-black tracking-tighter text-xs">{Number(product.price).toLocaleString()} ر.س</div>
                <div className="font-bold text-xs">
                  <span className={totalStock === 0 ? "text-destructive" : totalStock < 5 ? "text-orange-500" : "text-green-600"}>
                    {totalStock}
                  </span>
                </div>
                <div className="flex gap-2">
                  {product.isFeatured && (
                    <Badge className="bg-black rounded-none text-[7px] font-black uppercase tracking-tighter">مميز</Badge>
                  )}
                  <Badge variant={totalStock > 0 ? "outline" : "destructive"} className="rounded-none text-[7px] font-black uppercase tracking-tighter">
                    {totalStock > 0 ? "متوفر" : "نفذ"}
                  </Badge>
                </div>
                <div className="flex gap-2 justify-start">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-black hover:text-white rounded-none transition-all"
                    onClick={() => {
                      setEditingProduct(product);
                      setOpen(true);
                    }}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-none transition-all"
                    onClick={() => {
                      if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
                        deleteProductMutation.mutate(product.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

const CategoriesTable = memo(() => {
  const { data: categories, isLoading } = useQuery<any[]>({ queryKey: ["/api/categories"] });
  const { toast } = useToast();
  const [newCat, setNewCat] = useState({ name: "", slug: "" });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/categories", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setNewCat({ name: "", slug: "" });
      toast({ title: "تمت إضافة الفئة بنجاح" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "تم حذف الفئة" });
    }
  });

  if (isLoading) return <Loader2 className="animate-spin mx-auto" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold uppercase tracking-tight">إدارة الفئات</h2>
      </div>

      <Card className="rounded-none border-black/5 shadow-sm p-6 bg-secondary/10">
        <div className="grid grid-cols-3 gap-4" dir="rtl">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase opacity-40">اسم الفئة</Label>
            <Input 
              value={newCat.name} 
              onChange={e => setNewCat({...newCat, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
              className="rounded-none h-10" 
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase opacity-40">المعرف (Slug)</Label>
            <Input value={newCat.slug} readOnly className="rounded-none h-10 bg-black/5" />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={() => createMutation.mutate(newCat)} 
              disabled={!newCat.name || createMutation.isPending}
              className="w-full rounded-none font-bold uppercase tracking-widest h-10"
            >
              {createMutation.isPending ? <Loader2 className="animate-spin" /> : "إضافة فئة"}
            </Button>
          </div>
        </div>
      </Card>

      <div className="rounded-none border border-black/5 overflow-hidden bg-white">
        <div className="divide-y divide-black/5">
          {categories?.map(cat => (
            <div key={cat.id} className="p-6 flex justify-between items-center hover:bg-secondary/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/20">
                  <Tag className="w-4 h-4 opacity-40" />
                </div>
                <div>
                  <div className="font-black text-sm uppercase tracking-widest">{cat.name}</div>
                  <div className="text-[10px] font-bold opacity-40">{cat.slug}</div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => deleteMutation.mutate(cat.id)}
                className="hover:bg-destructive/10 hover:text-destructive rounded-none"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

const OrdersTable = memo(() => {
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, shippingProvider, trackingNumber }: any) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}/status`, { status, shippingProvider, trackingNumber });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "تم تحديث حالة الطلب" });
    }
  });

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((order: any) => {
      const matchesStatus = filter === "all" || order.status === filter;
      const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (order.shippingAddress?.street?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, filter, searchTerm]);

  if (isLoading) return <Loader2 className="animate-spin mx-auto" />;

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'new': return <Badge className="bg-primary rounded-none">جديد</Badge>;
      case 'processing': return <Badge className="bg-blue-500 rounded-none">تجهيز</Badge>;
      case 'shipped': return <Badge className="bg-orange-500 rounded-none">تم الشحن</Badge>;
      case 'completed': return <Badge className="bg-green-600 rounded-none">مكتمل</Badge>;
      case 'cancelled': return <Badge variant="destructive" className="rounded-none">ملغي</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const exportReport = (format: 'pdf' | 'excel') => {
    toast({ title: `جاري تصدير التقرير بصيغة ${format.toUpperCase()}...` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h2 className="text-2xl font-bold uppercase tracking-tight">إدارة الطلبات</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportReport('excel')} className="rounded-none text-xs font-bold border-black/10">
            تصدير تقرير Excel
          </Button>
          <Button variant="outline" onClick={() => exportReport('pdf')} className="rounded-none text-xs font-bold border-black/10">
            تصدير PDF
          </Button>
        </div>
      </div>

      <div className="rounded-none border border-black/5 overflow-hidden">
        <div className="p-6 grid grid-cols-7 font-black uppercase tracking-widest text-[10px] bg-secondary/20 text-black/40 border-b border-black/5">
          <div className="text-right">رقم الطلب</div>
          <div className="text-right">العميل</div>
          <div className="text-right">المبلغ</div>
          <div className="text-right">الربح</div>
          <div className="text-right">الحالة</div>
          <div className="text-right">التاريخ</div>
          <div className="text-center">إجراءات</div>
        </div>
        <div className="divide-y divide-black/5">
          {filteredOrders.map((order: any) => (
            <div key={order.id} className="p-6 grid grid-cols-7 items-center hover:bg-secondary/10 transition-colors">
              <div className="font-black">#{order.id.slice(-6).toUpperCase()}</div>
              <div className="font-bold truncate">عميل</div>
              <div className="font-black tracking-tighter">{Number(order.total).toLocaleString()} ر.س</div>
              <div className="font-black text-green-600 text-[10px]">+{Number(order.netProfit || 0).toLocaleString()} ر.س</div>
              <div>{getStatusBadge(order.status)}</div>
              <div className="text-xs text-black/40">{new Date(order.createdAt).toLocaleDateString("ar-SA")}</div>
              <div className="flex justify-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black/5 rounded-none">
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent dir="rtl" className="rounded-none max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="text-right font-black">تحديث الطلب #{order.id.slice(-6).toUpperCase()}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 pt-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">تغيير الحالة</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {orderStatuses.map(s => (
                            <Button 
                              key={s} 
                              variant={order.status === s ? 'default' : 'outline'}
                              className="rounded-none text-[10px] h-10 font-bold"
                              onClick={() => updateStatusMutation.mutate({ id: order.id, status: s })}
                            >
                              {s === 'new' ? 'جديد' : s === 'processing' ? 'تجهيز' : s === 'shipped' ? 'شحن' : s === 'completed' ? 'مكتمل' : 'إلغاء'}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-black/5 space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">تفاصيل الشحن</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold">شركة الشحن</Label>
                            <Input 
                              placeholder="Storage Station" 
                              defaultValue={order.shippingProvider} 
                              className="rounded-none"
                              id={`provider-${order.id}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold">رقم التتبع</Label>
                            <Input 
                              placeholder="TRK123..." 
                              defaultValue={order.trackingNumber} 
                              className="rounded-none"
                              id={`tracking-${order.id}`}
                            />
                          </div>
                        </div>
                        <Button 
                          className="w-full rounded-none font-bold"
                          onClick={() => {
                            const p = (document.getElementById(`provider-${order.id}`) as HTMLInputElement).value;
                            const t = (document.getElementById(`tracking-${order.id}`) as HTMLInputElement).value;
                            updateStatusMutation.mutate({ id: order.id, status: order.status, shippingProvider: p, trackingNumber: t });
                          }}
                        >
                          تحديث معلومات الشحن
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

const ReturnsTable = memo(() => {
  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      return res.json();
    }
  });

  const returnOrders = useMemo(() => {
    return (orders || []).filter((o: any) => o.returnRequest && o.returnRequest.status !== 'none');
  }, [orders]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold uppercase tracking-tight">الاسترجاع والاستبدال</h2>
      <div className="rounded-none border border-black/5 overflow-hidden">
        {returnOrders.length === 0 ? (
          <div className="p-24 text-center text-black/20">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p className="font-bold uppercase tracking-widest text-xs">لا توجد طلبات استرجاع حالياً</p>
          </div>
        ) : (
          <div className="divide-y divide-black/5">
            {returnOrders.map((order: any) => (
              <div key={order.id} className="p-6 flex justify-between items-center hover:bg-secondary/10">
                <div className="space-y-1">
                  <p className="font-black text-sm">#{order.id.slice(-6).toUpperCase()}</p>
                  <p className="text-[10px] font-bold uppercase text-black/40">{order.returnRequest.type === 'return' ? 'استرجاع' : 'استبدال'}</p>
                </div>
                <Badge variant="outline" className="rounded-none">{order.returnRequest.status}</Badge>
                <Button variant="ghost" className="rounded-none text-xs font-bold border border-black/5">إدارة الطلب</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

// ... (Rest of StatsCards, ProductsTable, CustomersTable)


const CustomersTable = memo(() => {
  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    }
  });

  if (isLoading) return <Loader2 className="animate-spin mx-auto" />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold uppercase tracking-tight">المستخدمين</h2>
      <div className="rounded-none border border-black/5 overflow-hidden">
        <div className="p-6 grid grid-cols-5 font-black uppercase tracking-widest text-[10px] bg-secondary/20 text-black/40 border-b border-black/5">
          <div className="text-right">الاسم</div>
          <div className="text-right">رقم الهاتف</div>
          <div className="text-right">الدور</div>
          <div className="text-right">المحفظة</div>
          <div className="text-right">الإجراءات</div>
        </div>
        <div className="divide-y divide-black/5">
          {users?.map((u: any) => (
            <div key={u.id} className="p-6 grid grid-cols-5 items-center hover:bg-secondary/10 transition-colors">
              <div className="font-bold">{u.name}</div>
              <div className="text-sm font-bold">{u.phone || "-"}</div>
              <div>
                <Badge variant="outline" className="rounded-none text-[8px] uppercase">{u.role}</Badge>
              </div>
              <div className="font-black tracking-tighter text-green-600">{u.walletBalance} ر.س</div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black hover:text-white rounded-none transition-all">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

const CouponsTable = memo(() => {
  const { data: coupons, isLoading } = useQuery<any[]>({ queryKey: ["/api/coupons"] });
  const { toast } = useToast();

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold uppercase tracking-tight">أكواد الخصم</h2>
        <Button className="rounded-none font-bold uppercase tracking-widest text-xs h-10 px-6">
          <Plus className="ml-2 h-4 w-4" /> إضافة كود
        </Button>
      </div>
      <div className="rounded-none border border-black/5 overflow-hidden bg-white">
        <div className="p-6 grid grid-cols-5 font-black uppercase tracking-widest text-[10px] bg-secondary/10 text-black/40 border-b border-black/5">
          <div className="text-right">الكود</div>
          <div className="text-right">النوع</div>
          <div className="text-right">القيمة</div>
          <div className="text-right">الاستخدام</div>
          <div className="text-right">الحالة</div>
        </div>
        <div className="divide-y divide-black/5">
          {coupons?.map(c => (
            <div key={c.id} className="p-6 grid grid-cols-5 items-center hover:bg-secondary/5 transition-colors">
              <div className="font-black text-xs tracking-widest">{c.code}</div>
              <div className="text-[8px] font-bold uppercase opacity-60">{c.type === 'percentage' ? 'نسبة' : 'مبلغ ثابت'}</div>
              <div className="font-black text-xs">{c.value} {c.type === 'percentage' ? '%' : 'ر.س'}</div>
              <div className="text-[10px] font-bold">{c.usageCount} / {c.usageLimit || '∞'}</div>
              <div>
                <Badge className={c.isActive ? "bg-green-600" : "bg-destructive"}>
                  {c.isActive ? "نشط" : "معطل"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

const LogsTable = memo(() => {
  const { data: logs, isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/logs"] });

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold uppercase tracking-tight">سجل العمليات</h2>
      <div className="rounded-none border border-black/5 overflow-hidden">
        <div className="p-6 grid grid-cols-4 font-black uppercase tracking-widest text-[10px] bg-secondary/20 text-black/40 border-b border-black/5">
          <div className="text-right">الموظف</div>
          <div className="text-right">الإجراء</div>
          <div className="text-right">الهدف</div>
          <div className="text-right">التاريخ</div>
        </div>
        <div className="divide-y divide-black/5">
          {logs?.map((l: any) => (
            <div key={l.id} className="p-6 grid grid-cols-4 items-center hover:bg-secondary/10 transition-colors">
              <div className="font-bold">{l.employeeId}</div>
              <div className="text-sm">{l.action}</div>
              <div className="text-xs opacity-60">{l.targetType} {l.targetId && `(#${l.targetId.slice(-6)})`}</div>
              <div className="text-xs">{new Date(l.createdAt).toLocaleString('ar-SA')}</div>
            </div>
          ))}
          {logs?.length === 0 && (
            <div className="p-12 text-center text-black/20 font-bold uppercase tracking-widest text-[10px]">
              لا توجد سجلات حالياً
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default function Admin() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin" />
    </div>
  );
  
  if (!user || user.role !== 'admin') {
    setLocation("/");
    return null;
  }

  return (
    <Layout>
      <div className="container py-12 text-right" dir="rtl">
        <h1 className="font-display text-4xl font-bold mb-12 uppercase tracking-tighter">لوحة التحكم</h1>
        
            <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-12 p-0 space-x-reverse space-x-8 flex overflow-x-auto no-scrollbar">
            <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent font-bold min-w-[100px]">نظرة عامة</TabsTrigger>
            <TabsTrigger value="products" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent font-bold min-w-[100px]">المنتجات</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent font-bold min-w-[100px]">الطلبات</TabsTrigger>
            <TabsTrigger value="returns" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent font-bold min-w-[100px]">الاسترجاع</TabsTrigger>
            <TabsTrigger value="customers" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent font-bold min-w-[100px]">المستخدمين</TabsTrigger>
            <TabsTrigger value="coupons" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent font-bold min-w-[100px]">أكواد الخصم</TabsTrigger>
            <TabsTrigger value="logs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent font-bold min-w-[100px]">سجل العمليات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <StatsCards />
          </TabsContent>
          
          <TabsContent value="products">
            <ProductsTable />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersTable />
          </TabsContent>

          <TabsContent value="returns">
            <ReturnsTable />
          </TabsContent>

          <TabsContent value="customers">
            <CustomersTable />
          </TabsContent>

          <TabsContent value="coupons">
            <CouponsTable />
          </TabsContent>

          <TabsContent value="logs">
            <LogsTable />
          </TabsContent>
      </div>
    </Layout>
  );
}
