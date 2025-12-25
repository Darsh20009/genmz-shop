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
      transition={{ duration: 0.2 }}
    >
      <Link href={`/products/${product.id}`}>
        <Card className="overflow-hidden border-none shadow-none bg-transparent group cursor-pointer">
          <CardContent className="p-0 aspect-[3/4] overflow-hidden rounded-xl bg-secondary relative">
            <img
              src={product.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80"}
              alt={product.name}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
            {product.isFeatured && (
              <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                مميز
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-start p-4 gap-2">
            <h3 className="font-display text-lg font-bold group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between w-full mt-2">
              <span className="font-mono text-lg font-bold">{Number(product.price).toLocaleString()} ر.س</span>
              <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                عرض التفاصيل
              </Button>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
