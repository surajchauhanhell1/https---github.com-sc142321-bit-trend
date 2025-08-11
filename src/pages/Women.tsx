import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { SearchBar } from '@/components/SearchBar';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

const Women = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const { data: products, isLoading } = useProducts('women', searchQuery);

  const displayedProducts = showAll ? products : products?.slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Women's Collection</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our elegant collection of women's fashion, designed for the modern woman.
          </p>
        </div>

        <div className="max-w-md mx-auto mb-8">
          <SearchBar onSearch={setSearchQuery} placeholder="Search women's products..." />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {displayedProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {products && products.length > 8 && !showAll && (
              <div className="text-center">
                <Button onClick={() => setShowAll(true)} variant="outline" size="lg">
                  View All Products ({products.length})
                </Button>
              </div>
            )}

            {products?.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found matching your search.</p>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Women;