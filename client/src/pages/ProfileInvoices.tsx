import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Invoice } from "@shared/schema";
import { format } from "date-fns";
import { FileText, Download, Eye, Printer, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function ProfileInvoices() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/my/invoices"],
    enabled: !!user,
  });

  const handlePrintInvoice = (invoiceId: string) => {
    window.open(`/api/invoices/${invoiceId}/pdf`, '_blank');
  };

  const handleViewInvoice = (invoiceId: string) => {
    window.open(`/api/invoices/${invoiceId}/pdf`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 gap-1"><CheckCircle2 className="w-3 h-3" /> {language === 'ar' ? 'مدفوعة' : 'Paid'}</Badge>;
      case 'issued':
        return <Badge className="bg-blue-100 text-blue-800 gap-1"><Clock className="w-3 h-3" /> {language === 'ar' ? 'صادرة' : 'Issued'}</Badge>;
      case 'void':
        return <Badge className="bg-red-100 text-red-800 gap-1"><XCircle className="w-3 h-3" /> {language === 'ar' ? 'ملغاة' : 'Void'}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase tracking-widest">{language === 'ar' ? 'فواتيري' : 'My Invoices'}</h2>
        <p className="text-sm text-muted-foreground">{invoices?.length || 0} {language === 'ar' ? 'فاتورة' : 'invoices'}</p>
      </div>
      
      <div className="grid gap-4">
        {invoices?.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">{language === 'ar' ? 'لا يوجد فواتير حالياً' : 'No invoices found'}</p>
              <p className="text-xs text-muted-foreground mt-1">{language === 'ar' ? 'ستظهر فواتيرك هنا بعد إتمام الطلبات' : 'Your invoices will appear here after completing orders'}</p>
            </CardContent>
          </Card>
        ) : (
          invoices?.map((invoice) => (
            <Card key={invoice.id} className="border-black/5 hover-elevate transition-all">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/5 flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-sm uppercase tracking-wide">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(invoice.issueDate), 'yyyy/MM/dd')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    {getStatusBadge(invoice.status)}
                    
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">{language === 'ar' ? 'الإجمالي' : 'Total'}</p>
                      <p className="text-lg font-black">{Number(invoice.total).toFixed(2)} <span className="text-xs font-normal">ر.س</span></p>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleViewInvoice(invoice.id)}
                        title={language === 'ar' ? 'عرض' : 'View'}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handlePrintInvoice(invoice.id)}
                        title={language === 'ar' ? 'طباعة' : 'Print'}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {invoice.items && invoice.items.length > 0 && (
                  <div className="border-t border-black/5 px-4 py-3 bg-secondary/20">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      {language === 'ar' ? 'العناصر' : 'Items'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {invoice.items.slice(0, 3).map((item: any, i: number) => (
                        <Badge key={i} variant="outline" className="text-[10px]">
                          {item.quantity}x {item.description}
                        </Badge>
                      ))}
                      {invoice.items.length > 3 && (
                        <Badge variant="outline" className="text-[10px]">
                          +{invoice.items.length - 3} {language === 'ar' ? 'أخرى' : 'more'}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
