import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { User, Store } from 'lucide-react';

const Login = () => {
  const [loginType, setLoginType] = useState<'customer' | 'merchant' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginType && email && password) {
      await login(email, password, loginType);
    }
  };

  if (!loginType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">CM</span>
            </div>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl font-bold text-primary mb-2">Cashew Marketplace</h1>
          <p className="text-muted-foreground mb-8">
            Choose your login type to continue
          </p>

          {/* Login Type Selection */}
          <div className="space-y-4">
            <Card 
              className="cursor-pointer hover:shadow-warm transition-all border-2 hover:border-primary/20"
              onClick={() => setLoginType('customer')}
            >
              <CardContent className="flex items-center space-x-4 p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Login as Customer</h3>
                  <p className="text-muted-foreground text-sm">Browse and purchase cashews</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-warm transition-all border-2 hover:border-primary/20"
              onClick={() => setLoginType('merchant')}
            >
              <CardContent className="flex items-center space-x-4 p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Store className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Login as Merchant</h3>
                  <p className="text-muted-foreground text-sm">Sell and manage your inventory</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">CM</span>
            </div>
          </div>
          <CardTitle className="text-2xl">
            {loginType === 'customer' ? 'Customer Login' : 'Merchant Login'}
          </CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Login as {loginType === 'customer' ? 'Customer' : 'Merchant'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setLoginType(null)}
            >
              Back to login options
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
