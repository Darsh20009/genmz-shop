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
  const defaultTitle = language === 'ar' ? "جين إم زد - أزياء فخمة عصرية" : "Gen M&Z - Modern Luxury Fashion";
  const defaultDescription = language === 'ar' 
    ? "اكتشف أحدث صيحات الموضة والأزياء السعودية الراقية في جين إم زد. جودة استثنائية وتصاميم مبتكرة." 
    : "Discover the latest in premium Saudi fashion at Gen M&Z. Exceptional quality and innovative designs.";

  const seoTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const seoDescription = description || defaultDescription;

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
