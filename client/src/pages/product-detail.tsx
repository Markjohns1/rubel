import { useRoute, Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Phone, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import NotFound from "./not-found";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function ProductDetail() {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const [match, params] = useRoute("/product/:id");

  // Fetch single product
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', params?.id],
    queryFn: () => api.products.get(Number(params?.id)),
    enabled: !!params?.id,
    retry: false
  });

  if (!match) return <NotFound />;
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">The product you are looking for does not exist or the server is down.</p>
        <Link href="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  const name = language === 'bn' ? product.nameBn : product.nameEn;
  const description = language === 'bn' ? product.descriptionBn : product.descriptionEn;

  // WhatsApp Message
  const whatsappMessage = `Hi, I want to order: ${product.nameEn} - Price: ${product.price}`;
  const whatsappLink = `https://wa.me/+8801700000000?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/products">
        <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('allProducts')}
        </Button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="aspect-square bg-muted rounded-xl overflow-hidden border relative">
          <img 
            src={product.image} 
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="space-y-8">
          <div>
            <Badge className="mb-4 uppercase tracking-widest">{product.category}</Badge>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">{name}</h1>
            <p className="text-3xl font-bold text-primary">
              {t('taka')} {product.price.toLocaleString()}
            </p>
          </div>

          <div className="prose prose-stone max-w-none">
            <h3 className="font-bold text-lg mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {description}
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
              <li>Premium solid wood construction</li>
              <li>Hand-polished finish</li>
              <li>5-year warranty included</li>
              <li>Free delivery within Dhaka city</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <Button size="lg" className="flex-1 text-lg h-14" onClick={() => addToCart(product)}>
              <ShoppingCart className="mr-2 h-5 w-5" /> {t('addToCart')}
            </Button>
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="flex-1">
              <Button size="lg" variant="outline" className="w-full text-lg h-14 border-green-600 text-green-700 hover:bg-green-50">
                <Phone className="mr-2 h-5 w-5" /> WhatsApp Order
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
