import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ContentBlock } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, Layout, Trash2, EyeOff } from "lucide-react";
import { useLocation } from "wouter";

interface VisualEditorContextType {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  editBlock: (block: Partial<ContentBlock> & { key: string }) => void;
}

const VisualEditorContext = createContext<VisualEditorContextType | null>(null);

export function VisualEditorProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editingBlock, setEditingBlock] = useState<(Partial<ContentBlock> & { key: string }) | null>(null);
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  const updateMutation = useMutation({
    mutationFn: async (data: { key: string; content: string; publish?: boolean }) => {
      const res = await apiRequest("PATCH", `/api/content/${data.key}`, { 
        content: data.content,
        publish: data.publish 
      });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      setEditingBlock(null);
      toast({ title: variables.publish ? "تم النشر بنجاح" : "تم حفظ المسودة" });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (key: string) => {
      const res = await apiRequest("POST", `/api/content/${key}/publish`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      toast({ title: "تم نشر جميع التغييرات" });
    },
  });

  const handleToggleEdit = (value: boolean) => {
    setIsEditing(value);
    if (value) {
      if (location.startsWith('/admin')) {
        setLocation('/');
      }
      toast({ 
        title: "وضع التعديل نشط", 
        description: "يمكنك الآن تعديل الموقع مباشرة. اضغط على أي عنصر للتعديل.",
        variant: "default"
      });
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <VisualEditorContext.Provider value={{ 
      isEditing: isEditing && isAdmin, 
      setIsEditing: handleToggleEdit, 
      editBlock: setEditingBlock 
    }}>
      {children}
      {isAdmin && isEditing && (
        <div className="fixed inset-y-0 left-0 w-full sm:w-80 bg-background border-r shadow-2xl z-[100] flex flex-col animate-in slide-in-from-left duration-300">
          <div className="p-6 border-b flex items-center justify-between bg-primary text-primary-foreground">
            <h2 className="text-xl font-black uppercase tracking-tighter">أدوات التحرير</h2>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => handleToggleEdit(false)}
              className="hover:bg-primary-foreground/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">الإجراءات الرئيسية</h3>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" className="justify-start gap-3 h-14 sm:h-12 rounded-xl border-dashed hover:border-primary hover:bg-primary/5 transition-all">
                  <Plus className="h-5 w-5 text-primary" />
                  <span className="font-bold">إضافة عنصر جديد</span>
                </Button>
                <Button variant="outline" className="justify-start gap-3 h-14 sm:h-12 rounded-xl border-dashed hover:border-primary hover:bg-primary/5 transition-all">
                  <Layout className="h-5 w-5 text-primary" />
                  <span className="font-bold">تغيير التصميم</span>
                </Button>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">إدارة المحتوى</h3>
              <p className="text-xs text-muted-foreground px-2 italic leading-relaxed">
                اضغط على أي عنصر في الصفحة لبدء التعديل أو الحذف أو الإخفاء.
              </p>
            </section>
          </div>

          <div className="p-4 border-t bg-muted/50">
            <Button 
              className="w-full h-14 sm:h-12 rounded-xl font-black uppercase tracking-widest shadow-lg hover-elevate transition-all"
              onClick={() => {
                publishMutation.mutate("all");
                handleToggleEdit(false);
              }}
            >
              حفظ ونشر التغييرات
            </Button>
          </div>
        </div>
      )}
      
      <Dialog open={!!editingBlock} onOpenChange={(open) => !open && setEditingBlock(null)}>
        <DialogContent className="w-[95vw] sm:max-w-[425px] rounded-[2rem] overflow-hidden border-none shadow-2xl p-0" dir="rtl">
          <DialogHeader className="bg-primary text-primary-foreground p-6 mb-0">
            <DialogTitle className="text-2xl font-black tracking-tighter">تعديل المحتوى</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-6">
            <div className="grid gap-3">
              <Label className="font-bold text-sm uppercase tracking-widest text-muted-foreground">محتوى العنصر</Label>
              {editingBlock?.type === "image" ? (
                <div className="space-y-4">
                  <Input 
                    value={editingBlock.content} 
                    onChange={(e) => setEditingBlock({ ...editingBlock, content: e.target.value })}
                    placeholder="رابط الصورة المباشر"
                    className="h-12 rounded-xl border-2 focus-visible:ring-primary"
                  />
                  {editingBlock.content && (
                    <div className="aspect-video rounded-2xl overflow-hidden border-4 border-muted">
                      <img src={editingBlock.content} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ) : (
                <Textarea 
                  value={editingBlock?.content} 
                  onChange={(e) => setEditingBlock({ ...editingBlock!, content: e.target.value })}
                  rows={6}
                  className="rounded-xl border-2 focus-visible:ring-primary p-4 text-lg font-light leading-relaxed"
                />
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">خيارات إضافية</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="justify-start gap-2 h-12 sm:h-10 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-dashed">
                  <Trash2 className="h-4 w-4" />
                  حذف
                </Button>
                <Button variant="outline" className="justify-start gap-2 h-12 sm:h-10 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-50 border-dashed">
                  <EyeOff className="h-4 w-4" />
                  إخفاء
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setEditingBlock(null)} className="rounded-xl px-6 h-12">تراجع</Button>
              <Button 
                className="rounded-xl px-8 font-bold h-12 shadow-lg hover-elevate transition-all flex-1 sm:flex-none"
                onClick={() => updateMutation.mutate({ key: editingBlock!.key, content: editingBlock!.content!, publish: true })}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "جاري الحفظ..." : "تطبيق التعديلات"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </VisualEditorContext.Provider>
  );
}

export function useVisualEditor() {
  const context = useContext(VisualEditorContext);
  if (!context) throw new Error("useVisualEditor must be used within VisualEditorProvider");
  return context;
}

interface EditableProps {
  blockKey: string;
  defaultContent: string;
  type?: "text" | "image" | "html";
  children: (content: string) => ReactNode;
  className?: string;
}

export function Editable({ blockKey, defaultContent, type = "text", children, className = "" }: EditableProps) {
  const { isEditing, editBlock } = useVisualEditor();
  const { data: blocks } = useQuery<ContentBlock[]>({
    queryKey: ["/api/content"],
  });

  const block = blocks?.find(b => b.key === blockKey);
  const content = isEditing 
    ? (block?.draftContent || block?.content || defaultContent)
    : (block?.content || defaultContent);

  if (!isEditing) {
    return <div className={className}>{children(content)}</div>;
  }

  return (
    <div 
      className={`relative group cursor-pointer border-2 border-dashed border-transparent hover:border-primary transition-all duration-300 rounded-lg hover:bg-primary/10 p-1 z-[20] ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`[EDITOR] Editing block: ${blockKey}`);
        editBlock({ key: blockKey, content, type });
      }}
    >
      <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-[10px] font-black uppercase px-2 py-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all z-[30] pointer-events-none">
        تعديل
      </div>
      <div className="pointer-events-none select-none">
        {children(content)}
      </div>
    </div>
  );
}
