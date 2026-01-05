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
      setPageName("");
      setPageContent("");
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

  const filteredPages = (pages as any[]).filter((p: any) =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const predefinedPages = ["الأسئلة الشائعة", "من نحن", "اتصل بنا", "سياسة الخصوصية", "شروط الاستخدام"];

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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة صفحة جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>اسم الصفحة</Label>
                  <Input value={pageName} onChange={(e) => setPageName(e.target.value)} placeholder="اسم الصفحة" />
                </div>
                <div>
                  <Label>المحتوى</Label>
                  <Textarea value={pageContent} onChange={(e) => setPageContent(e.target.value)} placeholder="محتوى الصفحة" rows={6} />
                </div>
                <Button
                  className="w-full"
                  onClick={() => createPageMutation.mutate({ title: pageName, content: pageContent })}
                >
                  إضافة الصفحة
                </Button>
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
              {predefinedPages.map(pageName => (
                <Button key={pageName} variant="outline" className="h-auto py-3 px-4 justify-start">
                  <Plus className="w-4 h-4 ml-2" />
                  {pageName}
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
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPages.map((page: any) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">{page.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{page.content?.substring(0, 50)}</TableCell>
                      <TableCell>
                        <Badge variant="default">منشورة</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
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
