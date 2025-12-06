import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Package, ArrowLeft, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AdminOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: api.orders.list,
    retry: false
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      api.orders.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ title: "Order status updated successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to update order", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: api.orders.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ title: "Order deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to delete order",
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredOrders = orders?.filter(order => 
    selectedStatus === "all" || order.status === selectedStatus
  ) || [];

  if (isLoading) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading orders...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-muted-foreground">Failed to load orders</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <Package className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-serif font-bold">Manage Orders</h1>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2 items-center">
        <span className="text-sm font-medium">Filter:</span>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-2">
          {filteredOrders.length} order(s)
        </span>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const items = JSON.parse(order.items || '[]');
            return (
              <Card key={order.id}>
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex flex-col lg:flex-row justify-between gap-4 mb-4 pb-4 border-b">
                    <div className="space-y-1">
                      <p className="font-bold text-lg">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.created_at && format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                      <p className="text-sm"><strong>Customer:</strong> {order.customer_name}</p>
                      <p className="text-sm"><strong>Phone:</strong> {order.customer_phone}</p>
                      {order.customer_address && (
                        <p className="text-sm"><strong>Address:</strong> {order.customer_address}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateMutation.mutate({ id: order.id, status: value })}
                      >
                        <SelectTrigger className="w-full lg:w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMutation.mutate(order.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2 mb-4">
                    <p className="font-medium text-sm">Items:</p>
                    {items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm bg-muted/30 p-2 rounded">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-medium">${(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.toUpperCase()}
                    </Badge>
                    <span className="text-xl font-bold text-primary">
                      Total: ${order.total_amount.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}