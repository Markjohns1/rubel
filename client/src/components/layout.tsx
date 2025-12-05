import { Link, useLocation } from "wouter";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { ShoppingCart, Menu, User, Phone, Facebook, Instagram, MapPin, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => {
    const isActive = location === href;
    return (
      <Link href={href}>
        <span className={cn(
          "cursor-pointer text-sm font-medium transition-colors hover:text-primary",
          isActive ? "text-primary font-semibold" : "text-muted-foreground"
        )}>
          {children}
        </span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground selection:bg-primary/20">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-xs">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Phone size={12} /> +254 724 810412</span>
            <span className="hidden sm:flex items-center gap-1"><MapPin size={12} /> Roysambu, Nairobi</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span>Welcome to Decorvibe Furniture</span>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium">Home</Link>
                  <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium">Products</Link>
                  <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium">About Us</Link>
                  <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium">Contact</Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold font-serif text-xl">
                DF
              </div>
              <span className="font-serif text-xl font-bold hidden sm:inline-block text-primary">
                Decorvibe Furniture
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/products">Products</NavLink>
            <NavLink href="/about">About Us</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={user.isAdmin ? "/admin" : "/profile"}>{user.isAdmin ? "Admin" : user.username}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm" className="ml-2 hidden sm:flex">
                  Login
                </Button>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-muted text-muted-foreground border-t">
        <div className="container mx-auto py-12 px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-foreground">
                Decorvibe Furniture
              </h3>
              <p className="text-sm leading-relaxed">
                Your trusted partner for modern and durable furniture. We guarantee the best quality and craftsmanship.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-foreground">Products</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/products?cat=door" className="hover:text-primary">Doors</Link></li>
                <li><Link href="/products?cat=bed" className="hover:text-primary">Beds</Link></li>
                <li><Link href="/products?cat=sofa" className="hover:text-primary">Sofas</Link></li>
                <li><Link href="/products?cat=cupboard" className="hover:text-primary">Cupboards</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-foreground">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><MapPin size={16} /> Roysambu, Nairobi</li>
                <li className="flex items-center gap-2"><Phone size={16} /> +254 724 810412</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-foreground">Follow Us</h4>
              <div className="flex gap-4">
                <a href="#" className="hover:text-primary"><Facebook /></a>
                <a href="#" className="hover:text-primary"><Instagram /></a>
              </div>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-sm">
            &copy; 2025 Decorvibe Furniture. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}