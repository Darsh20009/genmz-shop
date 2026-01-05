import { ReactNode, useState } from "react";
import { Layout } from "@/components/Layout";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, 
  CreditCard, 
  Truck, 
  FileText, 
  Users, 
  Store, 
  BarChart3, 
  Settings,
  Smartphone,
  Gift,
  QrCode,
  Building2,
  Shield,
  Wallet,
  Package,
  Receipt,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Star,
  Zap
} from "lucide-react";

interface FeatureSection {
  id: string;
  icon: ReactNode;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  steps: { ar: string; en: string }[];
  tips?: { ar: string; en: string }[];
}

const features: FeatureSection[] = [
  {
    id: "pos",
    icon: <Store className="w-6 h-6" />,
    titleAr: "نظام نقاط البيع (POS)",
    titleEn: "Point of Sale (POS)",
    descAr: "نظام متكامل لإدارة المبيعات في الفروع مع دعم الباركود والفواتير الضريبية",
    descEn: "Complete system for managing in-store sales with barcode support and tax invoices",
    steps: [
      { ar: "افتح صفحة نقطة البيع من القائمة الجانبية", en: "Open POS page from the sidebar" },
      { ar: "امسح الباركود أو ابحث عن المنتج يدوياً", en: "Scan barcode or search for product manually" },
      { ar: "اختر اللون والمقاس المطلوب", en: "Select required color and size" },
      { ar: "أضف المنتجات إلى السلة", en: "Add products to cart" },
      { ar: "اختر طريقة الدفع (نقدي / بطاقة / محفظة)", en: "Choose payment method (cash / card / wallet)" },
      { ar: "أكمل العملية واطبع الفاتورة", en: "Complete transaction and print receipt" }
    ],
    tips: [
      { ar: "يمكنك استخدام ماسح الباركود USB مباشرة", en: "You can use USB barcode scanner directly" },
      { ar: "افتح الدرج النقدي من زر الإعدادات", en: "Open cash drawer from settings button" }
    ]
  },
  {
    id: "loyalty",
    icon: <Gift className="w-6 h-6" />,
    titleAr: "نظام الولاء والنقاط",
    titleEn: "Loyalty & Points System",
    descAr: "نظام نقاط متعدد المستويات يكافئ العملاء على مشترياتهم",
    descEn: "Multi-tier points system that rewards customers for purchases",
    steps: [
      { ar: "العملاء يكسبون نقاط مع كل عملية شراء", en: "Customers earn points with every purchase" },
      { ar: "كل 10 نقاط = 1 ريال سعودي", en: "Every 10 points = 1 SAR" },
      { ar: "4 مستويات: برونزي، فضي، ذهبي، بلاتيني", en: "4 tiers: Bronze, Silver, Gold, Platinum" },
      { ar: "الترقية تلقائية حسب إجمالي المشتريات", en: "Automatic upgrade based on total purchases" },
      { ar: "مضاعفة النقاط حسب المستوى (1x - 2x)", en: "Points multiplier per tier (1x - 2x)" }
    ],
    tips: [
      { ar: "برونزي: 0 ر.س | فضي: 1000 ر.س | ذهبي: 5000 ر.س | بلاتيني: 15000 ر.س", en: "Bronze: 0 SAR | Silver: 1000 SAR | Gold: 5000 SAR | Platinum: 15000 SAR" },
      { ar: "العملاء الفضي فما فوق يحصلون على خصم 5% برقم الهاتف", en: "Silver+ customers get 5% discount with phone number" }
    ]
  },
  {
    id: "payments",
    icon: <CreditCard className="w-6 h-6" />,
    titleAr: "بوابات الدفع (Tamara & Tabby)",
    titleEn: "Payment Gateways (Tamara & Tabby)",
    descAr: "دعم الدفع بالتقسيط عبر تمارا وتابي مع 4 دفعات بدون فوائد",
    descEn: "Installment payment support via Tamara and Tabby with 4 interest-free payments",
    steps: [
      { ar: "العميل يختار طريقة الدفع عند الدفع", en: "Customer selects payment method at checkout" },
      { ar: "اختر تمارا أو تابي للتقسيط", en: "Choose Tamara or Tabby for installments" },
      { ar: "يتم تحويل العميل لإتمام الدفع", en: "Customer is redirected to complete payment" },
      { ar: "نستلم إشعار تلقائي عند اكتمال الدفع", en: "We receive automatic notification upon payment completion" },
      { ar: "الطلب يتحول تلقائياً لحالة 'مدفوع'", en: "Order automatically changes to 'paid' status" }
    ],
    tips: [
      { ar: "تمارا: 4 دفعات بدون فوائد", en: "Tamara: 4 interest-free payments" },
      { ar: "تابي: دفع لاحقاً أو 4 أقساط", en: "Tabby: Pay later or 4 installments" }
    ]
  },
  {
    id: "bank-transfer",
    icon: <Building2 className="w-6 h-6" />,
    titleAr: "التحويل البنكي",
    titleEn: "Bank Transfer",
    descAr: "نظام التحقق من إيصالات التحويل البنكي للطلبات",
    descEn: "Bank transfer receipt verification system for orders",
    steps: [
      { ar: "العميل يختار الدفع بالتحويل البنكي", en: "Customer selects bank transfer payment" },
      { ar: "يظهر له رقم الحساب البنكي", en: "Bank account number is displayed" },
      { ar: "يرفع صورة إيصال التحويل", en: "Uploads transfer receipt image" },
      { ar: "الإدارة تستلم إشعار للمراجعة", en: "Admin receives notification for review" },
      { ar: "يتم قبول أو رفض الإيصال مع السبب", en: "Receipt is approved or rejected with reason" }
    ],
    tips: [
      { ar: "تأكد من وضوح صورة الإيصال", en: "Ensure receipt image is clear" },
      { ar: "يجب أن يتطابق المبلغ مع قيمة الطلب", en: "Amount must match order value" }
    ]
  },
  {
    id: "shipping",
    icon: <Truck className="w-6 h-6" />,
    titleAr: "الشحن (Storage Station)",
    titleEn: "Shipping (Storage Station)",
    descAr: "تكامل مع Storage Station لإدارة الشحنات والتتبع",
    descEn: "Integration with Storage Station for shipment management and tracking",
    steps: [
      { ar: "عند تأكيد الطلب يتم إنشاء شحنة تلقائياً", en: "Shipment is automatically created upon order confirmation" },
      { ar: "يتم توليد رقم تتبع فريد", en: "Unique tracking number is generated" },
      { ar: "العميل يستلم رسالة بها رقم التتبع", en: "Customer receives message with tracking number" },
      { ar: "يمكن تتبع الشحنة من صفحة الطلبات", en: "Shipment can be tracked from orders page" },
      { ar: "تحديثات الحالة تصل تلقائياً", en: "Status updates arrive automatically" }
    ],
    tips: [
      { ar: "أوقات التوصيل: 2-3 أيام عمل", en: "Delivery time: 2-3 business days" },
      { ar: "يمكن الاستلام من نقاط التخزين", en: "Can pick up from storage points" }
    ]
  },
  {
    id: "invoices",
    icon: <FileText className="w-6 h-6" />,
    titleAr: "الفواتير الضريبية (ZATCA)",
    titleEn: "Tax Invoices (ZATCA)",
    descAr: "فواتير متوافقة مع هيئة الزكاة والضريبة والجمارك",
    descEn: "Invoices compliant with ZATCA regulations",
    steps: [
      { ar: "يتم إنشاء فاتورة تلقائياً لكل طلب مكتمل", en: "Invoice is automatically generated for each completed order" },
      { ar: "الفاتورة تحتوي رمز QR للتحقق", en: "Invoice contains QR code for verification" },
      { ar: "يمكن تحميل الفاتورة بصيغة PDF", en: "Invoice can be downloaded as PDF" },
      { ar: "العميل يستطيع مشاهدة فواتيره من حسابه", en: "Customer can view invoices from their account" },
      { ar: "رمز QR يحتوي بيانات ZATCA المطلوبة", en: "QR code contains required ZATCA data" }
    ],
    tips: [
      { ar: "رقم ضريبي: 300000000000003", en: "Tax number: 300000000000003" },
      { ar: "ضريبة القيمة المضافة: 15%", en: "VAT: 15%" }
    ]
  },
  {
    id: "barcode",
    icon: <QrCode className="w-6 h-6" />,
    titleAr: "الباركود والطباعة",
    titleEn: "Barcode & Printing",
    descAr: "توليد وطباعة باركود لجميع المنتجات",
    descEn: "Generate and print barcodes for all products",
    steps: [
      { ar: "كل منتج له باركود فريد (CODE128)", en: "Each product has unique barcode (CODE128)" },
      { ar: "الباركود يشمل اسم المنتج واللون والمقاس", en: "Barcode includes product name, color, and size" },
      { ar: "يمكن طباعة باركود فردي من صفحة المنتج", en: "Can print individual barcode from product page" },
      { ar: "يمكن طباعة باركودات بالجملة", en: "Can print bulk barcodes" },
      { ar: "متوافق مع طابعات الملصقات الحرارية", en: "Compatible with thermal label printers" }
    ],
    tips: [
      { ar: "أبعاد الملصق الموصى بها: 50x25 مم", en: "Recommended label size: 50x25 mm" },
      { ar: "استخدم طابعة Zebra أو Brother للحصول على أفضل جودة", en: "Use Zebra or Brother printer for best quality" }
    ]
  },
  {
    id: "staff",
    icon: <Users className="w-6 h-6" />,
    titleAr: "إدارة الموظفين والصلاحيات",
    titleEn: "Staff & Permissions Management",
    descAr: "نظام صلاحيات متقدم للتحكم في وصول الموظفين",
    descEn: "Advanced permissions system to control staff access",
    steps: [
      { ar: "أضف موظف جديد من صفحة الموظفين", en: "Add new employee from staff page" },
      { ar: "حدد الدور (مدير فرع / كاشير / دعم)", en: "Assign role (Branch Manager / Cashier / Support)" },
      { ar: "خصص الصلاحيات حسب المهام", en: "Customize permissions per tasks" },
      { ar: "اربط الموظف بفرع معين", en: "Link employee to specific branch" },
      { ar: "راقب نشاط الموظفين من سجل المراجعة", en: "Monitor staff activity from audit log" }
    ],
    tips: [
      { ar: "الصلاحيات: الطلبات، المنتجات، العملاء، التقارير، الإعدادات", en: "Permissions: Orders, Products, Customers, Reports, Settings" },
      { ar: "سجل المراجعة يحفظ جميع الإجراءات", en: "Audit log saves all actions" }
    ]
  },
  {
    id: "branches",
    icon: <Building2 className="w-6 h-6" />,
    titleAr: "إدارة الفروع",
    titleEn: "Branch Management",
    descAr: "إدارة فروع متعددة مع مخزون منفصل لكل فرع",
    descEn: "Manage multiple branches with separate inventory for each",
    steps: [
      { ar: "أضف فرع جديد من صفحة الفروع", en: "Add new branch from branches page" },
      { ar: "حدد اسم الفرع والعنوان ورقم الهاتف", en: "Set branch name, address, and phone" },
      { ar: "عيّن مدير للفرع", en: "Assign a manager to the branch" },
      { ar: "أدر مخزون كل فرع بشكل مستقل", en: "Manage each branch's inventory independently" },
      { ar: "انقل المخزون بين الفروع عند الحاجة", en: "Transfer inventory between branches as needed" }
    ],
    tips: [
      { ar: "يمكن ربط نقطة البيع بفرع معين", en: "POS can be linked to specific branch" },
      { ar: "تقارير منفصلة لكل فرع", en: "Separate reports for each branch" }
    ]
  },
  {
    id: "wallet",
    icon: <Wallet className="w-6 h-6" />,
    titleAr: "المحفظة الإلكترونية",
    titleEn: "Digital Wallet",
    descAr: "نظام محفظة للعملاء لتسهيل عمليات الدفع والاسترجاع",
    descEn: "Customer wallet system for easy payments and refunds",
    steps: [
      { ar: "كل عميل لديه محفظة إلكترونية", en: "Each customer has a digital wallet" },
      { ar: "يمكن شحن المحفظة من الإدارة", en: "Wallet can be topped up by admin" },
      { ar: "استخدم رصيد المحفظة للدفع", en: "Use wallet balance for payment" },
      { ar: "المبالغ المستردة تضاف للمحفظة", en: "Refunds are added to wallet" },
      { ar: "سجل كامل لجميع حركات المحفظة", en: "Complete log of all wallet transactions" }
    ]
  },
  {
    id: "reports",
    icon: <BarChart3 className="w-6 h-6" />,
    titleAr: "التقارير والإحصائيات",
    titleEn: "Reports & Analytics",
    descAr: "تقارير شاملة لمتابعة أداء المتجر",
    descEn: "Comprehensive reports to monitor store performance",
    steps: [
      { ar: "إجمالي المبيعات والإيرادات", en: "Total sales and revenue" },
      { ar: "المنتجات الأكثر مبيعاً", en: "Best-selling products" },
      { ar: "تقارير الورديات النقدية", en: "Cash drawer shift reports" },
      { ar: "تقارير العملاء والولاء", en: "Customer and loyalty reports" },
      { ar: "تقارير الشحن والتوصيل", en: "Shipping and delivery reports" }
    ]
  }
];

export default function Guide() {
  const { language } = useLanguage();
  const [activeSection, setActiveSection] = useState("pos");
  const isAr = language === 'ar';

  const currentFeature = features.find(f => f.id === activeSection) || features[0];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-white py-8 md:py-16" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="container max-w-7xl px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-0 px-4 py-1">
              <HelpCircle className="w-3 h-3 ml-2" />
              {isAr ? 'مركز المساعدة' : 'Help Center'}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">
              {isAr ? 'دليل الاستخدام الشامل' : 'Complete User Guide'}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {isAr 
                ? 'دليل متكامل لجميع ميزات نظام Gen M&Z - أقوى منصة تجارة إلكترونية في السعودية'
                : 'Complete guide for all Gen M&Z features - The most powerful e-commerce platform in Saudi Arabia'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-black/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-widest">
                    {isAr ? 'الميزات' : 'Features'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="space-y-1">
                    {features.map((feature) => (
                      <button
                        key={feature.id}
                        onClick={() => setActiveSection(feature.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                          activeSection === feature.id 
                            ? 'bg-primary text-primary-foreground font-bold' 
                            : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {feature.icon}
                        <span className="truncate">{isAr ? feature.titleAr : feature.titleEn}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3 space-y-6">
              <Card className="border-black/5 overflow-hidden">
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      {currentFeature.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black mb-2">
                        {isAr ? currentFeature.titleAr : currentFeature.titleEn}
                      </h2>
                      <p className="text-muted-foreground">
                        {isAr ? currentFeature.descAr : currentFeature.descEn}
                      </p>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6 md:p-8">
                  <div className="mb-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      {isAr ? 'خطوات الاستخدام' : 'How to Use'}
                    </h3>
                    <div className="space-y-3">
                      {currentFeature.steps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                            {index + 1}
                          </div>
                          <span className="text-sm leading-relaxed">
                            {isAr ? step.ar : step.en}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {currentFeature.tips && currentFeature.tips.length > 0 && (
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-amber-600 mb-4 flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        {isAr ? 'نصائح مهمة' : 'Important Tips'}
                      </h3>
                      <div className="space-y-2">
                        {currentFeature.tips.map((tip, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <span className="text-sm text-amber-900">
                              {isAr ? tip.ar : tip.en}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <button 
                  onClick={() => {
                    const currentIndex = features.findIndex(f => f.id === activeSection);
                    if (currentIndex > 0) {
                      setActiveSection(features[currentIndex - 1].id);
                    }
                  }}
                  disabled={features.findIndex(f => f.id === activeSection) === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors"
                >
                  {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  {isAr ? 'السابق' : 'Previous'}
                </button>
                <button 
                  onClick={() => {
                    const currentIndex = features.findIndex(f => f.id === activeSection);
                    if (currentIndex < features.length - 1) {
                      setActiveSection(features[currentIndex + 1].id);
                    }
                  }}
                  disabled={features.findIndex(f => f.id === activeSection) === features.length - 1}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  {isAr ? 'التالي' : 'Next'}
                  {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>

              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">
                        {isAr ? 'لماذا Gen M&Z أقوى من المنافسين؟' : 'Why is Gen M&Z stronger than competitors?'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isAr 
                          ? 'نظام متكامل يجمع بين نقاط البيع، الولاء، الدفع الإلكتروني، الشحن، والفواتير الضريبية في منصة واحدة - أقوى من Salla و Zid و Odoo'
                          : 'Integrated system combining POS, loyalty, e-payments, shipping, and tax invoices in one platform - stronger than Salla, Zid, and Odoo'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
