import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useWishlist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const wishlistQuery = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          id,
          product_id,
          products (
            id,
            name,
            description,
            price,
            image_url,
            category,
            stock_quantity
          )
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const addToWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id: productId });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast({ title: 'Added to wishlist!' });
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast({ title: 'Item already in wishlist', variant: 'destructive' });
      } else {
        toast({ title: 'Failed to add to wishlist', variant: 'destructive' });
      }
    }
  });

  const removeFromWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast({ title: 'Removed from wishlist' });
    },
    onError: () => {
      toast({ title: 'Failed to remove from wishlist', variant: 'destructive' });
    }
  });

  const isInWishlist = (productId: string) => {
    return wishlistQuery.data?.some(item => item.product_id === productId) || false;
  };

  return {
    wishlist: wishlistQuery.data || [],
    isLoading: wishlistQuery.isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  };
};