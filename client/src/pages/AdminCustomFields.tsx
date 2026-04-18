import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Plus, Trash2, Edit, FileText, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function AdminCustomFields() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    type: "text",
    isRequired: false,
    isActive: true,
  });

  const { data: customFields = [], isLoading } = useQuery({
    queryKey: ["/api/admin/custom-fields"],
    queryFn: async () => {
      // Mock data for now since we don't have the backend endpoint yet
      return [
        { id: "1", nameAr: "المقاس", nameEn: "Size", type: "select", isRequired: true, isActive: true },
        { id: "2", nameAr: "ملاحظات إضافية", nameEn: "Additional Notes", type: "textarea", isRequired: false, isActive: true },
      ];
    },
  });

  const fieldMutation = useMutation({
    mutationFn: async (data: any) => {
      const method = editingField ? "PATCH" : "POST";
      const url = editingField 
        ? `/api/admin/custom-fields/${editingField.id}`
        : "/api/admin/custom-fields";
      const res = await apiRequest(method, url, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/custom-fields"] });
      toast({ title: editingField ? "تم تحديث الحقل" : "تم إضافة الحقل بنجاح" });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/custom-fields/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/custom-fields"] });
      toast({ title: "تم حذف الحقل" });
    },
  });

  const resetForm = () => {
    setFormData({
      nameAr: "",
      nameEn: "",
      type: "text",
      isRequired: false,
      isActive: true,
    });
    setEditingField(null);
  };

  const handleEdit = (field: any) => {
    setEditingField(field);
    setFormData({
      nameAr: field.nameAr,
      nameEn: field.nameEn,
      type: field.type,
      isRequired: field.isRequired,
      isActive: field.isActive,
    });
    setIsDialogOpen(true);
  };

  const filteredFields = customFields.filter((f: any) =>
    f.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6 space-y-6" dir="rtl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black">الحقول المخصصة</h1>
            <p className="text-muted-foreground">أضف حقول مخصصة لمنتجاتك لجمع معلومات إضافية من العملاء.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="w-4 h-4" />
                إضافة حقل جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
              <DialogHeader>
                <DialogTitle>{editingField ? "تعديل حقل" : "إضافة حقل مخصص جديد"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>اسم الحقل (بالعربي)</Label>
                  <Input 
                    value={formData.nameAr} 
                    onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
                    placeholder="مثال: رقم الهوية"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>اسم الحقل (بالإنجليزي)</Label>
                  <Input 
                    value={formData.nameEn} 
                    onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                    placeholder="Example: ID Number"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>نوع الحقل</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({...formData, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">نص قصير</SelectItem>
                      <SelectItem value="textarea">نص طويل</SelectItem>
                      <SelectItem value="number">رقم</SelectItem>
                      <SelectItem value="date">تاريخ</SelectItem>
                      <SelectItem value="select">قائمة منسدلة</SelectItem>
                      <SelectItem value="file">رفع ملف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label>حقل مطلوب؟</Label>
                  <Switch 
                    checked={formData.isRequired} 
                    onCheckedChange={(checked) => setFormData({...formData, isRequired: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>حالة الحقل (نشط)</Label>
                  <Switch 
                    checked={formData.isActive} 
                    onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  className="w-full rounded-xl" 
                  onClick={() => fieldMutation.mutate(formData)}
                  disabled={fieldMutation.isPending}
                >
                  {fieldMutation.isPending ? "جاري الحفظ..." : "حفظ الحقل"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-white/50 backdrop-blur-sm border-b pb-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="بحث في الحقول..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pr-10 rounded-xl" 
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-right">اسم الحقل</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-center">مطلوب</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFields.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <FileText className="w-12 h-12 mb-4 opacity-10" />
                          <p className="text-lg font-bold">لا توجد حقول مخصصة</p>
                          <p className="text-sm">ابدأ بإضافة أول حقل مخصص لمنتجاتك</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFields.map((field: any) => (
                      <TableRow key={field.id} className="group hover:bg-muted/20 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold">{field.nameAr}</span>
                            <span className="text-xs text-muted-foreground">{field.nameEn}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-lg font-medium">
                            {field.type === 'text' && 'نص قصير'}
                            {field.type === 'textarea' && 'نص طويل'}
                            {field.type === 'number' && 'رقم'}
                            {field.type === 'date' && 'تاريخ'}
                            {field.type === 'select' && 'قائمة منسدلة'}
                            {field.type === 'file' && 'رفع ملف'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {field.isRequired ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`rounded-lg ${field.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {field.isActive ? 'نشط' : 'معطل'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-left">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-xl hover:bg-primary/10 hover:text-primary"
                              onClick={() => handleEdit(field)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-xl hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => {
                                if (confirm("هل أنت متأكد من حذف هذا الحقل؟")) {
                                  deleteMutation.mutate(field.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
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
