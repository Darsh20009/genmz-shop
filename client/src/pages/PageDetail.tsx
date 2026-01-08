import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Page } from "@shared/schema";

export default function PageDetail() {
  const [, params] = useRoute("/pages/:slug");
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { data: pages, isLoading } = useQuery<Page[]>({
    queryKey: ["/api/pages"],
  });

  const page = pages?.find(p => p.slug === params?.slug);

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
      <div className="p-8 max-w-4xl mx-auto" dir="rtl">
        <Card className="rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-3xl font-black">{page.title}</CardTitle>
            {page.status === "draft" && isAdmin && (
              <p className="text-sm text-amber-600 font-bold mt-2">وضع المعاينة: هذه الصفحة لا تزال مسودة</p>
            )}
          </CardHeader>
          <CardContent className="p-8 prose prose-slate dark:prose-invert max-w-none">
            {page.blocks && page.blocks.length > 0 ? (
              <div className="space-y-8">
                {page.blocks.map((block: any) => (
                  <div key={block.id} className="page-block">
                    {block.type === 'text' && (
                      <div dangerouslySetInnerHTML={{ __html: block.props.content || '' }} />
                    )}
                    {block.type === 'image' && (
                      <div className="flex justify-center my-8">
                        <img 
                          src={block.props.url} 
                          alt={block.props.alt || ''} 
                          className="rounded-3xl shadow-2xl max-w-full h-auto border-4 border-white dark:border-slate-800"
                        />
                      </div>
                    )}
                    {block.type === 'heading' && (
                      <h2 className="text-3xl font-bold mb-4">{block.props.text}</h2>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div dangerouslySetInnerHTML={ { __html: isAdmin ? (page.draftContent || page.content) : page.content } } />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
