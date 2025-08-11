import { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Navigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut, Home, Trash2, Edit, Image } from 'lucide-react';
import { normalizeImageInput } from '@/lib/resolveImageUrl';
import AdminProductMedia from '@/components/AdminProductMedia';

const AdminPanel = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: 'Shirts',
    image_url: '',
    description: '',
    sizes: '',
    stock_quantity: '10',
    is_sold_out: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name: productForm.name,
          price: parseFloat(productForm.price),
          category: (productForm.category || '').toLowerCase(),
          image_url: productForm.image_url || null,
          description: productForm.description || null,
          stock_quantity: productForm.is_sold_out ? 0 : parseInt(productForm.stock_quantity)
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product added successfully!",
      });

      // Reset form
      setProductForm({
        name: '',
        price: '',
        category: 'Shirts',
        image_url: '',
        description: '',
        sizes: '',
        stock_quantity: '10',
        is_sold_out: false
      });

      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setProductForm({
      name: '',
      price: '',
      category: 'Shirts',
      image_url: '',
      description: '',
      sizes: '',
      stock_quantity: '10',
      is_sold_out: false
    });
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully!",
      });

      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const categories = ['Men', 'Women', 'Cosmetics'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Szone Admin Panel</h1>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
                <Home className="h-4 w-4 inline mr-1" />
                Home
              </Link>
              <Button 
                onClick={handleLogout}
                variant="destructive"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add New Product Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Add New Product</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input
                    id="product-name"
                    value={productForm.name}
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price (INR)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="Enter price"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={productForm.category}
                    onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="image-url">Image URL or asset file name</Label>
                  <Input
                    id="image-url"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm(prev => ({ ...prev, image_url: normalizeImageInput(e.target.value) }))}
                    placeholder="https://... or product-mens-shirt.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={productForm.description}
                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                  <Input
                    id="sizes"
                    value={productForm.sizes}
                    onChange={(e) => setProductForm(prev => ({ ...prev, sizes: e.target.value }))}
                    placeholder="S, M, L, XL"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sold-out"
                    checked={productForm.is_sold_out}
                    onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, is_sold_out: checked as boolean }))}
                  />
                  <Label htmlFor="sold-out">Mark as Sold Out</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Product'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleClear}
                    className="px-8"
                  >
                    Clear
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Current Products */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Current Products</CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="text-center py-8">Loading products...</div>
              ) : !products || products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No products found</div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {products.map((product) => (
                    <div key={product.id} className="space-y-4">
                      <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                                ((e.currentTarget.nextElementSibling as HTMLElement)!).style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center ${product.image_url ? 'hidden' : ''}`}>
                            {product.category.slice(0, 8)}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.category} - ₹{product.price}</p>
                          {product.stock_quantity === 0 && (
                            <Badge variant="destructive" className="mt-1">Out of Stock</Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedProductId(
                              selectedProductId === product.id ? null : product.id
                            )}
                          >
                            <Image className="h-4 w-4 mr-1" />
                            Media
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                      
                      {/* Product Media Management */}
                      {selectedProductId === product.id && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <AdminProductMedia productId={product.id} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;