import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Page } from "@shared/schema";

import { PageSection } from "@/components/BlockRenderer";
import { SEO } from "@/components/SEO";

export default function PageDetail() {
  const [, params] = useRoute("/pages/:slug");
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { data: page, isLoading } = useQuery<Page>({
    queryKey: [`/api/pages/${params?.slug}`],
    enabled: !!params?.slug,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!page || (page.status === "draft" && !isAdmin)) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold">عذراً، هذه الصفحة غير متوفرة</h1>
          <p className="text-muted-foreground mt-2">قد تكون الصفحة قد حُذفت أو أنها لا تزال مسودة.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title={page.title} description={page.metadata?.description} />
      <div className="p-8 max-w-4xl mx-auto" dir="rtl">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {page.title}
          </h1>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full opacity-20" />
          {page.status === "draft" && isAdmin && (
            <p className="text-sm text-amber-600 font-bold mt-4 px-4 py-1 bg-amber-50 rounded-full inline-block">
              وضع المعاينة: مسودة
            </p>
          )}
        </header>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          {page.blocks && page.blocks.length > 0 ? (
            <PageSection blocks={page.blocks} />
          ) : (
            <div dangerouslySetInnerHTML={ { __html: isAdmin ? (page.draftContent || page.content || "") : (page.content || "") } } />
          )}
        </div>
      </div>
    </Layout>
  );
}
