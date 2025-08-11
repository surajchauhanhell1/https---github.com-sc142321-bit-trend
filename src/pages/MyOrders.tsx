import React from 'react';
import Header from '@/components/Header';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EyeIcon, XIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { resolveImageUrl } from '@/lib/resolveImageUrl';

const MyOrders = () => {
  const { user } = useAuth();
  const { orders, loading, updateOrderStatus } = useOrders();
  const { toast } = useToast();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">My Orders</h1>
            <p className="text-muted-foreground mb-6">Please sign in to view your orders.</p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-gray-500';
      case 'processing': return 'bg-yellow-500';
      case 'shipped': return 'bg-blue-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getEstimatedDelivery = (createdAt: string, status: string) => {
    const created = new Date(createdAt);
    const estimated = new Date(created);
    estimated.setDate(created.getDate() + 7); // 7 days from order
    return estimated.toLocaleDateString('en-GB');
  };

  const getStatusDates = (order: any) => {
    const dates = [];
    if (order.processing_date) {
      dates.push(`Processing: ${formatDate(order.processing_date)}`);
    }
    if (order.shipped_date) {
      dates.push(`Shipped: ${formatDate(order.shipped_date)}`);
    }
    if (order.delivered_date) {
      dates.push(`Delivered: ${formatDate(order.delivered_date)}`);
    }
    return dates;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">My Orders</h1>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>
          
          {orders && orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    {/* Order Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">Order ID: {order.id.slice(0, 10).toUpperCase()}</h3>
                        <p className="text-sm text-muted-foreground">
                          Placed on: {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">Total</p>
                        <p className="text-lg font-bold">₹{order.total_amount.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Estimated Delivery */}
                    <div className="mb-4">
                      <p className="text-green-600 font-medium">
                        Estimated Delivery: {getEstimatedDelivery(order.created_at, order.status)}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                      <Badge className={`${getStatusColor(order.status)} text-white capitalize`}>
                        {order.status}
                      </Badge>
                    </div>

                    {/* Status Timeline */}
                    {getStatusDates(order).length > 0 && (
                      <div className="mb-4 p-3 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">Status Timeline:</h4>
                        {getStatusDates(order).map((date, index) => (
                          <p key={index} className="text-sm text-muted-foreground">{date}</p>
                        ))}
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="space-y-3 mb-4">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                          <div className="w-16 h-16 bg-coral-200 rounded flex items-center justify-center">
                            <img 
                              src={resolveImageUrl(item.product?.image_url)} 
                              alt={item.product?.name}
                              className="w-12 h-12 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product?.name}</h4>
                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/order-details/${order.id}`)}
                        className="flex items-center gap-2"
                      >
                        <EyeIcon className="w-4 h-4" />
                        View Details
                      </Button>
                      {(order.status === 'pending' || order.status === 'processing') && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <XIcon className="w-4 h-4" />
                              Cancel Order
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. Only pending or processing orders can be cancelled.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Order</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  const ok = await updateOrderStatus(order.id, 'cancelled');
                                  if (ok) {
                                    toast({ title: 'Order cancelled', description: 'Your order was cancelled successfully.' });
                                  } else {
                                    toast({ title: 'Unable to cancel', description: 'Cancellation failed. Please try again or contact support.', variant: 'destructive' });
                                  }
                                }}
                              >
                                Yes, Cancel
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
                <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                <Button onClick={() => navigate('/shop')}>Start Shopping</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;