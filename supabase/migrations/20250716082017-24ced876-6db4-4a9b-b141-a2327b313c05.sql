-- Create product_media table for storing multiple images and videos
CREATE TABLE public.product_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  display_order INTEGER NOT NULL DEFAULT 0,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;

-- Create policies for product media
CREATE POLICY "Product media is viewable by everyone" 
ON public.product_media 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage all product media" 
ON public.product_media 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_product_media_updated_at
BEFORE UPDATE ON public.product_media
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_product_media_product_id ON public.product_media(product_id);
CREATE INDEX idx_product_media_display_order ON public.product_media(product_id, display_order);