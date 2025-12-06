import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { api } from "@/lib/api";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(10, "Full address is required"),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.username || "",
    }
  });

  if (items.length === 0) {
    setLocation('/cart');
    return null;
  }

  const onSubmit = async (data: CheckoutForm) => {
    try {
      const orderData = {
        customer_name: data.fullName,
        customer_phone: data.phone,
        customer_address: data.address,
        total_amount: cartTotal + 500,
        items: JSON.stringify(items.map(item => ({
          id: item.id,
          name: item.nameEn,
          quantity: item.quantity,
          price: item.price
        }))),
      };

      const result = await api.orders.create(orderData);

      toast({
        title: "Order Placed Successfully!",
        description: `Order #${result.order_id} created. We will contact you shortly.`,
        className: "bg-green-600 text-white border-none",
      });

      clearCart();
      
      // Redirect to order history if logged in, otherwise home
      setLocation(user ? '/order-history' : '/');
    } catch (error) {
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateWhatsAppLink = () => {
    const itemList = items.map(i => `- ${i.nameEn} x${i.quantity}`).join('\n');
    const text = `New Order:\n${itemList}\n\nTotal: $${cartTotal + 500}`;
    return `https://wa.me/+254724810412?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif font-bold mb-8">Complete Your Order</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Form */}
        <div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" {...register("fullName")} placeholder="John Doe" />
              {errors.fullName && <p className="text-destructive text-sm">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" {...register("phone")} placeholder="+254 7XX XXX XXX" />
              {errors.phone && <p className="text-destructive text-sm">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Delivery Address *</Label>
              <Textarea 
                id="address" 
                {...register("address")} 
                placeholder="House #, Street, Area, City..." 
                rows={4} 
              />
              {errors.address && <p className="text-destructive text-sm">{errors.address.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                {...register("notes")} 
                placeholder="Special instructions or delivery preferences..." 
                rows={3}
              />
            </div>

            <div className="pt-4 space-y-4">
              <Button type="submit" className="w-full text-lg h-12" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Place Order"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or order via
                  </span>
                </div>
              </div>

              <a href={generateWhatsAppLink()} target="_blank" rel="noreferrer" className="block">
                <Button type="button" variant="outline" className="w-full border-green-600 text-green-700 hover:bg-green-50">
                  WhatsApp Order
                </Button>
              </a>
            </div>
          </form>
        </div>

        {/* Summary */}
        <div className="bg-muted/30 p-6 rounded-lg border h-fit">
          <h3 className="font-bold text-xl mb-4">Order Summary</h3>
          <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto pr-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.nameEn}</span>
                <span className="font-medium">${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between font-bold">
              <span>Subtotal</span>
              <span>${cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Delivery</span>
              <span>$500</span>
            </div>
            <div className="flex justify-between font-bold text-xl text-primary pt-2 border-t">
              <span>Total</span>
              <span>${(cartTotal + 500).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}