import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Warehouse, ArrowRight, MapPin, CheckCircle2 } from "lucide-react";

export default function AdminInventoryOrder() {
  const warehouses = [
    { id: 1, name: "Default - الافتراضي", city: "الرياض", country: "السعودية", status: "مُفعّل" },
  ];

  return (
    <Layout>
      <div className="p-8" dir="rtl">
        <div className="mb-8">
          <h1 className="text-3xl font-black">ترتيب السحب من المخزون</h1>
          <p className="text-muted-foreground font-bold mt-2">
            اسحب المواقع لإعادة ترتيبها حسب الأولوية. تُوجَّه الطلبات أولًا للموقع الأعلى، وإذا لم يُنفَّذ الطلب بالكامل، يُقسَّم بين عدة مستودعات، وتُصدر بوليصة الشحن من مستودع واحد فقط.
          </p>
        </div>

        <div className="space-y-4">
          {warehouses.map((warehouse) => (
            <Card key={warehouse.id} className="rounded-3xl border-2 hover:border-primary/20 transition-all p-6 shadow-sm hover:shadow-xl shadow-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Warehouse className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">{warehouse.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground font-bold mt-1">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {warehouse.city}, {warehouse.country}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                      <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="w-3 h-3" /> {warehouse.status}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-xl cursor-grab active:cursor-grabbing">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
