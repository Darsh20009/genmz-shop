import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Page, insertPageSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Save, Trash2, Eye, Layout, Settings, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPageEditor() {
  const [, params] = useRoute("/admin/pages/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isNew = params?.id === "new";

  const { data: page, isLoading } = useQuery<Page>({
    queryKey: [`/api/admin/pages/${params?.id}`],
    enabled: !isNew && !!params?.id,
  });

  const [localPage, setLocalPage] = useState<Partial<Page>>({
    title: "",
    slug: "",
    content: "",
    status: "draft",
    blocks: [],
  });

  useEffect(() => {
    if (page) {
      setLocalPage(page);
    }
  }, [page]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isNew) {
        return apiRequest("POST", "/api/pages", data);
      } else {
        return apiRequest("PATCH", `/api/pages/${params?.id}`, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({ title: "تم الحفظ بنجاح" });
      if (isNew) setLocation("/admin/pages");
    },
  });

  const addBlock = (type: string) => {
    const newBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      props: type === "hero" ? { title: "عنوان جديد", description: "وصف جديد" } : 
             type === "text" ? { title: "نص جديد", content: "محتوى النص هنا..." } : {},
    };
    setLocalPage(prev => ({
      ...prev,
      blocks: [...(prev.blocks || []), newBlock],
    }));
  };

  const updateBlock = (id: string, props: any) => {
    setLocalPage(prev => ({
      ...prev,
      blocks: prev.blocks?.map(b => b.id === id ? { ...b, props: { ...b.props, ...props } } : b),
    }));
  };

  const removeBlock = (id: string) => {
    setLocalPage(prev => ({
      ...prev,
      blocks: prev.blocks?.filter(b => b.id !== id),
    }));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/pages")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">{isNew ? "صفحة جديدة" : `تعديل: ${localPage.title}`}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => saveMutation.mutate({ ...localPage, publish: false })}>
            حفظ كمسودة
          </Button>
          <Button onClick={() => saveMutation.mutate({ ...localPage, publish: true })} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            نشر الصفحة
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor Sidebar */}
        <aside className="w-80 border-r overflow-y-auto p-4 bg-muted/30">
          <div className="space-y-6">
            <section>
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4" /> إعدادات الصفحة
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">عنوان الصفحة</label>
                  <Input value={localPage.title} onChange={e => setLocalPage(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">الرابط (Slug)</label>
                  <Input value={localPage.slug} onChange={e => setLocalPage(p => ({ ...p, slug: e.target.value }))} />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Plus className="h-4 w-4" /> إضافة بلوك
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => addBlock("hero")} className="flex flex-col h-20 gap-2">
                  <Layout className="h-6 w-6" /> Hero
                </Button>
                <Button variant="outline" size="sm" onClick={() => addBlock("text")} className="flex flex-col h-20 gap-2">
                  <Plus className="h-6 w-6" /> Text
                </Button>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-3">البلوكات الحالية</h2>
              <div className="space-y-2">
                {localPage.blocks?.map((block, index) => (
                  <div key={block.id} className="flex items-center justify-between p-2 bg-card border rounded-md text-sm">
                    <span className="capitalize">{index + 1}. {block.type}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeBlock(block.id)} className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </aside>

        {/* Live Preview / Canvas */}
        <main className="flex-1 overflow-y-auto bg-muted/10 p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {localPage.blocks?.map((block) => (
              <div key={block.id} className="group relative border-2 border-transparent hover:border-primary/50 rounded-lg transition-all p-2 bg-background shadow-sm">
                <div className="absolute -top-4 -right-4 hidden group-hover:flex bg-primary text-white rounded px-2 py-1 text-xs z-20">
                  تعديل {block.type}
                </div>
                
                {block.type === "hero" && (
                  <div className="p-8 text-center space-y-4">
                    <Input 
                      className="text-4xl font-bold text-center border-none focus-visible:ring-0" 
                      value={block.props.title} 
                      onChange={e => updateBlock(block.id, { title: e.target.value })} 
                    />
                    <Textarea 
                      className="text-center border-none focus-visible:ring-0 resize-none" 
                      value={block.props.description} 
                      onChange={e => updateBlock(block.id, { description: e.target.value })} 
                    />
                  </div>
                )}

                {block.type === "text" && (
                  <div className="p-6 space-y-4">
                    <Input 
                      className="text-2xl font-bold border-none focus-visible:ring-0" 
                      value={block.props.title} 
                      onChange={e => updateBlock(block.id, { title: e.target.value })} 
                    />
                    <Textarea 
                      className="min-h-[200px] border-none focus-visible:ring-0" 
                      value={block.props.content} 
                      onChange={e => updateBlock(block.id, { content: e.target.value })} 
                    />
                  </div>
                )}
              </div>
            ))}

            {(!localPage.blocks || localPage.blocks.length === 0) && (
              <div className="flex flex-col items-center justify-center min-h-[400px] border-4 border-dashed rounded-xl opacity-40">
                <Layout className="h-16 w-16 mb-4" />
                <p className="text-xl font-medium">ابدأ بإضافة بلوكات من القائمة الجانبية</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
