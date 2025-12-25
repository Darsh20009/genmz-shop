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
import { Loader2, Plus, DollarSign, ShoppingCart, TrendingUp, BarChart3, ArrowUpRight } from "lucide-react";
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
      isFeatured: false
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
        <h2 className="text-2xl font-bold">المنتجات</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> إضافة منتج</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إضافة منتج جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم المنتج</Label>
                  <Input {...form.register("name")} />
                </div>
                <div className="space-y-2">
                  <Label>السعر</Label>
                  <Input type="number" {...form.register("price")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Textarea {...form.register("description")} />
              </div>
              <div className="space-y-2">
                <Label>التكلفة (للحسابات)</Label>
                <Input type="number" {...form.register("cost")} />
              </div>
              <Button type="submit" disabled={createProduct.isPending}>
                {createProduct.isPending ? "جاري الحفظ..." : "حفظ المنتج"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <div className="p-4 grid grid-cols-4 font-bold bg-muted/50">
          <div>الاسم</div>
          <div>السعر</div>
          <div>التكلفة</div>
          <div>مميز</div>
        </div>
        <div className="divide-y">
          {products?.map(product => (
            <div key={product.id} className="p-4 grid grid-cols-4 items-center">
              <div>{product.name}</div>
              <div>{Number(product.price).toLocaleString()} ر.س</div>
              <div>{Number(product.cost).toLocaleString()} ر.س</div>
              <div>{product.isFeatured ? "نعم" : "لا"}</div>
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
      <div className="container py-8">
        <h1 className="font-display text-3xl font-bold mb-8">لوحة التحكم</h1>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="products">المنتجات</TabsTrigger>
            <TabsTrigger value="orders">الطلبات</TabsTrigger>
            <TabsTrigger value="customers">العملاء</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <StatsCards />
          </TabsContent>
          
          <TabsContent value="products">
            <ProductsTable />
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                جدول الطلبات (قيد التطوير)
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
