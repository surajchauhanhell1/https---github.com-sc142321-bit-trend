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
      // Try Edge Function first (bypasses RLS safely via service role)
      try {
        // Get the current session token for proper authentication
        const { data: { session } } = await supabase.auth.getSession();
        const authToken = session?.access_token;
        
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const res = await fetch(`${supabaseUrl}/functions/v1/update-order-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken ? `Bearer ${authToken}` : `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ orderId, newStatus: status }),
        });
        if (res.ok) {
          await fetchOrders();
          return true;
        }
      } catch (_) {
        // ignore and fall back
      }

      // Try RPC first if available
      let rpcError: any | null = null;
      try {
        const { error } = await (supabase as any).rpc('update_order_status', {
          p_order_id: orderId,
          p_new_status: status,
        });
        if (!error) {
          await fetchOrders();
          return true;
        }
        rpcError = error;
      } catch (e) {
        rpcError = e;
      }

      // Fallback 1: direct update (works for admins with permissive policy)
      let { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      // Fallback 2: owner-constrained cancellation when pending/processing
      if (error && status === 'cancelled' && user) {
        const retry = await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', orderId)
          .eq('user_id', user.id)
          .in('status', ['pending', 'processing']);
        error = retry.error || null;
      }

      if (error) {
        throw error ?? rpcError ?? new Error('Update blocked by RLS');
      }

      await fetchOrders();
      return true;
    } catch (err: any) {
      const message = typeof err?.message === 'string' ? err.message : 'Failed to update order status';
      setError(message);
      console.error('Error updating order status:', err);
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