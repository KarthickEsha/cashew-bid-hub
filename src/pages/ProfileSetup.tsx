import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useProfile } from '@/hooks/useProfile';
import { useRole } from '@/hooks/useRole';
import { useNavigate } from 'react-router-dom';
import { UserProfile, UserRole, ProductType } from '@/types/user';
// ImageCropDialog will be implemented when needed

const ProfileSetup = () => {
  const { user } = useUser();
  const { profile, setProfile } = useProfile();
  const { role, setRole } = useRole();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: profile?.name || user?.fullName || '',
    email: profile?.email || user?.primaryEmailAddress?.emailAddress || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    location: profile?.location || '',
    companyName: profile?.companyName || '',
    businessType: profile?.businessType || '',
    productType: profile?.productType || 'RCN' as ProductType,
    profilePicture: profile?.profilePicture || user?.imageUrl || ''
  });
  
  const [selectedRole, setSelectedRole] = useState<UserRole>(role);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Image crop functionality will be implemented when needed

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'phone':
        if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
          newErrors.phone = 'Please enter a valid phone number';
        } else {
          delete newErrors.phone;
        }
        break;
      case 'location':
        if (value && value.length < 2) {
          newErrors.location = 'Location must be at least 2 characters';
        } else {
          delete newErrors.location;
        }
        break;
      case 'address':
        if (value && value.length < 10) {
          newErrors.address = 'Address must be at least 10 characters';
        } else {
          delete newErrors.address;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (['phone', 'location', 'address'].includes(field)) {
      validateField(field, value);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, profilePicture: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const profileData: UserProfile = {
      ...formData,
      role: selectedRole,
      isProfileComplete: true,
      id: user?.id || crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setProfile(profileData);
    setRole(selectedRole);
    navigate('/');
  };

  const isFormValid = formData.name && formData.email && formData.companyName && formData.businessType && Object.keys(errors).length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">Complete Your Profile</CardTitle>
            <CardDescription>
              Please fill in your details to get started with Cashew Marketplace
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.profilePicture} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {formData.name?.charAt(0) || user?.firstName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 rounded-full p-2"
                  onClick={() => document.getElementById('profile-picture-input')?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  id="profile-picture-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>
              <p className="text-sm text-muted-foreground">Click to upload profile picture</p>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label>I am a</Label>
              <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="processor">Merchant/Processor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, Country"
                  className={errors.location ? 'border-destructive' : ''}
                />
                {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your complete address"
                rows={3}
                className={errors.address ? 'border-destructive' : ''}
              />
              {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Business Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manufacturer">Manufacturer</SelectItem>
                      <SelectItem value="trader">Trader</SelectItem>
                      <SelectItem value="exporter">Exporter</SelectItem>
                      <SelectItem value="importer">Importer</SelectItem>
                      <SelectItem value="processor">Processor</SelectItem>
                      <SelectItem value="retailer">Retailer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedRole === 'processor' && (
                <div className="space-y-2">
                  <Label htmlFor="productType">Product Type</Label>
                  <Select value={formData.productType} onValueChange={(value: ProductType) => handleInputChange('productType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RCN">Raw Cashew Nuts (RCN)</SelectItem>
                      <SelectItem value="Kernel">Cashew Kernels</SelectItem>
                      <SelectItem value="Both">Both RCN & Kernels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Button 
              onClick={handleSubmit} 
              className="w-full" 
              size="lg"
              disabled={!isFormValid}
            >
              Complete Profile & Continue
            </Button>
          </CardContent>
        </Card>
      </div>

{/* Image cropping functionality will be added when needed */}
    </div>
  );
};

export default ProfileSetup;