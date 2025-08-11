import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/hooks/useWishlist';
import { Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Wishlist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlist, isLoading } = useWishlist();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-4xl font-bold">My Wishlist</h1>
          </div>
          <p className="text-muted-foreground">
            Your favorite products saved for later
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-semibold mb-4">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start browsing our collections and save your favorite items to your wishlist.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/men')} className="btn-primary">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Shop Men's Collection
              </Button>
              <Button onClick={() => navigate('/women')} variant="outline">
                Shop Women's Collection
              </Button>
              <Button onClick={() => navigate('/cosmetics')} variant="outline">
                Shop Cosmetics
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <p className="text-muted-foreground">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in your wishlist
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((item) => (
                <ProductCard key={item.id} product={item.products as any} />
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;