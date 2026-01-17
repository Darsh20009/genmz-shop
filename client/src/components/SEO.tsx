import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/hooks/use-language";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function SEO({ 
  title, 
  description, 
  image = "/icons/favicon.png", 
  url = "https://www.genmz.store", 
  type = "website" 
}: SEOProps) {
  const { language } = useLanguage();
  const siteName = "Gen M&Z";
  const logoUrl = "/logo.png";
  const defaultTitle = language === 'ar' ? "متجر Gen M & Z | وجهتك الأولى للتسوق الإلكتروني" : "Gen M&Z Store | Your Premier Shopping Destination";
  const defaultDescription = language === 'ar' 
    ? "اكتشف أحدث المنتجات والعروض الحصرية في متجر Gen M & Z. تسوق الآن واحصل على أفضل تجربة شراء إلكترونية في المملكة العربية السعودية." 
    : "Discover the latest products and exclusive offers at Gen M&Z Store. Shop now for the best e-commerce experience in Saudi Arabia.";

  const seoTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoImage = image || logoUrl;

  return (
    <Helmet>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={seoTitle} />
      <meta property="twitter:description" content={seoDescription} />
      <meta property="twitter:image" content={image} />
      
      <html lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'} />
    </Helmet>
  );
}
