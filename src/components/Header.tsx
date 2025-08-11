import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  User, 
  Menu, 
  X, 
  Heart,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/hooks/useWishlist';
import { useAdmin } from '@/hooks/useAdmin';
import { SearchBar } from '@/components/SearchBar';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();
  const { isAdmin } = useAdmin();
  
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Men', href: '/men' },
    { name: 'Women', href: '/women' },
    { name: 'Cosmetics', href: '/cosmetics' },
    { name: 'My Orders', href: '/my-orders' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;


  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-bold text-primary hover:text-primary/80 transition-[var(--transition-smooth)]"
          >
            Trendora
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-[var(--transition-smooth)] relative ${
                  isActive(item.href)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                {item.name}
                {isActive(item.href) && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            
            {user && (
              <Link 
                to="/wishlist"
                className="p-2 text-muted-foreground hover:text-primary transition-[var(--transition-smooth)] relative"
              >
                <Heart className="h-5 w-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>
            )}
            
            <Link 
              to="/cart"
              className="p-2 text-muted-foreground hover:text-primary transition-[var(--transition-smooth)] relative"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Hi, {user.email?.split('@')[0]}</span>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="btn-primary flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-muted-foreground hover:text-primary transition-[var(--transition-smooth)]"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 slide-up">
            <div className="flex flex-col space-y-3">
              
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium py-2 px-3 rounded-lg transition-[var(--transition-smooth)] ${
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-primary hover:bg-muted'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="flex items-center justify-between pt-4 border-t border-border px-3">
                <div className="flex items-center space-x-4">
                  {user && (
                    <Link 
                      to="/wishlist"
                      onClick={() => setIsMenuOpen(false)}
                      className="p-2 text-muted-foreground hover:text-primary transition-[var(--transition-smooth)] relative"
                    >
                      <Heart className="h-5 w-5" />
                      {wishlist.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {wishlist.length}
                        </span>
                      )}
                    </Link>
                  )}
                  <Link 
                    to="/cart"
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 text-muted-foreground hover:text-primary transition-[var(--transition-smooth)] relative"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    )}
                  </Link>
                </div>
                
                {user ? (
                  <div className="flex items-center space-x-2">
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" size="sm">
                          Admin
                        </Button>
                      </Link>
                    )}
                    <Button 
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }} 
                      variant="outline" 
                      size="sm"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsMenuOpen(false)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;