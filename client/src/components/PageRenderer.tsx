import { useQuery } from "@tanstack/react-query";
import { Page } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface PageRendererProps {
  slug: string;
}

export function PageRenderer({ slug }: PageRendererProps) {
  const { data: page, isLoading } = useQuery<Page>({
    queryKey: ["/api/pages", slug],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold">الصفحة غير موجودة</h1>
      </div>
    );
  }

  return (
    <div className="page-content">
      {page.blocks?.map((block: any) => (
        <BlockComponent key={block.id} block={block} />
      ))}
      {!page.blocks?.length && (
        <div dangerouslySetInnerHTML={{ __html: page.content }} />
      )}
    </div>
  );
}

function BlockComponent({ block }: { block: any }) {
  switch (block.type) {
    case "hero":
      return (
        <section className="relative h-[600px] flex items-center justify-center bg-black text-white overflow-hidden">
          {block.props.image && (
            <img 
              src={block.props.image} 
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              alt={block.props.title}
            />
          )}
          <div className="relative z-10 text-center px-4">
            <h1 className="text-5xl font-bold mb-4">{block.props.title}</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">{block.props.description}</p>
            {block.props.buttonText && (
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded-md hover:opacity-90 transition-opacity">
                {block.props.buttonText}
              </button>
            )}
          </div>
        </section>
      );
    case "text":
      return (
        <section className="container mx-auto py-16 px-4">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-6">{block.props.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: block.props.content }} />
          </div>
        </section>
      );
    case "image":
      return (
        <section className="container mx-auto py-12 px-4">
          <div className="flex flex-col items-center">
            <img 
              src={block.props.src} 
              alt={block.props.alt} 
              className="rounded-lg shadow-lg max-w-full h-auto"
            />
            {block.props.caption && (
              <p className="mt-4 text-secondary-foreground text-sm italic">{block.props.caption}</p>
            )}
          </div>
        </section>
      );
    default:
      return <div className="p-4 border border-dashed text-center">Block type "{block.type}" not implemented</div>;
  }
}
