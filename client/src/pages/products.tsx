import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { ProductCard } from "@/components/ui/product-card";
import { GuestPrompt } from "@/components/GuestPrompt";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, AlertCircle, Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link } from "wouter";

export default function Products() {
  const { t, language } = useLanguage();
  const { role } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: api.products.list,
    retry: false
  });

  const categories = ["all", "bed", "sofa", "cupboard", "door"];

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = 
      product.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      product.nameBn.includes(search);
    const matchesCategory = category === "all" || !category || product.category === category;
    return matchesSearch && matchesCategory;
  }) || [];

  // Guests see only 6 products, logged-in users see all
  const displayProducts = role === 'guest' 
    ? filteredProducts.slice(0, 6) 
    : filteredProducts;

  const hiddenCount = role === 'guest' ? Math.max(0, filteredProducts.length - 6) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Guest Prompt */}
      <GuestPrompt />

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">{t('allProducts')}</h1>
          <p className="text-muted-foreground mt-1">
            {role === 'guest' 
              ? `Showing ${displayProducts.length} of ${filteredProducts.length} products`
              : `${filteredProducts.length} products found`}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('search')}
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={category === cat || (cat === "all" && !category) ? "default" : "outline"}
                onClick={() => setCategory(cat)}
                className="capitalize whitespace-nowrap"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {[1,2,3,4,5,6,7,8].map(i => (
             <div key={i} className="h-[400px] bg-muted rounded-lg animate-pulse" />
           ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-muted/20 rounded-lg border border-destructive/20">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-destructive mb-2">Connection Error</h2>
          <p className="text-muted-foreground">Could not connect to your FastAPI backend.</p>
        </div>
      ) : displayProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Guest Restriction Notice */}
          {role === 'guest' && hiddenCount > 0 && (
            <div className="mt-8 p-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20 text-center">
              <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">
                {hiddenCount} More Products Available
              </h3>
              <p className="text-muted-foreground mb-6">
                Create an account to view our complete catalog, add items to cart, and place orders
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg">Register Now</Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">Login</Button>
                </Link>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-muted/20 rounded-lg border border-dashed">
          <p className="text-lg text-muted-foreground">No products found.</p>
          <Button 
            variant="link" 
            onClick={() => {setSearch(""); setCategory("all");}}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}