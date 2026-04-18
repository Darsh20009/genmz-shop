import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StoreSettings } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GripVertical, Save, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export default function AdminNavigation() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { data: settings, isLoading } = useQuery<StoreSettings>({ 
    queryKey: ["/api/settings"] 
  });

  const [links, setLinks] = useState<any[]>([]);

  // Update local state when data is loaded
  useEffect(() => {
    if (settings?.navigationLinks) {
      setLinks(settings.navigationLinks);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (updatedLinks: any[]) => {
      const res = await apiRequest("PATCH", "/api/settings", {
        navigationLinks: updatedLinks
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: language === "ar" ? "تم الحفظ بنجاح" : "Saved successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: language === "ar" ? "خطأ في الحفظ" : "Save error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const { data: pages = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/pages"]
  });

  const addLink = () => {
    const newLink = {
      id: Math.random().toString(36).substr(2, 9),
      titleAr: "",
      titleEn: "",
      url: "",
      order: links.length,
      isActive: true
    };
    setLinks([...links, newLink]);
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  const updateLink = (id: string, field: string, value: any) => {
    setLinks(links.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleSave = () => {
    updateMutation.mutate(links);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black mb-2">
              {language === 'ar' ? 'إدارة القوائم' : 'Navigation Management'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' ? 'تحكم في روابط التنقل الرئيسية للمتجر' : 'Manage your store main navigation links'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={addLink} variant="outline" className="rounded-xl gap-2">
              <Plus className="h-4 w-4" />
              {language === 'ar' ? 'إضافة رابط' : 'Add Link'}
            </Button>
            <Button onClick={handleSave} className="rounded-xl gap-2" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {links.length === 0 && (
            <Card className="p-12 text-center border-dashed border-2 rounded-[2rem]">
              <p className="text-muted-foreground font-bold">
                {language === 'ar' ? 'لا توجد روابط تنقل حالياً' : 'No navigation links found'}
              </p>
            </Card>
          )}
          {links.sort((a, b) => a.order - b.order).map((link, index) => (
            <Card key={link.id} className="rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="bg-muted p-2 rounded-lg cursor-grab active:cursor-grabbing">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 md:flex-none">
                      <Label className="mb-2 block text-xs font-bold uppercase tracking-widest opacity-50">
                        {language === 'ar' ? 'الحالة' : 'Status'}
                      </Label>
                      <Switch 
                        checked={link.isActive} 
                        onCheckedChange={(val) => updateLink(link.id, 'isActive', val)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 w-full">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest opacity-50">
                        {language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
                      </Label>
                      <Input 
                        value={link.titleAr} 
                        onChange={(e) => updateLink(link.id, 'titleAr', e.target.value)}
                        placeholder="مثال: المتجر"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest opacity-50">
                        {language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
                      </Label>
                      <Input 
                        value={link.titleEn} 
                        onChange={(e) => updateLink(link.id, 'titleEn', e.target.value)}
                        placeholder="Example: Shop"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest opacity-50">
                        {language === 'ar' ? 'الرابط (URL)' : 'URL'}
                      </Label>
                      <div className="flex gap-2">
                        <Input 
                          value={link.url} 
                          onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                          placeholder="/shop"
                          className="rounded-xl flex-1"
                        />
                        <Select 
                          onValueChange={(val) => updateLink(link.id, 'url', val)}
                        >
                          <SelectTrigger className="w-[140px] rounded-xl">
                            <SelectValue placeholder={language === 'ar' ? 'اختر صفحة' : 'Select Page'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="/">{language === 'ar' ? 'الرئيسية' : 'Home'}</SelectItem>
                            <SelectItem value="/products">{language === 'ar' ? 'المنتجات' : 'Products'}</SelectItem>
                            {pages.map((page: any) => (
                              <SelectItem key={page.id} value={`/page/${page.slug}`}>
                                {language === 'ar' ? page.title : (page.titleEn || page.title)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeLink(link.id)}
                    className="text-destructive hover:bg-destructive/10 rounded-xl"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
