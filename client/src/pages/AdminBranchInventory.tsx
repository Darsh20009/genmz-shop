import { useQuery, useMutation } from "@tanstack/react-query";
import { Branch, Product, BranchInventory } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package, AlertTriangle, ArrowRightLeft, Building } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export default function AdminBranchInventory() {
  const { toast } = useToast();
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  const { data: branches } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: inventory, isLoading: invLoading } = useQuery<BranchInventory[]>({
    queryKey: ["/api/admin/inventory", selectedBranchId],
    enabled: !!selectedBranchId,
    queryFn: async () => {
      const res = await fetch(`/api/admin/inventory?branchId=${selectedBranchId}`);
      if (!res.ok) throw new Error("Failed to fetch inventory");
      return res.json();
    }
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ id, stock }: { id: string, stock: number }) => {
      await apiRequest("PATCH", `/api/admin/inventory/${id}`, { stock });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inventory", selectedBranchId] });
      toast({ title: "تم تحديث المخزون" });
    }
  });

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase tracking-tight">مخزون الفروع</h2>
        <div className="w-64">
          <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
            <SelectTrigger className="rounded-none h-10 border-black/5">
              <SelectValue placeholder="اختر الفرع للمعاينة" />
            </SelectTrigger>
            <SelectContent>
              {branches?.map(b => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedBranchId ? (
        <Card className="rounded-none border-dashed border-2">
          <CardContent className="p-12 text-center text-muted-foreground">
            <Building className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-xs">يرجى اختيار فرع لعرض المخزون الخاص به</p>
          </CardContent>
        </Card>
      ) : invLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {products?.map(product => (
            <Card key={product.id} className="rounded-none border-black/5 overflow-hidden">
              <CardHeader className="bg-black/5 py-3">
                <CardTitle className="text-sm font-black uppercase">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-black/5">
                  {product.variants.map(variant => {
                    const invItem = inventory?.find(i => i.variantSku === variant.sku);
                    const isLow = (invItem?.stock || 0) <= (invItem?.minStockLevel || 5);
                    
                    return (
                      <div key={variant.sku} className="p-4 flex justify-between items-center hover:bg-secondary/5">
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-xs">{variant.color} / {variant.size}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{variant.sku}</p>
                          </div>
                          {isLow && (
                            <Badge variant="destructive" className="rounded-none text-[8px] flex items-center gap-1">
                              <AlertTriangle className="h-2 w-2" /> مخزون منخفض
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Label className="text-[10px] font-bold">الكمية:</Label>
                            <Input 
                              type="number" 
                              defaultValue={invItem?.stock || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (invItem) {
                                  updateStockMutation.mutate({ id: invItem.id, stock: val });
                                }
                              }}
                              className="w-20 h-8 rounded-none text-center font-black"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
