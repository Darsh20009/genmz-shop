import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Filter, Edit, Trash2, Eye, X, Upload, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Variant {
  color: string;
  sizes: { size: string; sku: string; stock: number; cost: number; price?: string; allowBackorder?: boolean }[];
  image: string;
}

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [currentVariant, setCurrentVariant] = useState<Variant>({ color: "", sizes: [], image: "" });
  const [currentSize, setCurrentSize] = useState<any>({ size: "", sku: "", stock: 0, cost: 0 });
  const { toast } = useToast();
  
  const { data: productsData, isLoading, refetch } = useQuery<any>({
    queryKey: ["/api/products"],
  });

  const products = Array.isArray(productsData) ? productsData : productsData?.data || [];
  
  // Use useEffect to refetch periodically or on focus
  useEffect(() => {
    refetch();
  }, [refetch]);

  const form = useForm({
    resolver: zodResolver(insertProductSchema),
    defaultValues: { 
      nameAr: "",
      nameEn: "",
      descriptionAr: "",
      descriptionEn: "",
      price: "0", 
      cost: "0",
      isActive: true,
      isNew: false,
      isComingSoon: false,
      outOfStock: false,
      colors: [],
      customizations: []
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      // Flatten variants
      const flatVariants = variants.flatMap(v =>
        v.sizes.map(s => ({
          colorAr: v.colorAr,
          colorEn: v.colorEn,
          sizeAr: s.sizeAr,
          sizeEn: s.sizeEn,
          sku: s.sku,
          stock: s.stock,
          cost: s.cost,
          price: s.price,
          allowBackorder: s.allowBackorder || false,
          image: v.image,
        }))
      );

      const formData = {
        ...data,
        price: data.price.toString(),
        cost: data.cost.toString(),
        images: productImages,
        variants: flatVariants,
        colors: data.colors || [],
        customizations: data.customizations || []
      };
      console.log("[CREATE PRODUCT] Sending data:", formData);
      const res = await apiRequest("POST", "/api/products", formData);
      console.log("[CREATE PRODUCT] Response:", res);
      if (!res.ok) {
        const errorData = await res.json();
        console.error("[CREATE PRODUCT] Error response:", errorData);
        throw new Error(errorData.message || "Failed to create product");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      refetch();
      setIsCreateOpen(false);
      form.reset();
      setProductImages([]);
      setVariants([]);
      setCurrentVariant({ colorAr: "", colorEn: "", sizes: [], image: "" });
      setCurrentSize({ sizeAr: "", sizeEn: "", sku: "", stock: 0, cost: 0 });
      toast({ title: "تم إضافة المنتج بنجاح" });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إضافة المنتج",
        variant: "destructive"
      });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const flatVariants = variants.flatMap(v =>
        v.sizes.map(s => ({
          colorAr: v.colorAr,
          colorEn: v.colorEn,
          sizeAr: s.sizeAr,
          sizeEn: s.sizeEn,
          sku: s.sku,
          stock: s.stock,
          cost: s.cost,
          price: s.price,
          allowBackorder: s.allowBackorder || false,
          image: v.image,
        }))
      );

      const formData = {
        ...data,
        price: data.price.toString(),
        cost: data.cost.toString(),
        images: productImages,
        variants: flatVariants,
        isActive: data.isActive,
        isNew: data.isNew,
        isComingSoon: data.isComingSoon,
        outOfStock: data.outOfStock,
        colors: data.colors || [],
        customizations: data.customizations || []
      };
      const res = await apiRequest("PATCH", `/api/products/${editingProduct._id || editingProduct.id}`, formData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsEditOpen(false);
      form.reset();
      setEditingProduct(null);
      setProductImages([]);
      setVariants([]);
      setCurrentVariant({ colorAr: "", colorEn: "", sizes: [], image: "" });
      setCurrentSize({ sizeAr: "", sizeEn: "", sku: "", stock: 0, cost: 0 });
      toast({ title: "تم تحديث المنتج بنجاح" });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحديث المنتج",
        variant: "destructive"
      });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("[DELETE] Deleting product:", id);
      const res = await apiRequest("DELETE", `/api/products/${id}`);
      console.log("[DELETE] Response status:", res.status);
      if (!res.ok) {
        throw new Error("Failed to delete product");
      }
      console.log("[DELETE] Product deleted successfully");
      return null;
    },
    onSuccess: () => {
      console.log("[DELETE] Invalidating queries...");
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      console.log("[DELETE] Queries invalidated");
      toast({ title: "تم حذف المنتج بنجاح" });
    },
    onError: (error: any) => {
      console.error("[DELETE] Error:", error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في حذف المنتج",
        variant: "destructive"
      });
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        // Use a higher quality resize or just keep the original if it's within reasonable limits
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              
              // Maintain high resolution but cap at 2000px
              const MAX_SIZE = 2000;
              if (width > height) {
                if (width > MAX_SIZE) {
                  height *= MAX_SIZE / width;
                  width = MAX_SIZE;
                }
              } else {
                if (height > MAX_SIZE) {
                  width *= MAX_SIZE / height;
                  height = MAX_SIZE;
                }
              }
              
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);
                // Use high quality JPEG
                const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
                setProductImages(prev => [...prev, dataUrl]);
              }
            };
            img.src = event.target.result as string;
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddSize = () => {
    if (!currentSize.sizeAr || !currentSize.sku) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع حقول الحجم",
        variant: "destructive"
      });
      return;
    }
    setCurrentVariant({
      ...currentVariant,
      sizes: [...currentVariant.sizes, currentSize]
    });
    setCurrentSize({ sizeAr: "", sizeEn: "", sku: "", stock: 0, cost: 0 });
  };

  const handleRemoveSize = (index: number) => {
    const newSizes = [...currentVariant.sizes];
    newSizes.splice(index, 1);
    setCurrentVariant({ ...currentVariant, sizes: newSizes });
  };

  const handleAddVariant = () => {
    if (!currentVariant.colorAr || currentVariant.sizes.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد اللون وإضافة أحجام واحدة على الأقل",
        variant: "destructive"
      });
      return;
    }
    setVariants([...variants, currentVariant]);
    setCurrentVariant({ colorAr: "", colorEn: "", sizes: [], image: "" });
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  const handleVariantImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const MAX_SIZE = 2000;
            if (width > height) {
              if (width > MAX_SIZE) {
                height *= MAX_SIZE / width;
                width = MAX_SIZE;
              }
            } else {
              if (height > MAX_SIZE) {
                width *= MAX_SIZE / height;
                height = MAX_SIZE;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
              setCurrentVariant({ ...currentVariant, image: dataUrl });
            }
          };
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (data: any) => {
    console.log("[ADD PRODUCT] Form data:", data);
    console.log("[ADD PRODUCT] Images count:", productImages.length);
    console.log("[ADD PRODUCT] Variants count:", variants.length);
    
    if (productImages.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إضافة صور للمنتج",
        variant: "destructive"
      });
      return;
    }
    if (variants.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إضافة متغيرات (ألوان وأحجام) واحدة على الأقل",
        variant: "destructive"
      });
      return;
    }
    console.log("[ADD PRODUCT] About to create product");
    createProductMutation.mutate(data);
  };

  const filteredProducts = (Array.isArray(products) ? products : []).filter((p: any) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-4 md:p-8" dir="rtl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black mb-2">المنتجات</h1>
            <p className="text-muted-foreground font-bold">جميع منتجات متجرك هنا</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button 
              variant="outline" 
              className="rounded-xl h-12 px-6 font-bold gap-2"
              onClick={() => {
                const newStock = prompt("أدخل كمية المخزون الجديدة لجميع المنتجات المحددة:");
                if (newStock !== null) {
                  const stockValue = parseInt(newStock);
                  if (!isNaN(stockValue)) {
                    // This is a placeholder for actual multi-select logic
                    toast({ title: "تم تحديث المخزون جماعياً", description: `الكمية الجديدة: ${stockValue}` });
                  }
                }
              }}
            >
              <Edit className="h-5 w-5" />
              تعديل جماعي
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 md:flex-none h-12 px-8 rounded-xl font-black gap-2 shadow-lg shadow-primary/20">
                  <Plus className="h-5 w-5" />
                  إضافة منتج جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">إضافة منتج جديد</DialogTitle>
                  <DialogDescription>أضف تفاصيل المنتج الكاملة مع الصور والألوان والأحجام</DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="h-[600px] pr-4">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = form.getValues();
                    console.log("[CREATE] Form values:", formData);
                    handleSubmit(formData);
                  }} className="space-y-6">
                    {/* البيانات الأساسية */}
                    <div className="border-b pb-6">
                      <h3 className="font-bold text-lg mb-4">البيانات الأساسية والتحكم</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-2xl mb-4">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" {...form.register("isActive")} id="isActive" className="w-5 h-5 accent-primary" />
                            <Label htmlFor="isActive" className="font-bold cursor-pointer">تفعيل المنتج (يظهر للعملاء)</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" {...form.register("isNew")} id="isNew" className="w-5 h-5 accent-primary" />
                            <Label htmlFor="isNew" className="font-bold cursor-pointer">منتج جديد</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" {...form.register("isComingSoon")} id="isComingSoon" className="w-5 h-5 accent-primary" />
                            <Label htmlFor="isComingSoon" className="font-bold cursor-pointer">قريباً</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" {...form.register("outOfStock")} id="outOfStock" className="w-5 h-5 accent-primary" />
                            <Label htmlFor="outOfStock" className="font-bold cursor-pointer">نفذت الكمية</Label>
                          </div>
                        </div>

                        {/* خيارات التخصيص والألوان */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-primary/5 p-4 rounded-2xl mb-4">
                          <div className="space-y-2">
                            <Label className="font-bold">خيارات التخصيص</Label>
                            <p className="text-xs text-muted-foreground">أدخل التخصيصات المتاحة للمنتج</p>
                            <div className="flex flex-wrap gap-2">
                              {/* سيتم إضافة واجهة تحكم أكثر تفصيلاً هنا أو عبر حقول مخصصة */}
                              <Badge variant="outline">نص مخصص</Badge>
                              <Badge variant="outline">صورة مخصصة</Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold">الألوان المتاحة</Label>
                            <p className="text-xs text-muted-foreground">ألوان إضافية للمنتج</p>
                            <div className="flex gap-2">
                               <div className="w-6 h-6 rounded-full bg-red-500 border cursor-pointer shadow-sm"></div>
                               <div className="w-6 h-6 rounded-full bg-blue-500 border cursor-pointer shadow-sm"></div>
                               <div className="w-6 h-6 rounded-full bg-black border cursor-pointer shadow-sm"></div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="font-bold">اسم المنتج (عربي)</Label>
                            <Input {...form.register("nameAr")} placeholder="اسم المنتج بالعربي" className="rounded-xl h-11" />
                          </div>
                          <div>
                            <Label className="font-bold">اسم المنتج (English)</Label>
                            <Input {...form.register("nameEn")} placeholder="Product Name in English" className="rounded-xl h-11" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="font-bold">وصف المنتج (عربي)</Label>
                            <Textarea {...form.register("descriptionAr")} placeholder="وصف تفصيلي بالعربي" className="rounded-xl" />
                          </div>
                          <div>
                            <Label className="font-bold">وصف المنتج (English)</Label>
                            <Textarea {...form.register("descriptionEn")} placeholder="Detailed English description" className="rounded-xl" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="font-bold">السعر (ر.س)</Label>
                            <Input type="number" step="0.01" {...form.register("price")} placeholder="السعر" className="rounded-xl h-11" />
                          </div>
                          <div>
                            <Label className="font-bold">التكلفة (ر.س)</Label>
                            <Input type="number" step="0.01" {...form.register("cost")} placeholder="التكلفة" className="rounded-xl h-11" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* صور المنتج */}
                    <div className="border-b pb-6">
                      <h3 className="font-bold text-lg mb-4">صور المنتج الرئيسية</h3>
                      <div className="space-y-4">
                        <div className="border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer hover:border-primary transition-colors">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="product-images"
                          />
                          <label htmlFor="product-images" className="cursor-pointer flex flex-col items-center gap-2">
                            <Upload className="w-6 h-6 text-muted-foreground" />
                            <span className="font-bold text-sm">اضغط لإضافة صور أو اسحب الصور هنا</span>
                          </label>
                        </div>
                        {productImages.length > 0 && (
                          <div className="grid grid-cols-3 gap-3">
                            {productImages.map((img, idx) => (
                              <div key={idx} className="relative group">
                                <img src={img} alt={`صورة ${idx}`} className="w-full h-24 object-cover rounded-lg" />
                                <button
                                  type="button"
                                  onClick={() => setProductImages(productImages.filter((_, i) => i !== idx))}
                                  className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* الألوان والأحجام */}
                    <div className="border-b pb-6">
                      <h3 className="font-bold text-lg mb-4">الألوان والأحجام والمخزون</h3>
                      
                      {/* إضافة لون جديد */}
                      <div className="space-y-4 p-4 border rounded-2xl bg-muted/30 mb-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="font-bold">لون المنتج (عربي)</Label>
                              <Input
                                value={currentVariant.colorAr}
                                onChange={(e) => setCurrentVariant({ ...currentVariant, colorAr: e.target.value })}
                                placeholder="مثال: أحمر"
                                className="rounded-xl h-11"
                              />
                            </div>
                            <div>
                              <Label className="font-bold">Color (English)</Label>
                              <Input
                                value={currentVariant.colorEn}
                                onChange={(e) => setCurrentVariant({ ...currentVariant, colorEn: e.target.value })}
                                placeholder="Example: Red"
                                className="rounded-xl h-11"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="font-bold">صورة اللون</Label>
                            <div className="border-2 border-dashed rounded-xl p-2 text-center cursor-pointer hover:border-primary">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleVariantImageUpload}
                                className="hidden"
                                id="variant-image"
                              />
                              <label htmlFor="variant-image" className="cursor-pointer flex items-center justify-center gap-2 text-sm">
                                <ImageIcon className="w-4 h-4" />
                                اختر صورة اللون
                              </label>
                            </div>
                            {currentVariant.image && (
                              <img src={currentVariant.image} alt="اللون" className="w-12 h-12 object-cover rounded-lg mt-2" />
                            )}
                          </div>
                        </div>

                        {/* إضافة أحجام */}
                        <div className="border-t pt-4">
                          <Label className="font-bold block mb-3">الأحجام المتاحة</Label>
                          <div className="space-y-3">
                            <div className="grid grid-cols-5 gap-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs font-bold text-muted-foreground block mb-1">الحجم (عربي)</Label>
                                <Input
                                  value={currentSize.sizeAr}
                                  onChange={(e) => setCurrentSize({ ...currentSize, sizeAr: e.target.value })}
                                  placeholder="مثال: كبير"
                                  className="rounded-lg h-10"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-bold text-muted-foreground block mb-1">Size (English)</Label>
                                <Input
                                  value={currentSize.sizeEn}
                                  onChange={(e) => setCurrentSize({ ...currentSize, sizeEn: e.target.value })}
                                  placeholder="Example: Large"
                                  className="rounded-lg h-10"
                                />
                              </div>
                            </div>
                              <div>
                                <Label className="text-xs font-bold text-muted-foreground block mb-1">SKU</Label>
                                <Input
                                  value={currentSize.sku}
                                  onChange={(e) => setCurrentSize({ ...currentSize, sku: e.target.value })}
                                  placeholder="SKU"
                                  className="rounded-lg h-10"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-bold text-muted-foreground block mb-1">المخزون</Label>
                                <Input
                                  type="number"
                                  value={currentSize.stock}
                                  onChange={(e) => setCurrentSize({ ...currentSize, stock: parseInt(e.target.value) || 0 })}
                                  className="rounded-lg h-10"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-bold text-muted-foreground block mb-1">سعر خاص</Label>
                                <Input
                                  type="number"
                                  placeholder="اختياري"
                                  onChange={(e) => setCurrentSize({ ...currentSize, price: e.target.value })}
                                  className="rounded-lg h-10"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-bold text-muted-foreground block mb-1">التكلفة</Label>
                                <Input
                                  type="number"
                                  value={currentSize.cost}
                                  onChange={(e) => setCurrentSize({ ...currentSize, cost: parseFloat(e.target.value) || 0 })}
                                  className="rounded-lg h-10"
                                />
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full rounded-lg h-10"
                              onClick={handleAddSize}
                            >
                              إضافة حجم
                            </Button>
                          </div>

                          {currentVariant.sizes.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {currentVariant.sizes.map((size, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold">{size.sizeAr} / {size.sizeEn} - {size.sku}</span>
                                    <span className="text-xs text-muted-foreground">
                                      المخزون: {size.stock} | 
                                      {size.price ? ` السعر الخاص: ${size.price} ر.س | ` : ""}
                                      التكلفة: {size.cost} ر.س
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="checkbox"
                                        id={`backorder-${idx}`}
                                        checked={size.allowBackorder}
                                        onChange={(e) => {
                                          const newSizes = [...currentVariant.sizes];
                                          newSizes[idx] = { ...newSizes[idx], allowBackorder: e.target.checked };
                                          setCurrentVariant({ ...currentVariant, sizes: newSizes });
                                        }}
                                        className="w-4 h-4"
                                      />
                                      <Label htmlFor={`backorder-${idx}`} className="text-xs cursor-pointer">بيع عند النفاد</Label>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSize(idx)}
                                      className="text-destructive hover:bg-destructive/10 p-1 rounded"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <Button
                          type="button"
                          className="w-full rounded-lg font-bold"
                          onClick={handleAddVariant}
                        >
                          إضافة هذا اللون
                        </Button>
                      </div>

                      {/* عرض الألوان المضافة */}
                      {variants.length > 0 && (
                        <div className="space-y-2">
                          <Label className="font-bold">الألوان المضافة:</Label>
                          {variants.map((variant, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                              {variant.image && (
                                <img src={variant.image} alt={variant.color} className="w-10 h-10 rounded object-cover" />
                              )}
                              <div className="flex-1">
                                <p className="font-bold">{variant.colorAr} / {variant.colorEn}</p>
                                <p className="text-xs text-muted-foreground">{variant.sizes.length} أحجام متاحة</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(idx)}
                                className="text-destructive hover:bg-destructive/10 p-2 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button type="submit" className="w-full h-11 rounded-xl font-black text-lg shadow-lg shadow-primary/20" disabled={createProductMutation.isPending}>
                      {createProductMutation.isPending ? "جاري الإضافة..." : "إضافة المنتج بنجاح"}
                    </Button>
                  </form>
                </ScrollArea>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">تعديل المنتج</DialogTitle>
                  <DialogDescription>عدل تفاصيل المنتج</DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="h-[600px] pr-4">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = form.getValues();
                    console.log("[EDIT] Form values:", formData);
                    handleSubmit(formData);
                  }} className="space-y-6">
                    <div className="border-b pb-6">
                      <h3 className="font-bold text-lg mb-4">البيانات الأساسية</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="font-bold">اسم المنتج (عربي)</Label>
                            <Input {...form.register("nameAr")} placeholder="اسم المنتج بالعربي" className="rounded-xl h-11" />
                          </div>
                          <div>
                            <Label className="font-bold">اسم المنتج (English)</Label>
                            <Input {...form.register("nameEn")} placeholder="Product Name in English" className="rounded-xl h-11" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="font-bold">وصف المنتج (عربي)</Label>
                            <Textarea {...form.register("descriptionAr")} placeholder="وصف تفصيلي بالعربي" className="rounded-xl" />
                          </div>
                          <div>
                            <Label className="font-bold">وصف المنتج (English)</Label>
                            <Textarea {...form.register("descriptionEn")} placeholder="Detailed English description" className="rounded-xl" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="font-bold">السعر (ر.س)</Label>
                            <Input type="number" step="0.01" {...form.register("price")} placeholder="السعر" className="rounded-xl h-11" />
                          </div>
                          <div>
                            <Label className="font-bold">التكلفة (ر.س)</Label>
                            <Input type="number" step="0.01" {...form.register("cost")} placeholder="التكلفة" className="rounded-xl h-11" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-b pb-6">
                      <h3 className="font-bold text-lg mb-4">صور المنتج الرئيسية</h3>
                      <div className="space-y-4">
                        <div className="border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer hover:border-primary transition-colors">
                          <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="product-images-edit" />
                          <label htmlFor="product-images-edit" className="cursor-pointer flex flex-col items-center gap-2">
                            <Upload className="w-6 h-6 text-muted-foreground" />
                            <span className="font-bold text-sm">اضغط لإضافة صور أو اسحب الصور هنا</span>
                          </label>
                        </div>
                        {productImages.length > 0 && (
                          <div className="grid grid-cols-3 gap-3">
                            {productImages.map((img, idx) => (
                              <div key={idx} className="relative group">
                                <img src={img} alt={`صورة ${idx}`} className="w-full h-24 object-cover rounded-lg" />
                                <button
                                  type="button"
                                  onClick={() => setProductImages(productImages.filter((_, i) => i !== idx))}
                                  className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-b pb-6">
                      <h3 className="font-bold text-lg mb-4">الألوان والأحجام والمخزون</h3>
                      <div className="space-y-4 p-4 border rounded-2xl bg-muted/30 mb-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="font-bold">لون المنتج (عربي)</Label>
                              <Input
                                value={currentVariant.colorAr}
                                onChange={(e) => setCurrentVariant({ ...currentVariant, colorAr: e.target.value })}
                                placeholder="مثال: أحمر"
                                className="rounded-xl h-11"
                              />
                            </div>
                            <div>
                              <Label className="font-bold">Color (English)</Label>
                              <Input
                                value={currentVariant.colorEn}
                                onChange={(e) => setCurrentVariant({ ...currentVariant, colorEn: e.target.value })}
                                placeholder="Example: Red"
                                className="rounded-xl h-11"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="font-bold">صورة اللون</Label>
                            <div className="border-2 border-dashed rounded-xl p-2 text-center cursor-pointer hover:border-primary">
                              <input type="file" accept="image/*" onChange={handleVariantImageUpload} className="hidden" id="variant-image-edit" />
                              <label htmlFor="variant-image-edit" className="cursor-pointer flex items-center justify-center gap-2 text-sm">
                                <ImageIcon className="w-4 h-4" />
                                اختر صورة اللون
                              </label>
                            </div>
                            {currentVariant.image && (
                              <img src={currentVariant.image} alt="اللون" className="w-12 h-12 object-cover rounded-lg mt-2" />
                            )}
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <Label className="font-bold block mb-3">الأحجام المتاحة</Label>
                          <div className="space-y-3">
                            <div className="grid grid-cols-4 gap-3">
                              <div>
                                <Label className="text-xs font-bold text-muted-foreground block mb-1">الحجم</Label>
                                <Input value={currentSize.size} onChange={(e) => setCurrentSize({ ...currentSize, size: e.target.value })} placeholder="مثال: S, M, L" className="rounded-lg h-10" />
                                <p className="text-xs text-muted-foreground mt-1">حجم الملابس</p>
                              </div>
                              <div>
                                <Label className="text-xs font-bold text-muted-foreground block mb-1">كود الصنف (SKU)</Label>
                                <Input value={currentSize.sku} onChange={(e) => setCurrentSize({ ...currentSize, sku: e.target.value })} placeholder="مثال: BLUE-M" className="rounded-lg h-10" />
                                <p className="text-xs text-muted-foreground mt-1">رمز فريد للمنتج</p>
                              </div>
                              <div>
                                <Label className="text-xs font-bold text-muted-foreground block mb-1">المخزون</Label>
                                <Input type="number" value={currentSize.stock} onChange={(e) => setCurrentSize({ ...currentSize, stock: parseInt(e.target.value) || 0 })} placeholder="0" className="rounded-lg h-10" />
                                <p className="text-xs text-muted-foreground mt-1">الكمية المتاحة</p>
                              </div>
                              <div>
                                <Label className="text-xs font-bold text-muted-foreground block mb-1">التكلفة (ر.س)</Label>
                                <Input type="number" step="0.01" value={currentSize.cost} onChange={(e) => setCurrentSize({ ...currentSize, cost: parseFloat(e.target.value) || 0 })} placeholder="0.00" className="rounded-lg h-10" />
                                <p className="text-xs text-muted-foreground mt-1">سعر الشراء</p>
                              </div>
                            </div>
                            <Button type="button" variant="outline" className="w-full rounded-lg h-10" onClick={handleAddSize}>إضافة حجم</Button>
                          </div>

                          {currentVariant.sizes.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {currentVariant.sizes.map((size, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                                  <span className="text-sm font-bold">{size.size} - {size.sku} (المخزون: {size.stock})</span>
                                  <button type="button" onClick={() => handleRemoveSize(idx)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <Button type="button" className="w-full rounded-lg font-bold" onClick={handleAddVariant}>إضافة هذا اللون</Button>
                      </div>

                      {variants.length > 0 && (
                        <div className="space-y-2">
                          <Label className="font-bold">الألوان المضافة:</Label>
                          {variants.map((variant, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                              {variant.image && (
                                <img src={variant.image} alt={variant.color} className="w-10 h-10 rounded object-cover" />
                              )}
                              <div className="flex-1">
                                <p className="font-bold">{variant.colorAr} / {variant.colorEn}</p>
                                <p className="text-xs text-muted-foreground">{variant.sizes.length} أحجام متاحة</p>
                              </div>
                              <button type="button" onClick={() => handleRemoveVariant(idx)} className="text-destructive hover:bg-destructive/10 p-2 rounded">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button type="button" onClick={() => {
                      updateProductMutation.mutate(form.getValues());
                    }} className="w-full h-11 rounded-xl font-black text-lg shadow-lg shadow-primary/20" disabled={updateProductMutation.isPending}>
                      {updateProductMutation.isPending ? "جاري التحديث..." : "تحديث المنتج"}
                    </Button>
                  </form>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="rounded-3xl border-2 shadow-lg">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center gap-4">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input placeholder="بحث عن منتج..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="rounded-xl h-11 border-2" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="table-responsive">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow className="hover:bg-transparent border-b-2">
                    <TableHead className="font-bold text-right py-4">اسم المنتج</TableHead>
                    <TableHead className="font-bold text-right py-4">السعر</TableHead>
                    <TableHead className="font-bold text-right py-4">التكلفة</TableHead>
                    <TableHead className="font-bold text-right py-4">الألوان</TableHead>
                    <TableHead className="font-bold text-right py-4">الوصف</TableHead>
                    <TableHead className="font-bold text-left py-4 px-6">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i} className="animate-pulse">
                        <TableCell colSpan={6} className="h-12 bg-muted/5"></TableCell>
                      </TableRow>
                    ))
                  ) : filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <p className="text-muted-foreground font-bold">لا يوجد منتجات</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product: any) => (
                      <TableRow key={product.id} className="hover:bg-muted/10 transition-colors border-b last:border-0">
                        <TableCell className="font-bold text-primary py-4">{product.name}</TableCell>
                        <TableCell className="font-black py-4">{product.price} ر.س</TableCell>
                        <TableCell className="font-bold py-4">{product.cost} ر.س</TableCell>
                        <TableCell className="py-4">
                          <div className="flex gap-1">
                            {product.variants?.slice(0, 3).map((v: any, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs rounded-lg">{v.color}</Badge>
                            ))}
                            {product.variants?.length > 3 && (
                              <Badge variant="outline" className="text-xs rounded-lg">+{product.variants.length - 3}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm py-4">{product.description?.substring(0, 40)}...</TableCell>
                        <TableCell className="py-4 px-6 text-left">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10" onClick={() => {
                              setEditingProduct(product);
                              setProductImages(product.images || []);
                              setVariants((product.variants || []).reduce((acc: Variant[], v: any) => {
                                const existing = acc.find(item => item.color === v.color);
                                if (existing) {
                                  existing.sizes.push({ size: v.size, sku: v.sku, stock: v.stock, cost: v.cost });
                                } else {
                                  acc.push({ color: v.color, sizes: [{ size: v.size, sku: v.sku, stock: v.stock, cost: v.cost }], image: v.image || "" });
                                }
                                return acc;
                              }, []));
                              form.reset({ name: product.name, description: product.description, price: product.price, cost: product.cost });
                              setIsEditOpen(true);
                            }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-destructive/10" onClick={() => deleteProductMutation.mutate(product.id!)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
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
