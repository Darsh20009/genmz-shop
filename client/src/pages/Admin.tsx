import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useProducts, useCreateProduct } from "@/hooks/use-products";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct } from "@shared/schema";
import { Loader2, Plus, DollarSign, Package, Users, ShoppingCart } from "lucide-react";
import { z } from "zod";

// Admin Dashboard Components

function StatsCards() {
  const { data: orders } = useQuery({ 
    queryKey: [api.orders.list.path],
    queryFn: async () => {
       const res = await fetch(api.orders.list.path);
       return res.json();
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المبيعات</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">45,231.89 ر.س</div>
          <p className="text-xs text-muted-foreground">+20.1% من الشهر الماضي</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">الطلبات</CardTitle>
          <ShoppingCart className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+573</div>
          <p className="text-xs text-muted-foreground">+201 منذ آخر ساعة</p>
        </CardContent>
      </Card>
      {/* More stats... */}
    </div>
  );
}

function ProductsTable() {
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
    // Ensuring numbers are strings for decimal fields if schema expects strings, or handle conversion
    // Our schema expects 'decimal' which is string in JS usually when using Drizzle
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
              {/* Simplified for demo - would need variant/image array handling UI */}
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
}

export default function Admin() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  
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
            {/* Chart placeholders would go here */}
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
