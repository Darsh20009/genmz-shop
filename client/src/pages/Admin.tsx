import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useProducts, useCreateProduct } from "@/hooks/use-products";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React, { useState, useMemo, memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct } from "@shared/schema";
import { Loader2, Plus, DollarSign, ShoppingCart, TrendingUp, BarChart3, ArrowUpRight, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  const createProduct = useCreateProduct();
  const [open, setOpen] = useState(false);

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "0",
      cost: "0",
      images: [],
      variants: [],
      isFeatured: false,
    }
  });

  const onSubmit = (data: InsertProduct) => {
    createProduct.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  if (isLoading) return <Loader2 className="animate-spin" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold uppercase tracking-tight">المنتجات</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-none font-bold uppercase tracking-widest text-xs h-10 px-6">
              <Plus className="ml-2 h-4 w-4" /> إضافة منتج
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-none border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-right font-black uppercase tracking-tight">إضافة منتج جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-8" dir="rtl">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-black/40">اسم المنتج</Label>
                  <Input {...form.register("name")} className="rounded-none h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-black/40">السعر (ر.س)</Label>
                  <Input type="number" {...form.register("price")} className="rounded-none h-12" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-black/40">الوصف</Label>
                <Textarea {...form.register("description")} className="rounded-none min-h-[100px]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-black/40">التكلفة (للحسابات)</Label>
                <Input type="number" {...form.register("cost")} className="rounded-none h-12" />
              </div>
              <Button type="submit" disabled={createProduct.isPending} className="w-full h-14 rounded-none font-black uppercase tracking-widest">
                {createProduct.isPending ? <Loader2 className="animate-spin" /> : "حفظ المنتج"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-none border border-black/5 overflow-hidden">
        <div className="p-6 grid grid-cols-4 font-black uppercase tracking-widest text-[10px] bg-secondary/20 text-black/40 border-b border-black/5">
          <div className="text-right">الاسم</div>
          <div className="text-right">السعر</div>
          <div className="text-right">التكلفة</div>
          <div className="text-right">مميز</div>
        </div>
        <div className="divide-y divide-black/5">
          {products?.map(product => (
            <div key={product.id} className="p-6 grid grid-cols-4 items-center hover:bg-secondary/10 transition-colors">
              <div className="font-bold">{product.name}</div>
              <div className="font-black tracking-tighter">{Number(product.price).toLocaleString()} ر.س</div>
              <div className="font-bold text-black/40">{Number(product.cost).toLocaleString()} ر.س</div>
              <div>
                <Badge variant={product.isFeatured ? "default" : "outline"} className="rounded-none font-bold text-[8px] uppercase tracking-widest">
                  {product.isFeatured ? "نعم" : "لا"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

const OrdersTable = memo(() => {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    }
  });

  if (isLoading) return <Loader2 className="animate-spin mx-auto" />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold uppercase tracking-tight">الطلبات</h2>
      <div className="rounded-none border border-black/5 overflow-hidden">
        <div className="p-6 grid grid-cols-5 font-black uppercase tracking-widest text-[10px] bg-secondary/20 text-black/40 border-b border-black/5">
          <div className="text-right">رقم الطلب</div>
          <div className="text-right">العميل</div>
          <div className="text-right">المبلغ</div>
          <div className="text-right">الحالة</div>
          <div className="text-right">التاريخ</div>
        </div>
        <div className="divide-y divide-black/5">
          {orders?.map((order: any) => (
            <div key={order.id} className="p-6 grid grid-cols-5 items-center hover:bg-secondary/10 transition-colors">
              <div className="font-black">#{order.id.slice(-6).toUpperCase()}</div>
              <div className="font-bold">عميل</div>
              <div className="font-black tracking-tighter">{Number(order.total).toLocaleString()} ر.س</div>
              <div>
                <Badge className="rounded-none font-bold text-[8px] uppercase tracking-widest">{order.status}</Badge>
              </div>
              <div className="text-xs text-black/40">{new Date(order.createdAt).toLocaleDateString("ar-SA")}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

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
      <h2 className="text-2xl font-bold uppercase tracking-tight">العملاء</h2>
      <div className="rounded-none border border-black/5 overflow-hidden">
        <div className="p-6 grid grid-cols-4 font-black uppercase tracking-widest text-[10px] bg-secondary/20 text-black/40 border-b border-black/5">
          <div className="text-right">الاسم</div>
          <div className="text-right">البريد الإلكتروني</div>
          <div className="text-right">رقم الهاتف</div>
          <div className="text-right">المحفظة</div>
        </div>
        <div className="divide-y divide-black/5">
          {users?.map((u: any) => (
            <div key={u.id} className="p-6 grid grid-cols-4 items-center hover:bg-secondary/10 transition-colors">
              <div className="font-bold">{u.name}</div>
              <div className="text-sm">{u.email}</div>
              <div className="text-sm font-bold">{u.phone || "-"}</div>
              <div className="font-black tracking-tighter text-green-600">{u.walletBalance} ر.س</div>
            </div>
          ))}
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
        
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-12 p-0 space-x-reverse space-x-8">
            <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent font-bold">نظرة عامة</TabsTrigger>
            <TabsTrigger value="products" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent font-bold">المنتجات</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent font-bold">الطلبات</TabsTrigger>
            <TabsTrigger value="customers" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent font-bold">العملاء</TabsTrigger>
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

          <TabsContent value="customers">
            <CustomersTable />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
