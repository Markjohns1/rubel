import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { api, Order, DashboardStats } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { Package, ShoppingCart, Users, DollarSign, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

const getStatusBadgeClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-500/15 text-green-700';
    case 'pending':
      return 'bg-yellow-500/15 text-yellow-700';
    case 'processing':
      return 'bg-blue-500/15 text-blue-700';
    case 'cancelled':
      return 'bg-red-500/15 text-red-700';
    default:
      return 'bg-gray-500/15 text-gray-700';
  }
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['stats'],
    queryFn: api.stats.get,
    retry: false
  });

  const { data: orders, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['orders'],
    queryFn: api.orders.list,
    retry: false
  });

  if (!user?.isAdmin) {
    setLocation('/login');
    return null;
  }

  const stats = [
    { 
      title: "Total Revenue", 
      value: statsData ? `$ ${statsData.total_sales.toLocaleString()}` : "Loading...", 
      icon: DollarSign 
    },
    { 
      title: "Total Orders", 
      value: statsData?.total_orders ?? "...", 
      icon: ShoppingCart 
    },
    { 
      title: "Products", 
      value: statsData?.total_products ?? "...", 
      icon: Package 
    },
    { 
      title: "Customers", 
      value: statsData?.total_customers ?? "...", 
      icon: Users 
    },
  ];

  const recentOrders = orders?.slice(0, 10) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-serif">{t('dashboard')}</h1>
        <div className="space-x-4">
          <Link href="/admin/products">
            <Button variant="outline">{t('manageProducts')}</Button>
          </Link>
        </div>
      </div>

      {(statsError || ordersError) && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Backend Connection Failed. Ensure FastAPI is running.
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Phone</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {ordersLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="border-t hover:bg-muted/20">
                      <td className="p-4">#{order.id.toString().padStart(3, '0')}</td>
                      <td className="p-4">{order.customer_name}</td>
                      <td className="p-4">{order.customer_phone}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent capitalize ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4">$ {order.total_amount.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
