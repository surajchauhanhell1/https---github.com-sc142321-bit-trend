import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/hooks/useProducts';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '@/lib/resolveImageUrl';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addItem, isInCart } = useCart();
  const inWishlist = isInWishlist(product.id);
  const inCart = isInCart(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      return;
    }

    if (inWishlist) {
      removeFromWishlist.mutate(product.id);
    } else {
      addToWishlist.mutate(product.id);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: resolveImageUrl(product.image_url),
      category: product.category
    });
  };

  return (
    <Card className="group cursor-pointer hover:shadow-elegant transition-[var(--transition-smooth)] overflow-hidden">
      <Link to={`/product/${product.id}`}>
        <div className="relative overflow-hidden">
          <img 
            src={resolveImageUrl(product.image_url)} 
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-[var(--transition-smooth)]"
          />
          {user && (
            <Button
              onClick={handleWishlistToggle}
              className={`absolute top-3 right-3 p-2 rounded-full ${
                inWishlist 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-white/80 text-muted-foreground hover:bg-white'
              }`}
              size="sm"
            >
              <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
            </Button>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium text-foreground mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-primary font-semibold text-lg mb-3">₹{product.price}</p>
          <Button 
            onClick={handleAddToCart}
            className="w-full btn-primary"
            disabled={product.stock_quantity === 0}
          >
            {product.stock_quantity === 0 ? 'Out of Stock' : inCart ? 'Add More' : 'Add to Cart'}
          </Button>
        </CardContent>
      </Link>
    </Card>
  );
};

export default ProductCard;