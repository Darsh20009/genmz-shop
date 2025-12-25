import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from "@shared/schema";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/products/${product.id}`}>
        <Card className="group overflow-hidden border-none rounded-none bg-white hover-elevate transition-all duration-500 cursor-pointer">
          <div className="relative aspect-[3/4] overflow-hidden">
            <img
              src={product.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80"}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Button
              size="sm"
              className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 rounded-none font-black uppercase tracking-widest text-[10px]"
            >
              عرض التفاصيل
            </Button>
            {product.isFeatured && (
              <div className="absolute top-4 right-4 bg-black text-white text-[10px] font-black uppercase tracking-widest px-3 py-1">
                FEATURED
              </div>
            )}
          </div>
          <CardContent className="p-4 text-center">
            <h3 className="font-black uppercase tracking-tighter text-sm mb-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground font-bold">{Number(product.price).toLocaleString()} ر.س</p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
