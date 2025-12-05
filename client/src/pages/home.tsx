import { useLanguage } from "@/lib/language-context";
import { ProductCard } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Fallback hero image while backend is being built
import imgLivingRoom from '@assets/generated_images/modern_elegant_living_room_with_wooden_furniture.png';

export default function Home() {
  const { t } = useLanguage();
  
  // Fetch products from real API
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: api.products.list,
    retry: false // Don't retry infinitely if backend is down
  });

  const featuredProducts = products?.slice(0, 4) || [];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={imgLivingRoom} 
            alt="Hero" 
            className="w-full h-full object-cover brightness-[0.7]"
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight"
          >
            {t('heroTitle')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-white/90"
          >
            {t('heroSubtitle')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/products">
              <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary/50">
                {t('shopNow')} <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-serif font-bold text-primary mb-2">{t('featuredProducts')}</h2>
            <div className="h-1 w-20 bg-accent rounded-full"></div>
          </div>
          <Link href="/products">
            <Button variant="outline" className="hidden sm:flex">
              {t('allProducts')} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {[1,2,3,4].map(i => (
               <div key={i} className="h-[400px] bg-muted rounded-lg animate-pulse" />
             ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-muted/20 rounded-lg border border-destructive/20">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-bold text-destructive mb-2">Backend Not Connected</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Could not fetch products. Please ensure your FastAPI backend is running on port 8000 and serving /api/products.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link href="/products">
            <Button variant="outline" className="w-full">
              {t('allProducts')} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features/Benefits Section (Static) */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
              <p className="text-muted-foreground">Handcrafted from the finest materials for lasting durability.</p>
            </div>
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Local Craftsmanship</h3>
              <p className="text-muted-foreground">Made in Bangladesh by skilled artisans with decades of experience.</p>
            </div>
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Custom Designs</h3>
              <p className="text-muted-foreground">We can customize any furniture to fit your specific needs and space.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
