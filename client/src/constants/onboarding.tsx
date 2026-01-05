/**
 * Onboarding Configuration
 * Defines all setup steps and their requirements
 */

import {
  User,
  Package,
  Store,
  Users,
  ShoppingCart,
  CreditCard,
  Truck,
  Settings,
  Image as ImageIcon
} from "lucide-react";

export interface OnboardingConfig {
  id: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  icon: any; // Simplified for icon compatibility
  required: boolean;
  category: "store" | "inventory" | "payments" | "shipping";
}

export const ONBOARDING_STEPS: OnboardingConfig[] = [
  {
    id: "store-info",
    title: "بيانات المتجر",
    description: "أضف اسم المتجر، الشعار، والبيانات الأساسية للهوية",
    cta: "إعداد المتجر",
    href: "/admin/settings",
    icon: <Store className="w-5 h-5" />,
    required: true,
    category: "store",
  },
  {
    id: "tax-currency",
    title: "الضرائب والعملة",
    description: "إعداد الرقم الضريبي ونسبة الضريبة والعملة الافتراضية للمتجر",
    cta: "ضبط الإعدادات المالية",
    href: "/admin/settings?tab=general",
    icon: <Settings className="w-5 h-5" />,
    required: true,
    category: "payments",
  },
  {
    id: "shipping-setup",
    title: "خيارات الشحن",
    description: "تفعيل شركات الشحن وتحديد تكاليف التوصيل",
    cta: "إعداد الشحن",
    href: "/admin/shipping-companies",
    icon: <Truck className="w-5 h-5" />,
    required: true,
    category: "shipping",
  },
  {
    id: "payment-setup",
    title: "طرق الدفع",
    description: "تفعيل الدفع الإلكتروني (تمارا، تابي) أو التحويل البنكي",
    cta: "إعداد الدفع",
    href: "/admin/settings?tab=checkout",
    icon: <CreditCard className="w-5 h-5" />,
    required: true,
    category: "payments",
  },
  {
    id: "first-product",
    title: "إضافة منتجك الأول",
    description: "ابدأ بإضافة أول منتج لمتجرك لتفعيله للعملاء",
    cta: "إضافة منتج",
    href: "/admin/products",
    icon: <Package className="w-5 h-5" />,
    required: true,
    category: "inventory",
  },
];

export const ONBOARDING_CATEGORIES = {
  store: "إعداد المتجر",
  inventory: "المنتجات والمخزون",
  payments: "المالية والدفع",
  shipping: "الشحن والتوصيل",
};
