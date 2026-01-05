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

export default function AdminFilterCriteria() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: filters = [], isLoading: filtersLoading } = useQuery({
    queryKey: ["/api/filters"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/filters");
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
  });

  const { data: options = [] } = useQuery({
    queryKey: ["/api/options-library"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/options-library");
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
  });

  const createFilterMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/filters", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/filters"] });
      setIsCreateOpen(false);
      setFilterName("");
      setSelectedOptions([]);
      toast({ title: "تم إضافة معيار التصفية بنجاح" });
    },
  });

  const deleteFilterMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/filters/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/filters"] });
      toast({ title: "تم حذف المعيار بنجاح" });
    },
  });

  const filteredResults = Array.isArray(filters) ? filters.filter((f: any) =>
    f.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <Layout>
      <div className="p-6 space-y-6" dir="rtl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black mb-2">معايير التصفية</h1>
            <p className="text-muted-foreground font-bold">إدارة المعايير لتسهيل بحث العملاء عن المنتجات</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl h-12 px-8 font-black gap-2">
                <Plus className="h-5 w-5" />
                إضافة معيار جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة معيار تصفية</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>اسم المعيار</Label>
                  <Input value={filterName} onChange={(e) => setFilterName(e.target.value)} placeholder="مثال: القياس" />
                </div>
                <div>
                  <Label>الخيارات المرتبطة</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                    {options.map((opt: any) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedOptions.includes(opt.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedOptions([...selectedOptions, opt.id]);
                            else setSelectedOptions(selectedOptions.filter(id => id !== opt.id));
                          }}
                        />
                        <span className="text-sm">{opt.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  className="w-full"
                  disabled={!filterName}
                  onClick={() => createFilterMutation.mutate({ name: filterName, options: selectedOptions })}
                >
                  إضافة المعيار
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input placeholder="بحث عن معيار..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" />
            </div>
          </CardHeader>
          <CardContent>
            {filtersLoading ? (
              <div className="text-center p-8">جاري التحميل...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم المعيار</TableHead>
                      <TableHead className="text-right">الخيارات المرتبطة</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">لا يوجد معايير تصفية</TableCell>
                      </TableRow>
                    ) : filteredResults.map((filter: any) => (
                      <TableRow key={filter.id}>
                        <TableCell className="font-bold">{filter.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {filter.options?.map((optId: string) => {
                              const opt = options.find((o: any) => o.id === optId);
                              return opt ? (
                                <span key={optId} className="px-2 py-0.5 bg-muted rounded-full text-xs">{opt.name}</span>
                              ) : null;
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => deleteFilterMutation.mutate(filter.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
