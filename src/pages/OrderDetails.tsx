import React from 'react';
import Header from '@/components/Header';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, CheckCircle, Clock, Package, Truck } from 'lucide-react';
import { resolveImageUrl } from '@/lib/resolveImageUrl';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orders, loading, updateOrderStatus } = useOrders();
  const { toast } = useToast();

  const order = orders.find(o => o.id === orderId);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Order Details</h1>
            <p className="text-muted-foreground mb-6">Please sign in to view order details.</p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button onClick={() => navigate('/my-orders')}>Back to My Orders</Button>
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTrackingSteps = () => {
    const steps = [
      {
        status: 'Order Placed',
        date: order.created_at,
        completed: true,
        icon: CheckCircle
      },
      {
        status: 'Processing',
        date: order.processing_date,
        completed: !!order.processing_date,
        icon: Package
      },
      {
        status: 'Shipped',
        date: order.shipped_date,
        completed: !!order.shipped_date,
        icon: Truck
      },
      {
        status: 'Delivered',
        date: order.delivered_date,
        completed: !!order.delivered_date,
        icon: CheckCircle
      }
    ];

    return steps;
  };

  const handleStatusUpdate = async (newStatus: string) => {
    await updateOrderStatus(order.id, newStatus);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/my-orders')}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to My Orders
          </Button>

          {/* Order Header */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl">Order ID: {order.id.slice(0, 10).toUpperCase()}</h1>
                  <p className="text-muted-foreground">
                    Placed on {formatDate(order.created_at)} at {formatTime(order.created_at)}
                  </p>
                  {order.status === 'cancelled' && (
                    <p className="text-red-600 font-medium mt-2">
                      Order Cancelled
                    </p>
                  )}
                </div>
                <Badge className={`${getStatusColor(order.status)} text-white capitalize`}>
                  {order.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-bold">₹{order.total_amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                  <p className="capitalize">{order.payment_method}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Items</p>
                  <p>{order.order_items?.length || 0} item(s)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Timeline */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getTrackingSteps().map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        step.completed 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className={`font-medium ${
                            step.completed ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {step.status}
                          </span>
                          {step.date && (
                            <span className="text-sm text-muted-foreground">
                              {formatDate(step.date)} at {formatTime(step.date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <img 
                      src={resolveImageUrl(item.product?.image_url)} 
                      alt={item.product?.name}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product?.name}</h4>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      <p className="text-sm font-medium">₹{item.price.toFixed(2)} each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">Delivery Address:</p>
                <p className="text-muted-foreground">{order.shipping_address}</p>
                {order.contact_info && (
                  <div className="mt-4">
                    <p className="font-medium">Contact Information:</p>
                    <p className="text-muted-foreground">
                      {order.contact_info.email && `Email: ${order.contact_info.email}`}
                    </p>
                    <p className="text-muted-foreground">
                      {order.contact_info.phone && `Phone: ${order.contact_info.phone}`}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Admin Controls */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle>Update Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {order.status === 'pending' && (
                    <Button onClick={() => handleStatusUpdate('processing')}>
                      Mark as Processing
                    </Button>
                  )}
                  {order.status === 'processing' && (
                    <Button onClick={() => handleStatusUpdate('shipped')}>
                      Mark as Shipped
                    </Button>
                  )}
                  {order.status === 'shipped' && (
                    <Button onClick={() => handleStatusUpdate('delivered')}>
                      Mark as Delivered
                    </Button>
                  )}
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Cancel Order</Button>
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
                                toast({ title: 'Order cancelled', description: 'Order was cancelled successfully.' });
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
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;