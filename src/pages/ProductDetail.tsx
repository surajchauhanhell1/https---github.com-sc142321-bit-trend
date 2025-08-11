import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { Heart, ShoppingCart, Star, ArrowLeft, Truck, Shield, RotateCcw } from 'lucide-react';
import Header from '@/components/Header';
import { useProduct } from '@/hooks/useProducts';
import { useProductMedia } from '@/hooks/useProductMedia';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductMediaGallery from '@/components/ProductMediaGallery';
import { resolveImageUrl } from '@/lib/resolveImageUrl';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addItem, isInCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { data: product, isLoading, error } = useProduct(id || '');
  const { data: productMedia = [] } = useProductMedia(id || '');
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded"></div>
              <div className="space-y-4">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
            <Link to="/" className="btn-primary">
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inWishlist = user && isInWishlist(product.id);
  const inCart = isInCart(product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: resolveImageUrl(product.image_url),
        category: product.category
      });
    }
  };

  const handleWishlistToggle = () => {
    if (!user) return;
    
    if (inWishlist) {
      removeFromWishlist.mutate(product.id);
    } else {
      addToWishlist.mutate(product.id);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to={`/${product.category.toLowerCase()}`} className="hover:text-primary capitalize">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        {/* Back Button */}
        <Link to="/" className="inline-flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Products</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Media Gallery */}
          <ProductMediaGallery 
            media={productMedia}
            productName={product.name}
            fallbackImage={resolveImageUrl(product.image_url)}
          />

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            <Badge variant="secondary" className="uppercase">
              {product.category}
            </Badge>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < 4 ? 'text-yellow-500 fill-current' : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(4.0) 124 reviews</span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-primary">₹{product.price}</span>
              <span className="text-xl text-muted-foreground line-through">₹{Math.round(product.price * 1.25)}</span>
              <Badge variant="destructive">20% OFF</Badge>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-semibold">Description</h3>
              <p className="text-muted-foreground">
                {product.description || "Premium quality product crafted with attention to detail. Perfect for everyday use with excellent durability and style."}
              </p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${product.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">
                {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Quantity Selector */}
            {product.stock_quantity > 0 && (
              <div className="space-y-2">
                <label className="font-semibold">Quantity</label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    disabled={quantity >= product.stock_quantity}
                  >
                    +
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                  className="flex-1"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {inCart ? 'Add More to Cart' : 'Add to Cart'}
                </Button>
                
                {user && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleWishlistToggle}
                    className={inWishlist ? 'text-red-500 border-red-500' : ''}
                  >
                    <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
                  </Button>
                )}
              </div>

              <Button variant="secondary" size="lg" className="w-full">
                Buy Now
              </Button>
            </div>

            {/* Features */}
            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-sm">Free shipping on orders above ₹999</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm">100% secure payment</span>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="h-5 w-5 text-primary" />
                <span className="text-sm">7-day return policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;