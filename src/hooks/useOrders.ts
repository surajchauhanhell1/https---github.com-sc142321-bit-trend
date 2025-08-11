import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_method: string;
  shipping_address: string;
  contact_info: any;
  created_at: string;
  updated_at: string;
  processing_date?: string;
  shipped_date?: string;
  delivered_date?: string;
  order_items: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    image_url: string;
  };
}

export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              name,
              image_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        return;
      }

      setOrders(data || []);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: {
    total_amount: number;
    payment_method: string;
    shipping_address: string;
    contact_info: any;
    items: Array<{
      product_id: string;
      quantity: number;
      price: number;
    }>;
  }) => {
    if (!user) return null;

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: orderData.total_amount,
          payment_method: orderData.payment_method,
          shipping_address: orderData.shipping_address,
          contact_info: orderData.contact_info,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      // Insert order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        throw itemsError;
      }

      await fetchOrders();
      return order;
    } catch (err) {
      setError('Failed to create order');
      console.error('Error creating order:', err);
      return null;
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      // Try RPC function first
      try {
        const { error } = await supabase.rpc('update_order_status', {
          p_order_id: orderId,
          p_new_status: status,
        });
        
        if (error) {
          console.error('RPC error:', error);
          throw error;
        }
        
        await fetchOrders();
        return true;
      } catch (rpcError: any) {
        console.error('RPC failed, trying direct update:', rpcError);
        
        // Fallback: direct update for specific cases
        if (status === 'cancelled') {
          const { error } = await supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', orderId);
            
          if (error) {
            console.error('Direct update error:', error);
            throw error;
          }
          
          await fetchOrders();
          return true;
        }
        
        throw rpcError;
      }
    } catch (err: any) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
      return false;
    }
  };

  useEffect(() => {
    fetchOrders();
    // real-time refresh on order changes
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    refetchOrders: fetchOrders
  };
};