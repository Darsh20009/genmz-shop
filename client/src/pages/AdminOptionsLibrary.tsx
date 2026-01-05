import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package, Plus, Trash2, X } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function AdminOptionsLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newOptionName, setNewOptionName] = useState("");
  const [newValues, setNewValues] = useState<string[]>([]);
  const [currentValue, setCurrentValue] = useState("");
  const { toast } = useToast();

  const { data: options = [], isLoading } = useQuery({
    queryKey: ["/api/options-library"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/options-library");
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
  });

  const createOptionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/options-library", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/options-library"] });
      setIsCreateOpen(false);
      setNewOptionName("");
      setNewValues([]);
      toast({ title: "تم إضافة الخيار بنجاح" });
    },
  });

  const deleteOptionMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/options-library/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/options-library"] });
      toast({ title: "تم حذف الخيار بنجاح" });
    },
  });

  const filteredOptions = Array.isArray(options) ? options.filter((option: any) =>
    option.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const addValue = () => {
    if (currentValue && !newValues.includes(currentValue)) {
      setNewValues([...newValues, currentValue]);
      setCurrentValue("");
    }
  };

  return (
    <Layout>
      <div className="p-8" dir="rtl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black">مكتبة الخيارات</h1>
            <p className="text-muted-foreground font-bold mt-2">إدارة خيارات المنتج المتكررة بسهولة</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-12 px-8 font-black gap-2">
                <Plus className="w-5 h-5" />
                إضافة خيار جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة خيار منتج جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>اسم الخيار</Label>
                  <Input value={newOptionName} onChange={(e) => setNewOptionName(e.target.value)} placeholder="مثال: اللون" />
                </div>
                <div>
                  <Label>القيم</Label>
                  <div className="flex gap-2 mb-2">
                    <Input value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} placeholder="أضف قيمة..." />
                    <Button type="button" onClick={addValue}>أضف</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[50px]">
                    {newValues.map((v, i) => (
                      <span key={i} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center gap-1">
                        {v}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setNewValues(newValues.filter((_, idx) => i !== idx))} />
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  className="w-full"
                  disabled={!newOptionName || newValues.length === 0}
                  onClick={() => createOptionMutation.mutate({ name: newOptionName, values: newValues, valuesCount: newValues.length })}
                >
                  حفظ الخيار
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input 
            className="h-12 pr-12 rounded-2xl bg-white border-2 border-muted" 
            placeholder="بحث باسم خيار المنتج..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Card className="rounded-[2rem] border-none shadow-xl shadow-muted/20 overflow-hidden">
          <CardContent className="p-0">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-muted/10 border-b">
                  <th className="px-8 py-5 font-black text-sm text-muted-foreground">اسم خيار المنتج</th>
                  <th className="px-8 py-5 font-black text-sm text-muted-foreground text-center">القيم</th>
                  <th className="px-8 py-5 font-black text-sm text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr><td colSpan={3} className="p-8 text-center">جاري التحميل...</td></tr>
                ) : filteredOptions.length === 0 ? (
                  <tr><td colSpan={3} className="p-8 text-center">لا توجد خيارات متاحة</td></tr>
                ) : filteredOptions.map((option: any) => (
                  <tr key={option.id} className="hover:bg-muted/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                          <Package className="w-5 h-5" />
                        </div>
                        <span className="font-black text-lg">{option.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-wrap justify-center gap-1">
                        {option.values?.map((v: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-muted rounded-full font-black text-xs">
                            {v}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-left">
                      <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteOptionMutation.mutate(option.id)}>
                        <Trash2 className="w-5 h-5 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
