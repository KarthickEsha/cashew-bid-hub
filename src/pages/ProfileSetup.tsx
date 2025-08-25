import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, User, Building2 } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useRole } from '@/hooks/useRole';
import { ProductType, UserRole } from '@/types/user';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { setProfile } = useProfile();
  const { setRole } = useRole();
  
  const [formData, setFormData] = useState({
    name: 'John Doe', // Placeholder for OAuth data
    address: '',
    location: '',
    role: 'buyer' as UserRole,
    productType: 'RCN' as ProductType,
    profilePicture: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set profile data
    setProfile({
      id: '1',
      email: 'user@example.com', // Placeholder for OAuth data
      name: formData.name,
      address: formData.address,
      location: formData.location,
      role: formData.role,
      profilePicture: formData.profilePicture,
      merchantLogo: formData.role === 'processor' ? formData.profilePicture : undefined,
      productType: formData.productType,
      isProfileComplete: true,
    });

    // Set role for sidebar switching
    setRole(formData.role);
    
    // Navigate to appropriate dashboard
    navigate('/');
  };

  const handleImageUpload = () => {
    // Placeholder for image upload functionality
    setFormData({ ...formData, profilePicture: '/placeholder.svg' });
  };

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-warm">
        <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Complete Your Profile</CardTitle>
          <CardDescription>
            Help us personalize your experience by providing some basic information
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture/Logo Upload */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={formData.profilePicture} />
                <AvatarFallback className="bg-muted">
                  {formData.role === 'processor' ? (
                    <Building2 className="w-8 h-8 text-muted-foreground" />
                  ) : (
                    <User className="w-8 h-8 text-muted-foreground" />
                  )}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleImageUpload}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload {formData.role === 'processor' ? 'Logo' : 'Photo'}
              </Button>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter your address"
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter your location"
                required
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <Label>I am a</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="processor">Processor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Type Selection */}
            <div className="space-y-3">
              <Label>Product Type</Label>
              <RadioGroup
                value={formData.productType}
                onValueChange={(value: ProductType) => setFormData({ ...formData, productType: value })}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="RCN" id="rcn" />
                  <Label htmlFor="rcn">RCN (Raw Cashew Nuts)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Kernel" id="kernel" />
                  <Label htmlFor="kernel">Kernel</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Both" id="both" />
                  <Label htmlFor="both">Both</Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full">
              Complete Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;