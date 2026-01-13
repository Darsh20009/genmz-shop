import { Card } from "@/components/ui/card";

interface ContentBlockProps {
  type: "text" | "image" | "html" | "setting";
  content: string;
  metadata?: any;
}

export function ContentBlockRenderer({ type, content, metadata }: ContentBlockProps) {
  switch (type) {
    case "text":
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none text-right">
          {content}
        </div>
      );
    
    case "image":
      return (
        <div className="my-6 overflow-hidden rounded-2xl border-2 border-primary/10 shadow-lg transition-all hover:shadow-xl">
          <img 
            src={content} 
            alt={metadata?.alt || "Content Image"} 
            className="w-full h-auto object-cover max-h-[500px]"
          />
          {metadata?.caption && (
            <p className="p-3 text-sm text-center text-muted-foreground font-medium border-t bg-muted/30">
              {metadata.caption}
            </p>
          )}
        </div>
      );
    
    case "html":
      return (
        <div 
          dangerouslySetInnerHTML={{ __html: content }} 
          className="content-block-html overflow-hidden rounded-xl"
        />
      );
    
    default:
      return null;
  }
}

export function PageSection({ blocks }: { blocks: any[] }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="flex flex-col gap-8 py-8 w-full max-w-4xl mx-auto">
      {blocks.map((block) => (
        <div key={block.id} className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ContentBlockRenderer 
            type={block.type as any} 
            content={block.props?.content || ""} 
            metadata={block.props?.metadata}
          />
        </div>
      ))}
    </div>
  );
}
