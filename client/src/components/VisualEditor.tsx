import { createContext, useContext, useState, ReactNode } from "react";
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

  const isAdmin = user?.role === "admin";

  return (
    <VisualEditorContext.Provider value={{ 
      isEditing: isEditing && isAdmin, 
      setIsEditing, 
      editBlock: setEditingBlock 
    }}>
      {children}
      {isAdmin && isEditing && (
        <div className="fixed bottom-6 right-6 z-[100]">
          <Button 
            onClick={() => setIsEditing(false)}
            variant="default"
            className="rounded-full h-14 w-14 shadow-2xl bg-primary text-primary-foreground"
          >
            حفظ
          </Button>
        </div>
      )}
      
      <Dialog open={!!editingBlock} onOpenChange={(open) => !open && setEditingBlock(null)}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل المحتوى</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>المحتوى</Label>
              {editingBlock?.type === "image" ? (
                <Input 
                  value={editingBlock.content} 
                  onChange={(e) => setEditingBlock({ ...editingBlock, content: e.target.value })}
                  placeholder="رابط الصورة"
                />
              ) : (
                <Textarea 
                  value={editingBlock?.content} 
                  onChange={(e) => setEditingBlock({ ...editingBlock!, content: e.target.value })}
                  rows={5}
                />
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingBlock(null)}>إلغاء</Button>
            <Button 
              variant="secondary"
              onClick={() => updateMutation.mutate({ key: editingBlock!.key, content: editingBlock!.content!, publish: false })}
              disabled={updateMutation.isPending}
            >
              حفظ مسودة
            </Button>
            <Button 
              onClick={() => updateMutation.mutate({ key: editingBlock!.key, content: editingBlock!.content!, publish: true })}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "جاري الحفظ..." : "حفظ ونشر"}
            </Button>
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
  // Show draft content if editing, otherwise show published content
  const content = isEditing 
    ? (block?.draftContent || block?.content || defaultContent)
    : (block?.content || defaultContent);

  if (!isEditing) {
    return <div className={className}>{children(content)}</div>;
  }

  return (
    <div 
      className={`relative group cursor-pointer border-2 border-dashed border-transparent hover:border-primary transition-colors ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        editBlock({ key: blockKey, content, type });
      }}
    >
      <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50">
        تعديل
      </div>
      {children(content)}
    </div>
  );
}
