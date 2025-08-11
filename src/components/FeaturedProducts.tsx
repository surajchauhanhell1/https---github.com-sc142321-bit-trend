import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/hooks/useWishlist';
import { useToast } from '@/hooks/use-toast';
import { resolveImageUrl } from '@/lib/resolveImageUrl';
import productMensShirt from '@/assets/product-mens-shirt.jpg';
import productWomensDress from '@/assets/product-womens-dress.jpg';
import productCosmetics from '@/assets/product-cosmetics-lipstick.jpg';
import productMensShoes from '@/assets/product-mens-shoes.jpg';

const FeaturedProducts = () => {
  const { data: allProducts, isLoading } = useProducts();
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  // Get first 4 products for featured section
  const products = allProducts?.slice(0, 4) || [];

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: resolveImageUrl(product.image_url),
      category: product.category
    });
  };

  const handleWishlistToggle = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    if (isInWishlist(product.id)) {
      removeFromWishlist.mutate(product.id);
    } else {
      addToWishlist.mutate(product.id);
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">Loading featured products...</div>
          </div>
        </div>
      </section>
    );
  }

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return '₹0';
    return `₹${price.toLocaleString()}`;
  };

  const getDiscountPercentage = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">Featured Products</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our hand-picked selection of trending items across fashion and beauty
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="elegant-card group cursor-pointer">
              {/* Product Image */}
              <div className="relative overflow-hidden rounded-lg mb-4">
                <img
                  src={resolveImageUrl(product.image_url)}
                  alt={product.name}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Stock Badge */}
                {product.stock_quantity === 0 && (
                  <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-xs font-semibold">
                    OUT OF STOCK
                  </div>
                )}
                
                {/* Quick Actions */}
                <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={(e) => handleWishlistToggle(product, e)}
                    className="p-2 bg-card rounded-full shadow-md hover:bg-accent transition-[var(--transition-smooth)]"
                  >
                    <Heart className={`h-4 w-4 ${
                      isInWishlist(product.id) 
                        ? 'text-destructive fill-current' 
                        : 'text-muted-foreground hover:text-destructive'
                    }`} />
                  </button>
                  <button 
                    onClick={(e) => handleAddToCart(product, e)}
                    className="p-2 bg-card rounded-full shadow-md hover:bg-accent transition-[var(--transition-smooth)]"
                  >
                    <ShoppingCart className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                {/* Category */}
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  {product.category}
                </div>
                
                {/* Product Name */}
                <Link 
                  to={`/product/${product.id}`}
                  className="block hover:text-primary transition-[var(--transition-smooth)]"
                >
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                </Link>

                {/* Category */}
                <div className="flex items-center mb-3">
                  <span className="text-sm font-medium text-muted-foreground capitalize">
                    {product.category}
                  </span>
                  <span className="text-sm text-muted-foreground ml-auto">
                    Stock: {product.stock_quantity}
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product?.price)}
                    </span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button 
                  onClick={(e) => handleAddToCart(product, e)}
                  className="w-full mt-4 btn-primary py-2 text-sm hover:transform hover:scale-105"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link to="/shop" className="btn-secondary inline-flex items-center space-x-2">
            <span>View All Products</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;