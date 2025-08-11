import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { toast } from '@/hooks/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    console.log('Auth useEffect:', { user: !!user, isAdmin, adminLoading, isAdminLogin });
    if (user && !adminLoading) {
      if (isAdminLogin && isAdmin) {
        console.log('Redirecting to admin dashboard');
        navigate('/admin');
      } else if (user && !isAdminLogin) {
        console.log('Redirecting to home');
        navigate('/');
      }
    }
  }, [user, isAdmin, adminLoading, isAdminLogin, navigate]);

  const handleLogin = async (e: React.FormEvent, adminLogin = false) => {
    e.preventDefault();
    setIsLoading(true);
    setIsAdminLogin(adminLogin);

    console.log('Login attempt:', { email: loginData.email, adminLogin });

    try {
      const { error } = await signIn(loginData.email, loginData.password);
      
      if (error) {
        console.error('Login error:', error);
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        console.log('Login successful');
        toast({
          title: 'Welcome back!',
          description: 'You have been successfully logged in.'
        });
        
        // For admin login, navigate directly to admin dashboard
        if (adminLogin) {
          console.log('Navigating to admin dashboard');
          navigate('/admin');
        }
      }
    } catch (error) {
      console.error('Login exception:', error);
      toast({
        title: 'Login failed',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: 'Registration failed',
        description: 'Passwords do not match',
        variant: 'destructive'
      });
      return;
    }

    if (registerData.password.length < 6) {
      toast({
        title: 'Registration failed',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(registerData.email, registerData.password, registerData.name);
      
      if (error) {
        toast({
          title: 'Registration failed',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Registration successful!',
          description: 'Please check your email to verify your account.'
        });
      }
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Welcome to Trendora</h1>
            <p className="text-muted-foreground">Sign in to your account or create a new one</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <label htmlFor="login-email" className="block text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          required
                          value={loginData.email}
                          onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your.email@example.com"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="login-password" className="block text-sm font-medium mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={loginData.password}
                          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                        />
                        <Button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
                          variant="ghost"
                          size="sm"
                        >
                          {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>

                    <div className="text-right">
                      <a href="#" className="text-sm text-primary hover:underline">
                        Forgot Password?
                      </a>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="admin">
                  <form onSubmit={(e) => handleLogin(e, true)} className="space-y-6">
                    <div>
                      <label htmlFor="admin-email" className="block text-sm font-medium mb-2">
                        Admin Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="admin-email"
                          type="email"
                          required
                          value={loginData.email}
                          onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="admin.email@example.com"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="admin-password" className="block text-sm font-medium mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="admin-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={loginData.password}
                          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                        />
                        <Button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
                          variant="ghost"
                          size="sm"
                        >
                          {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : 'Admin Sign In'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                      <label htmlFor="register-name" className="block text-sm font-medium mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-name"
                          type="text"
                          required
                          value={registerData.name}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Your full name"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="register-email" className="block text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-email"
                          type="email"
                          required
                          value={registerData.email}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your.email@example.com"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="register-password" className="block text-sm font-medium mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={registerData.password}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Create a password"
                          className="pl-10 pr-10"
                        />
                        <Button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
                          variant="ghost"
                          size="sm"
                        >
                          {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="register-confirm" className="block text-sm font-medium mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-confirm"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirm your password"
                          className="pl-10 pr-10"
                        />
                        <Button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
                          variant="ghost"
                          size="sm"
                        >
                          {showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;