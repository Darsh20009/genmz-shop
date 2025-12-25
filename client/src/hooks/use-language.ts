import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'ar' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  ar: {
    home: "الرئيسية",
    shop: "المتجر",
    myAccount: "حسابي",
    myOrders: "طلباتي",
    adminPanel: "لوحة التحكم",
    installApp: "تثبيت التطبيق",
    connectWithUs: "تواصل معنا",
    categories: "التصنيفات",
    allProducts: "جميع المنتجات",
    help: "المساعدة",
    terms: "الشروط والأحكام",
    faq: "الأسئلة الشائعة",
    contactUs: "تواصل معنا",
    callUs: "اتصل بنا",
    email: "البريد الإلكتروني",
    whatsapp: "واتساب",
    allRightsReserved: "جميع الحقوق محفوظة",
    madeWithLove: "صنع بحب Ma3k tec solutions",
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",
    cart: "السلة",
  },
  en: {
    home: "Home",
    shop: "Shop",
    myAccount: "My Account",
    myOrders: "My Orders",
    adminPanel: "Admin Panel",
    installApp: "Install App",
    connectWithUs: "Connect with us",
    categories: "Categories",
    allProducts: "All Products",
    help: "Help",
    terms: "Terms & Conditions",
    faq: "FAQ",
    contactUs: "Contact Us",
    callUs: "Call Us",
    email: "Email",
    whatsapp: "WhatsApp",
    allRightsReserved: "All rights reserved",
    madeWithLove: "Made with love by Ma3k tec solutions",
    signIn: "Sign In",
    signOut: "Sign Out",
    cart: "Cart",
  }
};

export const useLanguage = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'ar',
      setLanguage: (lang) => {
        set({ language: lang });
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
      },
      t: (key) => {
        const { language } = get();
        return (translations[language] as any)[key] || key;
      },
    }),
    {
      name: 'language-storage',
    }
  )
);
