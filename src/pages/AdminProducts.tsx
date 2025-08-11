import { useState } from 'react';
import Header from '@/components/Header';
import { useAdmin } from '@/hooks/useAdmin';
import { useProducts } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Navigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Edit, Trash2, Package, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { resolveImageUrl, normalizeImageInput } from '@/lib/resolveImageUrl';

const AdminProducts = () => {
  const { isAdmin, loading } = useAdmin();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock_quantity: '',
    image_url: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      stock_quantity: product.stock_quantity.toString(),
      image_url: product.image_url || ''
    });
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editForm.name,
          description: editForm.description || null,
          price: parseFloat(editForm.price),
          category: (editForm.category || '').toLowerCase(),
          stock_quantity: parseInt(editForm.stock_quantity),
          image_url: editForm.image_url || null
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully!",
      });

      setEditingProduct(null);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
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

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (quantity <= 5) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const categories = ['Men', 'Women', 'Cosmetics'];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Product Management</h1>
          </div>
          <Link to="/admin/add-product">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="text-center py-8">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'No products found matching your search.' : 'No products found.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock_quantity);
              
              return (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    {product.image_url ? (
                      <img
                        src={resolveImageUrl(product.image_url)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop&crop=center';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className={stockStatus.color}>
                        {stockStatus.label}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                      {product.description || 'No description available'}
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-primary">
                        ₹{product.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Stock: {product.stock_quantity}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit Product</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="edit-name">Name</Label>
                              <Input
                                id="edit-name"
                                value={editForm.name}
                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-description">Description</Label>
                              <Textarea
                                id="edit-description"
                                value={editForm.description}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor="edit-price">Price (₹)</Label>
                                <Input
                                  id="edit-price"
                                  type="number"
                                  step="0.01"
                                  value={editForm.price}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-stock">Stock</Label>
                                <Input
                                  id="edit-stock"
                                  type="number"
                                  value={editForm.stock_quantity}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, stock_quantity: e.target.value }))}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="edit-category">Category</Label>
                              <Select
                                value={editForm.category}
                                onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}
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
                              <Label htmlFor="edit-image">Image URL</Label>
                              <Input
                                id="edit-image"
                                value={editForm.image_url}
                                onChange={(e) => setEditForm(prev => ({ ...prev, image_url: normalizeImageInput(e.target.value) }))}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleUpdate} disabled={isUpdating} className="flex-1">
                                {isUpdating ? 'Updating...' : 'Update'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDelete(product.id, product.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;