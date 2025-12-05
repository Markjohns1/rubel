import { useAuth } from "@/lib/auth-context";
import { Button } from "./ui/button";
import { Link } from "wouter";
import { Lock, UserPlus } from "lucide-react";

export function GuestPrompt() {
  const { role } = useAuth();

  // Only show for guests
  if (role !== 'guest') return null;

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">
              Login to view our full catalog
            </h3>
            <p className="text-muted-foreground">
              Create an account to browse all products, add items to cart, and checkout
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <Link href="/login">
            <Button variant="outline" className="gap-2">
              <Lock className="h-4 w-4" />
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Register
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}