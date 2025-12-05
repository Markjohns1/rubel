import { Product, useCart } from "@/lib/cart-context";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  
  // Ensure image URL is absolute
  const imageUrl = product.image.startsWith('http') 
    ? product.image 
    : `http://localhost:8000${product.image}`;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="overflow-hidden h-full flex flex-col border-border/50 shadow-sm hover:shadow-md transition-shadow">
        <div className="aspect-square overflow-hidden bg-muted relative group">
          <img
            src={imageUrl}
            alt={product.nameEn}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
             <Link href={`/product/${product.id}`}>
               <Button variant="secondary" size="sm" className="translate-y-4 group-hover:translate-y-0 transition-transform">
                 View Details
               </Button>
             </Link>
          </div>
        </div>
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className="uppercase text-[10px] tracking-wider">
              {product.category}
            </Badge>
          </div>
          <h3 className="font-serif font-bold text-lg leading-tight line-clamp-1" title={product.nameEn}>
            {product.nameEn}
          </h3>
        </CardHeader>
        <CardContent className="p-4 flex-1">
          <p className="text-muted-foreground text-sm line-clamp-2">
            {product.descriptionEn}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between border-t bg-muted/20 mt-auto">
          <span className="font-bold text-primary text-lg">
            ${product.price.toLocaleString()}
          </span>
          <Button onClick={() => addToCart(product)} size="sm">
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}