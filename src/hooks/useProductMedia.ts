import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductMedia {
  id: string;
  product_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  display_order: number;
  alt_text: string | null;
  created_at: string;
  updated_at: string;
}

export const useProductMedia = (productId: string) => {
  return useQuery({
    queryKey: ['product-media', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_media')
        .select('*')
        .eq('product_id', productId)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as ProductMedia[];
    },
    enabled: !!productId
  });
};

export const useAddProductMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (media: Omit<ProductMedia, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('product_media')
        .insert(media)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-media', data.product_id] });
    }
  });
};

export const useDeleteProductMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (mediaId: string) => {
      const { error } = await supabase
        .from('product_media')
        .delete()
        .eq('id', mediaId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-media'] });
    }
  });
};