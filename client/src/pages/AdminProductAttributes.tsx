import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Palette, Ruler, Tag, Boxes, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminProductAttributes() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("colors");

  const { data: colors = [], isLoading: colorsLoading } = useQuery<any[]>({
    queryKey: ["/api/colors"],
  });

  const { data: sizes = [], isLoading: sizesLoading } = useQuery<any[]>({
    queryKey: ["/api/sizes"],
  });

  const { data: sizeGroups = [], isLoading: sizeGroupsLoading } = useQuery<any[]>({
    queryKey: ["/api/size-groups"],
  });

  const { data: brands = [], isLoading: brandsLoading } = useQuery<any[]>({
    queryKey: ["/api/brands"],
  });

  const { data: attributes = [], isLoading: attributesLoading } = useQuery<any[]>({
    queryKey: ["/api/attributes"],
  });

  return (
    <Layout>
      <div className="p-6" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">خصائص المنتجات</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mb-6">
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              الألوان
            </TabsTrigger>
            <TabsTrigger value="sizes" className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              الأحجام
            </TabsTrigger>
            <TabsTrigger value="brands" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              العلامات التجارية
            </TabsTrigger>
            <TabsTrigger value="attributes" className="flex items-center gap-2">
              <Boxes className="h-4 w-4" />
              خصائص مخصصة
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colors">
            <ColorsSection colors={colors} isLoading={colorsLoading} toast={toast} />
          </TabsContent>

          <TabsContent value="sizes">
            <SizesSection sizes={sizes} sizeGroups={sizeGroups} isLoading={sizesLoading || sizeGroupsLoading} toast={toast} />
          </TabsContent>

          <TabsContent value="brands">
            <BrandsSection brands={brands} isLoading={brandsLoading} toast={toast} />
          </TabsContent>

          <TabsContent value="attributes">
            <AttributesSection attributes={attributes} isLoading={attributesLoading} toast={toast} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function ColorsSection({ colors, isLoading, toast }: { colors: any[], isLoading: boolean, toast: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<any>(null);
  const [formData, setFormData] = useState({ nameAr: "", nameEn: "", hexCode: "#000000", order: 0 });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/colors", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/colors"] });
      setIsOpen(false);
      setFormData({ nameAr: "", nameEn: "", hexCode: "#000000", order: 0 });
      toast({ title: "تم إضافة اللون بنجاح" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => apiRequest("PATCH", `/api/admin/colors/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/colors"] });
      setEditingColor(null);
      toast({ title: "تم تحديث اللون بنجاح" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/colors/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/colors"] });
      toast({ title: "تم حذف اللون بنجاح" });
    },
  });

  const handleSubmit = () => {
    if (editingColor) {
      updateMutation.mutate({ id: editingColor.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEdit = (color: any) => {
    setFormData({ nameAr: color.nameAr, nameEn: color.nameEn, hexCode: color.hexCode || "#000000", order: color.order || 0 });
    setEditingColor(color);
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          إدارة الألوان
        </CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-color">
              <Plus className="h-4 w-4 ml-2" />
              إضافة لون
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة لون جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>الاسم بالعربية</Label>
                <Input
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  data-testid="input-color-name-ar"
                />
              </div>
              <div>
                <Label>الاسم بالإنجليزية</Label>
                <Input
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  data-testid="input-color-name-en"
                />
              </div>
              <div>
                <Label>الكود اللوني</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    value={formData.hexCode}
                    onChange={(e) => setFormData({ ...formData, hexCode: e.target.value })}
                    className="w-16 h-10 p-1"
                    data-testid="input-color-hex"
                  />
                  <Input
                    value={formData.hexCode}
                    onChange={(e) => setFormData({ ...formData, hexCode: e.target.value })}
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div>
                <Label>الترتيب</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  data-testid="input-color-order"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit} disabled={createMutation.isPending} data-testid="button-save-color">
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اللون</TableHead>
              <TableHead>الاسم بالعربية</TableHead>
              <TableHead>الاسم بالإنجليزية</TableHead>
              <TableHead>الكود</TableHead>
              <TableHead>الترتيب</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {colors.map((color) => (
              <TableRow key={color.id}>
                <TableCell>
                  <div 
                    className="w-8 h-8 rounded-full border" 
                    style={{ backgroundColor: color.hexCode || "#ccc" }}
                  />
                </TableCell>
                <TableCell>{color.nameAr}</TableCell>
                <TableCell>{color.nameEn}</TableCell>
                <TableCell>
                  <Badge variant="outline">{color.hexCode}</Badge>
                </TableCell>
                <TableCell>{color.order || 0}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog open={editingColor?.id === color.id} onOpenChange={(open) => !open && setEditingColor(null)}>
                      <DialogTrigger asChild>
                        <Button size="icon" variant="ghost" onClick={() => openEdit(color)} data-testid={`button-edit-color-${color.id}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent dir="rtl">
                        <DialogHeader>
                          <DialogTitle>تعديل اللون</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>الاسم بالعربية</Label>
                            <Input
                              value={formData.nameAr}
                              onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>الاسم بالإنجليزية</Label>
                            <Input
                              value={formData.nameEn}
                              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>الكود اللوني</Label>
                            <div className="flex gap-2 items-center">
                              <Input
                                type="color"
                                value={formData.hexCode}
                                onChange={(e) => setFormData({ ...formData, hexCode: e.target.value })}
                                className="w-16 h-10 p-1"
                              />
                              <Input
                                value={formData.hexCode}
                                onChange={(e) => setFormData({ ...formData, hexCode: e.target.value })}
                              />
                            </div>
                          </div>
                          <div>
                            <Label>الترتيب</Label>
                            <Input
                              type="number"
                              value={formData.order}
                              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "تحديث"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => deleteMutation.mutate(color.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-color-${color.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {colors.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  لا توجد ألوان مسجلة
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SizesSection({ sizes, sizeGroups, isLoading, toast }: { sizes: any[], sizeGroups: any[], isLoading: boolean, toast: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<any>(null);
  const [formData, setFormData] = useState({ nameAr: "", nameEn: "", code: "", groupId: "", order: 0 });
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [groupData, setGroupData] = useState({ nameAr: "", nameEn: "" });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/sizes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sizes"] });
      setIsOpen(false);
      setFormData({ nameAr: "", nameEn: "", code: "", groupId: "", order: 0 });
      toast({ title: "تم إضافة الحجم بنجاح" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => apiRequest("PATCH", `/api/admin/sizes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sizes"] });
      setEditingSize(null);
      toast({ title: "تم تحديث الحجم بنجاح" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/sizes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sizes"] });
      toast({ title: "تم حذف الحجم بنجاح" });
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/size-groups", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/size-groups"] });
      setIsGroupOpen(false);
      setGroupData({ nameAr: "", nameEn: "" });
      toast({ title: "تم إضافة مجموعة الأحجام بنجاح" });
    },
  });

  const handleSubmit = () => {
    if (editingSize) {
      updateMutation.mutate({ id: editingSize.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEdit = (size: any) => {
    setFormData({ nameAr: size.nameAr, nameEn: size.nameEn, code: size.code || "", groupId: size.groupId || "", order: size.order || 0 });
    setEditingSize(size);
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            مجموعات الأحجام
          </CardTitle>
          <Dialog open={isGroupOpen} onOpenChange={setIsGroupOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-add-size-group">
                <Plus className="h-4 w-4 ml-2" />
                إضافة مجموعة
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>إضافة مجموعة أحجام</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>الاسم بالعربية</Label>
                  <Input
                    value={groupData.nameAr}
                    onChange={(e) => setGroupData({ ...groupData, nameAr: e.target.value })}
                    placeholder="مثال: أحجام الملابس"
                    data-testid="input-size-group-name-ar"
                  />
                </div>
                <div>
                  <Label>الاسم بالإنجليزية</Label>
                  <Input
                    value={groupData.nameEn}
                    onChange={(e) => setGroupData({ ...groupData, nameEn: e.target.value })}
                    placeholder="e.g. Clothing Sizes"
                    data-testid="input-size-group-name-en"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => createGroupMutation.mutate(groupData)} disabled={createGroupMutation.isPending}>
                  {createGroupMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {sizeGroups.map((group) => (
              <Badge key={group.id} variant="secondary" className="text-sm py-1 px-3">
                {group.nameAr} / {group.nameEn}
              </Badge>
            ))}
            {sizeGroups.length === 0 && (
              <p className="text-muted-foreground">لا توجد مجموعات أحجام</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>إدارة الأحجام</CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-size">
                <Plus className="h-4 w-4 ml-2" />
                إضافة حجم
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>إضافة حجم جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>الاسم بالعربية</Label>
                  <Input
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    data-testid="input-size-name-ar"
                  />
                </div>
                <div>
                  <Label>الاسم بالإنجليزية</Label>
                  <Input
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    data-testid="input-size-name-en"
                  />
                </div>
                <div>
                  <Label>الكود</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="XL, L, M, S"
                    data-testid="input-size-code"
                  />
                </div>
                <div>
                  <Label>المجموعة</Label>
                  <Select value={formData.groupId} onValueChange={(v) => setFormData({ ...formData, groupId: v })}>
                    <SelectTrigger data-testid="select-size-group">
                      <SelectValue placeholder="اختر المجموعة" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizeGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.nameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>الترتيب</Label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    data-testid="input-size-order"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم بالعربية</TableHead>
                <TableHead>الاسم بالإنجليزية</TableHead>
                <TableHead>الكود</TableHead>
                <TableHead>المجموعة</TableHead>
                <TableHead>الترتيب</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sizes.map((size) => {
                const group = sizeGroups.find(g => g.id === size.groupId);
                return (
                  <TableRow key={size.id}>
                    <TableCell>{size.nameAr}</TableCell>
                    <TableCell>{size.nameEn}</TableCell>
                    <TableCell><Badge variant="outline">{size.code}</Badge></TableCell>
                    <TableCell>{group?.nameAr || "-"}</TableCell>
                    <TableCell>{size.order || 0}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog open={editingSize?.id === size.id} onOpenChange={(open) => !open && setEditingSize(null)}>
                          <DialogTrigger asChild>
                            <Button size="icon" variant="ghost" onClick={() => openEdit(size)} data-testid={`button-edit-size-${size.id}`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent dir="rtl">
                            <DialogHeader>
                              <DialogTitle>تعديل الحجم</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>الاسم بالعربية</Label>
                                <Input
                                  value={formData.nameAr}
                                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label>الاسم بالإنجليزية</Label>
                                <Input
                                  value={formData.nameEn}
                                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label>الكود</Label>
                                <Input
                                  value={formData.code}
                                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label>المجموعة</Label>
                                <Select value={formData.groupId} onValueChange={(v) => setFormData({ ...formData, groupId: v })}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر المجموعة" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {sizeGroups.map((group) => (
                                      <SelectItem key={group.id} value={group.id}>
                                        {group.nameAr}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>الترتيب</Label>
                                <Input
                                  type="number"
                                  value={formData.order}
                                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "تحديث"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => deleteMutation.mutate(size.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-size-${size.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {sizes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    لا توجد أحجام مسجلة
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function BrandsSection({ brands, isLoading, toast }: { brands: any[], isLoading: boolean, toast: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [formData, setFormData] = useState({ nameAr: "", nameEn: "", slug: "", logo: "", description: "", order: 0, isActive: true });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/brands", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      setIsOpen(false);
      setFormData({ nameAr: "", nameEn: "", slug: "", logo: "", description: "", order: 0, isActive: true });
      toast({ title: "تم إضافة العلامة التجارية بنجاح" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => apiRequest("PATCH", `/api/admin/brands/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      setEditingBrand(null);
      toast({ title: "تم تحديث العلامة التجارية بنجاح" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/brands/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      toast({ title: "تم حذف العلامة التجارية بنجاح" });
    },
  });

  const handleSubmit = () => {
    if (editingBrand) {
      updateMutation.mutate({ id: editingBrand.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEdit = (brand: any) => {
    setFormData({ 
      nameAr: brand.nameAr, 
      nameEn: brand.nameEn, 
      slug: brand.slug || "", 
      logo: brand.logo || "", 
      description: brand.description || "",
      order: brand.order || 0,
      isActive: brand.isActive !== false
    });
    setEditingBrand(brand);
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          إدارة العلامات التجارية
        </CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-brand">
              <Plus className="h-4 w-4 ml-2" />
              إضافة علامة تجارية
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة علامة تجارية جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>الاسم بالعربية</Label>
                <Input
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  data-testid="input-brand-name-ar"
                />
              </div>
              <div>
                <Label>الاسم بالإنجليزية</Label>
                <Input
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  data-testid="input-brand-name-en"
                />
              </div>
              <div>
                <Label>المعرف (Slug)</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="nike, adidas, etc"
                  data-testid="input-brand-slug"
                />
              </div>
              <div>
                <Label>رابط الشعار</Label>
                <Input
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://..."
                  data-testid="input-brand-logo"
                />
              </div>
              <div>
                <Label>الترتيب</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  data-testid="input-brand-order"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit} disabled={createMutation.isPending} data-testid="button-save-brand">
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الشعار</TableHead>
              <TableHead>الاسم بالعربية</TableHead>
              <TableHead>الاسم بالإنجليزية</TableHead>
              <TableHead>المعرف</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell>
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.nameEn} className="w-10 h-10 object-contain rounded" />
                  ) : (
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell>{brand.nameAr}</TableCell>
                <TableCell>{brand.nameEn}</TableCell>
                <TableCell><Badge variant="outline">{brand.slug}</Badge></TableCell>
                <TableCell>
                  <Badge variant={brand.isActive !== false ? "default" : "secondary"}>
                    {brand.isActive !== false ? "نشط" : "غير نشط"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog open={editingBrand?.id === brand.id} onOpenChange={(open) => !open && setEditingBrand(null)}>
                      <DialogTrigger asChild>
                        <Button size="icon" variant="ghost" onClick={() => openEdit(brand)} data-testid={`button-edit-brand-${brand.id}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent dir="rtl">
                        <DialogHeader>
                          <DialogTitle>تعديل العلامة التجارية</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>الاسم بالعربية</Label>
                            <Input
                              value={formData.nameAr}
                              onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>الاسم بالإنجليزية</Label>
                            <Input
                              value={formData.nameEn}
                              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>المعرف (Slug)</Label>
                            <Input
                              value={formData.slug}
                              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>رابط الشعار</Label>
                            <Input
                              value={formData.logo}
                              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>الترتيب</Label>
                            <Input
                              type="number"
                              value={formData.order}
                              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "تحديث"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => deleteMutation.mutate(brand.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-brand-${brand.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {brands.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  لا توجد علامات تجارية مسجلة
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AttributesSection({ attributes, isLoading, toast }: { attributes: any[], isLoading: boolean, toast: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    nameAr: "", 
    nameEn: "", 
    type: "text", 
    options: [] as string[],
    isRequired: false,
    isFilterable: true,
    order: 0 
  });
  const [newOption, setNewOption] = useState("");

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/attributes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attributes"] });
      setIsOpen(false);
      setFormData({ nameAr: "", nameEn: "", type: "text", options: [], isRequired: false, isFilterable: true, order: 0 });
      toast({ title: "تم إضافة الخاصية بنجاح" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => apiRequest("PATCH", `/api/admin/attributes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attributes"] });
      setEditingAttr(null);
      toast({ title: "تم تحديث الخاصية بنجاح" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/attributes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attributes"] });
      toast({ title: "تم حذف الخاصية بنجاح" });
    },
  });

  const handleSubmit = () => {
    if (editingAttr) {
      updateMutation.mutate({ id: editingAttr.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEdit = (attr: any) => {
    setFormData({ 
      nameAr: attr.nameAr, 
      nameEn: attr.nameEn, 
      type: attr.type || "text",
      options: attr.options || [],
      isRequired: attr.isRequired || false,
      isFilterable: attr.isFilterable !== false,
      order: attr.order || 0
    });
    setEditingAttr(attr);
  };

  const addOption = () => {
    if (newOption.trim()) {
      setFormData({ ...formData, options: [...formData.options, newOption.trim()] });
      setNewOption("");
    }
  };

  const removeOption = (index: number) => {
    setFormData({ ...formData, options: formData.options.filter((_, i) => i !== index) });
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const typeLabels: Record<string, string> = {
    text: "نص",
    number: "رقم",
    select: "قائمة اختيار",
    multiselect: "اختيار متعدد",
    boolean: "نعم/لا"
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2">
          <Boxes className="h-5 w-5" />
          إدارة الخصائص المخصصة
        </CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-attribute">
              <Plus className="h-4 w-4 ml-2" />
              إضافة خاصية
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl" className="max-w-lg">
            <DialogHeader>
              <DialogTitle>إضافة خاصية جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>الاسم بالعربية</Label>
                <Input
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="مثال: المادة، الوزن"
                  data-testid="input-attr-name-ar"
                />
              </div>
              <div>
                <Label>الاسم بالإنجليزية</Label>
                <Input
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="e.g. Material, Weight"
                  data-testid="input-attr-name-en"
                />
              </div>
              <div>
                <Label>نوع القيمة</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger data-testid="select-attr-type">
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">نص</SelectItem>
                    <SelectItem value="number">رقم</SelectItem>
                    <SelectItem value="select">قائمة اختيار</SelectItem>
                    <SelectItem value="multiselect">اختيار متعدد</SelectItem>
                    <SelectItem value="boolean">نعم/لا</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(formData.type === "select" || formData.type === "multiselect") && (
                <div>
                  <Label>الخيارات</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      placeholder="أضف خيار..."
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addOption())}
                    />
                    <Button type="button" variant="outline" onClick={addOption}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.options.map((opt, i) => (
                      <Badge key={i} variant="secondary" className="pl-2">
                        {opt}
                        <button onClick={() => removeOption(i)} className="mr-1 hover:text-destructive">
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label>الترتيب</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  data-testid="input-attr-order"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit} disabled={createMutation.isPending} data-testid="button-save-attribute">
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم بالعربية</TableHead>
              <TableHead>الاسم بالإنجليزية</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>الخيارات</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attributes.map((attr) => (
              <TableRow key={attr.id}>
                <TableCell>{attr.nameAr}</TableCell>
                <TableCell>{attr.nameEn}</TableCell>
                <TableCell><Badge variant="outline">{typeLabels[attr.type] || attr.type}</Badge></TableCell>
                <TableCell>
                  {attr.options?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {attr.options.slice(0, 3).map((opt: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">{opt}</Badge>
                      ))}
                      {attr.options.length > 3 && (
                        <Badge variant="secondary" className="text-xs">+{attr.options.length - 3}</Badge>
                      )}
                    </div>
                  ) : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog open={editingAttr?.id === attr.id} onOpenChange={(open) => !open && setEditingAttr(null)}>
                      <DialogTrigger asChild>
                        <Button size="icon" variant="ghost" onClick={() => openEdit(attr)} data-testid={`button-edit-attr-${attr.id}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent dir="rtl" className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>تعديل الخاصية</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>الاسم بالعربية</Label>
                            <Input
                              value={formData.nameAr}
                              onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>الاسم بالإنجليزية</Label>
                            <Input
                              value={formData.nameEn}
                              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>نوع القيمة</Label>
                            <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر النوع" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">نص</SelectItem>
                                <SelectItem value="number">رقم</SelectItem>
                                <SelectItem value="select">قائمة اختيار</SelectItem>
                                <SelectItem value="multiselect">اختيار متعدد</SelectItem>
                                <SelectItem value="boolean">نعم/لا</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {(formData.type === "select" || formData.type === "multiselect") && (
                            <div>
                              <Label>الخيارات</Label>
                              <div className="flex gap-2 mb-2">
                                <Input
                                  value={newOption}
                                  onChange={(e) => setNewOption(e.target.value)}
                                  placeholder="أضف خيار..."
                                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addOption())}
                                />
                                <Button type="button" variant="outline" onClick={addOption}>
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {formData.options.map((opt, i) => (
                                  <Badge key={i} variant="secondary" className="pl-2">
                                    {opt}
                                    <button onClick={() => removeOption(i)} className="mr-1 hover:text-destructive">
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <div>
                            <Label>الترتيب</Label>
                            <Input
                              type="number"
                              value={formData.order}
                              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "تحديث"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => deleteMutation.mutate(attr.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-attr-${attr.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {attributes.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  لا توجد خصائص مخصصة مسجلة
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
