-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('men', 'women', 'cosmetics')),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wishlist table
CREATE TABLE public.wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Products policies (public read access)
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert products" 
ON public.products 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update products" 
ON public.products 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete products" 
ON public.products 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

-- Wishlist policies
CREATE POLICY "Users can view their own wishlist" 
ON public.wishlist 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can add to their wishlist" 
ON public.wishlist 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can remove from their wishlist" 
ON public.wishlist 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample products
INSERT INTO public.products (name, description, price, image_url, category, stock_quantity) VALUES
-- Men's products
('Classic Denim Jacket', 'Premium quality denim jacket perfect for casual wear', 2999.00, '/src/assets/product-mens-shirt.jpg', 'men', 25),
('Leather Formal Shoes', 'Handcrafted leather shoes for formal occasions', 4999.00, '/src/assets/product-mens-shoes.jpg', 'men', 15),
('Cotton Casual Shirt', 'Comfortable cotton shirt for everyday wear', 1299.00, '/src/assets/product-mens-shirt.jpg', 'men', 40),
('Slim Fit Chinos', 'Modern slim fit chinos in multiple colors', 1899.00, '/src/assets/product-mens-shirt.jpg', 'men', 30),

-- Women's products
('Elegant Summer Dress', 'Flowing summer dress perfect for any occasion', 2499.00, '/src/assets/product-womens-dress.jpg', 'women', 20),
('Designer Handbag', 'Stylish handbag that complements any outfit', 3499.00, '/src/assets/product-womens-dress.jpg', 'women', 18),
('Floral Print Blouse', 'Beautiful floral blouse for spring and summer', 1599.00, '/src/assets/product-womens-dress.jpg', 'women', 35),
('High-Waist Jeans', 'Comfortable high-waist jeans with perfect fit', 2199.00, '/src/assets/product-womens-dress.jpg', 'women', 25),

-- Cosmetics products
('Matte Lipstick Set', 'Long-lasting matte lipstick in 6 stunning shades', 1999.00, '/src/assets/product-cosmetics-lipstick.jpg', 'cosmetics', 50),
('Hydrating Face Cream', 'Nourishing face cream for all skin types', 2799.00, '/src/assets/product-cosmetics-lipstick.jpg', 'cosmetics', 30),
('Eyeshadow Palette', 'Professional eyeshadow palette with 12 colors', 2299.00, '/src/assets/product-cosmetics-lipstick.jpg', 'cosmetics', 40),
('Foundation & Concealer Kit', 'Complete coverage foundation with concealer', 3199.00, '/src/assets/product-cosmetics-lipstick.jpg', 'cosmetics', 22);