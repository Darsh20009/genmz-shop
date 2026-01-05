import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Users } from "lucide-react";
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

export default function AdminCustomerGroups() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const { toast } = useToast();

  const { data: groups = [] } = useQuery({
    queryKey: ["/api/customer-groups"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/customer-groups");
      return res.json();
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/customer-groups", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-groups"] });
      setIsCreateOpen(false);
      setGroupName("");
      setGroupDesc("");
      toast({ title: "تم إنشاء المجموعة بنجاح" });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/customer-groups/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-groups"] });
      toast({ title: "تم حذف المجموعة بنجاح" });
    },
  });

  const filteredGroups = (groups as any[]).filter((g: any) =>
    g.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6 space-y-6" dir="rtl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black mb-2">مجموعات العملاء</h1>
            <p className="text-muted-foreground font-bold">تصنيف عملائك وإدارتهم بسهولة</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl h-12 px-8 font-black gap-2">
                <Plus className="h-5 w-5" />
                مجموعة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إنشاء مجموعة عملاء</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>اسم المجموعة</Label>
                  <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="اسم المجموعة" />
                </div>
                <div>
                  <Label>الوصف</Label>
                  <Textarea value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} placeholder="وصف المجموعة" />
                </div>
                <Button
                  className="w-full"
                  onClick={() => createGroupMutation.mutate({ name: groupName, description: groupDesc })}
                >
                  إنشاء المجموعة
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input placeholder="بحث عن مجموعة..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم المجموعة</TableHead>
                    <TableHead>عدد العملاء</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroups.map((group: any) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {group.name}
                      </TableCell>
                      <TableCell>
                        <Badge>{group.customerCount || 0}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{group.description?.substring(0, 50)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteGroupMutation.mutate(group.id)}>
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
