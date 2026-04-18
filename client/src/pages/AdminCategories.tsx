import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminCategories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [categoryNameAr, setCategoryNameAr] = useState("");
  const [categoryNameEn, setCategoryNameEn] = useState("");
  const [categoryDescAr, setCategoryDescAr] = useState("");
  const [categoryDescEn, setCategoryDescEn] = useState("");
  const { toast } = useToast();

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/categories");
      return res.json();
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/categories", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsCreateOpen(false);
      setCategoryNameAr("");
      setCategoryNameEn("");
      setCategoryDescAr("");
      setCategoryDescEn("");
      toast({ title: "تم إضافة التصنيف بنجاح" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/categories/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "تم حذف التصنيف بنجاح" });
    },
  });

  const filteredCategories = (categories as any[]).filter((c: any) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6 space-y-6" dir="rtl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black mb-2">التصنيفات</h1>
            <p className="text-muted-foreground font-bold">إدارة تصنيفات متجرك مع إضافة صور وأوصاف مخصصة.</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl h-12 px-8 font-black gap-2">
                <Plus className="h-5 w-5" />
                إضافة تصنيف جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة تصنيف جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>اسم التصنيف (عربي)</Label>
                    <Input value={categoryNameAr} onChange={(e) => setCategoryNameAr(e.target.value)} placeholder="اسم التصنيف بالعربي" />
                  </div>
                  <div>
                    <Label>Category Name (English)</Label>
                    <Input value={categoryNameEn} onChange={(e) => setCategoryNameEn(e.target.value)} placeholder="Category name in English" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>الوصف (عربي)</Label>
                    <Textarea value={categoryDescAr} onChange={(e) => setCategoryDescAr(e.target.value)} placeholder="وصف التصنيف بالعربي" />
                  </div>
                  <div>
                    <Label>Description (English)</Label>
                    <Textarea value={categoryDescEn} onChange={(e) => setCategoryDescEn(e.target.value)} placeholder="English description" />
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => createCategoryMutation.mutate({ 
                    nameAr: categoryNameAr, 
                    nameEn: categoryNameEn,
                    descriptionAr: categoryDescAr,
                    descriptionEn: categoryDescEn,
                    slug: (categoryNameEn || categoryNameAr).toLowerCase().replace(/ /g, '-')
                  })}
                >
                  إضافة التصنيف
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input placeholder="بحث عن تصنيف..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم التصنيف</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category: any) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.nameAr} / {category.nameEn}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{category.descriptionAr?.substring(0, 50)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteCategoryMutation.mutate(category.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
