import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminPages() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pageName, setPageName] = useState("");
  const [pageContent, setPageContent] = useState("");
  const { toast } = useToast();

  const { data: pages = [] } = useQuery({
    queryKey: ["/api/pages"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/pages");
      return res.json();
    },
  });

  const createPageMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/pages", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      setIsCreateOpen(false);
      setPageNameAr("");
      setPageNameEn("");
      setPageContentAr("");
      setPageContentEn("");
      toast({ title: "تم إضافة الصفحة بنجاح" });
    },
  });

  const deletePageMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/pages/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({ title: "تم حذف الصفحة بنجاح" });
    },
  });

  const updatePageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const res = await apiRequest("PATCH", `/api/pages/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({ title: "تم تحديث الصفحة بنجاح" });
    },
  });

  const publishPageMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/pages/${id}/publish`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({ title: "تم نشر الصفحة بنجاح" });
    },
  });

  const filteredPages = (pages as any[]).filter((p: any) =>
    p.titleAr?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.titleEn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const predefinedPages = [
    { ar: "الأسئلة الشائعة", en: "FAQs" },
    { ar: "من نحن", en: "About Us" },
    { ar: "اتصل بنا", en: "Contact Us" },
    { ar: "سياسة الخصوصية", en: "Privacy Policy" },
    { ar: "شروط الاستخدام", en: "Terms of Use" }
  ];

  const getStatusBadge = (page: any) => {
    if (page.status === "draft") {
      return <Badge variant="secondary">مسودة</Badge>;
    }
    return <Badge variant="default">منشورة</Badge>;
  };

  const [pageNameAr, setPageNameAr] = useState("");
  const [pageNameEn, setPageNameEn] = useState("");
  const [pageContentAr, setPageContentAr] = useState("");
  const [pageContentEn, setPageContentEn] = useState("");

  return (
    <Layout>
      <div className="p-6 space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">الصفحات</h1>
            <p className="text-muted-foreground">أنشئ صفحات لتعريف العملاء بخدماتك</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 ml-2" />إضافة صفحة</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>إضافة صفحة جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>اسم الصفحة (بالعربية)</Label>
                    <Input value={pageNameAr} onChange={(e) => setPageNameAr(e.target.value)} placeholder="مثال: من نحن" />
                  </div>
                  <div>
                    <Label>Page Name (English)</Label>
                    <Input value={pageNameEn} onChange={(e) => setPageNameEn(e.target.value)} placeholder="Example: About Us" dir="ltr" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>المحتوى (بالعربية)</Label>
                    <Textarea value={pageContentAr} onChange={(e) => setPageContentAr(e.target.value)} placeholder="محتوى الصفحة بالعربية" rows={6} />
                  </div>
                  <div>
                    <Label>Content (English)</Label>
                    <Textarea value={pageContentEn} onChange={(e) => setPageContentEn(e.target.value)} placeholder="English content" rows={6} dir="ltr" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => createPageMutation.mutate({ 
                      titleAr: pageNameAr,
                      titleEn: pageNameEn,
                      contentAr: pageContentAr,
                      contentEn: pageContentEn,
                      slug: pageNameEn.toLowerCase().replace(/ /g, '-'),
                      status: "draft" 
                    })}
                  >
                    إضافة كمسودة
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => createPageMutation.mutate({ 
                      titleAr: pageNameAr,
                      titleEn: pageNameEn,
                      contentAr: pageContentAr,
                      contentEn: pageContentEn,
                      slug: pageNameEn.toLowerCase().replace(/ /g, '-'),
                      status: "published" 
                    })}
                  >
                    إضافة ونشر
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>صفحات مقترحة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predefinedPages.map(page => (
                <Button key={page.en} variant="outline" className="h-auto py-3 px-4 justify-start" onClick={() => {
                  setPageNameAr(page.ar);
                  setPageNameEn(page.en);
                  setIsCreateOpen(true);
                }}>
                  <Plus className="w-4 h-4 ml-2" />
                  {page.ar} / {page.en}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input placeholder="بحث عن صفحة..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم الصفحة</TableHead>
                    <TableHead>المحتوى</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ النشر</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPages.map((page: any) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">{page.titleAr} / {page.titleEn}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{page.contentAr?.substring(0, 50)}...</TableCell>
                      <TableCell>
                        {getStatusBadge(page)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {page.publishedAt ? new Date(page.publishedAt).toLocaleDateString("ar-SA") : "-"}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => window.open(`/pages/${page.slug}`, "_blank")}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {page.status === "draft" && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => publishPageMutation.mutate(page.id)}
                            title="نشر الآن"
                          >
                            <Plus className="w-4 h-4 text-primary" />
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[700px]">
                            <DialogHeader>
                              <DialogTitle>تعديل الصفحة</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>اسم الصفحة (بالعربية)</Label>
                                  <Input defaultValue={page.titleAr} id={`edit-title-ar-${page.id}`} />
                                </div>
                                <div>
                                  <Label>Page Name (English)</Label>
                                  <Input defaultValue={page.titleEn} id={`edit-title-en-${page.id}`} dir="ltr" />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>المحتوى (المسودة بالعربية)</Label>
                                  <Textarea defaultValue={page.draftContentAr || page.contentAr} id={`edit-content-ar-${page.id}`} rows={6} />
                                </div>
                                <div>
                                  <Label>Content (English Draft)</Label>
                                  <Textarea defaultValue={page.draftContentEn || page.contentEn} id={`edit-content-en-${page.id}`} rows={6} dir="ltr" />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="secondary"
                                  className="flex-1"
                                  onClick={() => {
                                    const titleAr = (document.getElementById(`edit-title-ar-${page.id}`) as HTMLInputElement).value;
                                    const titleEn = (document.getElementById(`edit-title-en-${page.id}`) as HTMLInputElement).value;
                                    const contentAr = (document.getElementById(`edit-content-ar-${page.id}`) as HTMLTextAreaElement).value;
                                    const contentEn = (document.getElementById(`edit-content-en-${page.id}`) as HTMLTextAreaElement).value;
                                    updatePageMutation.mutate({ 
                                      id: page.id, 
                                      data: { titleAr, titleEn, draftContentAr: contentAr, draftContentEn: contentEn, publish: false } 
                                    });
                                  }}
                                >
                                  حفظ كمسودة
                                </Button>
                                <Button
                                  className="flex-1"
                                  onClick={() => {
                                    const titleAr = (document.getElementById(`edit-title-ar-${page.id}`) as HTMLInputElement).value;
                                    const titleEn = (document.getElementById(`edit-title-en-${page.id}`) as HTMLInputElement).value;
                                    const contentAr = (document.getElementById(`edit-content-ar-${page.id}`) as HTMLTextAreaElement).value;
                                    const contentEn = (document.getElementById(`edit-content-en-${page.id}`) as HTMLTextAreaElement).value;
                                    updatePageMutation.mutate({ 
                                      id: page.id, 
                                      data: { titleAr, titleEn, draftContentAr: contentAr, draftContentEn: contentEn, publish: true } 
                                    });
                                  }}
                                >
                                  حفظ ونشر
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm" onClick={() => deletePageMutation.mutate(page.id)}>
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
