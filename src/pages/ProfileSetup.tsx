import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Camera, Upload } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useProfile } from '@/hooks/useProfile';
import { useRole } from '@/hooks/useRole';
import { useNavigate } from 'react-router-dom';
import { UserProfile, UserRole, ProductType, RegistrationType } from '@/types/user';
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
    city: profile?.city || '',
    state: profile?.state || '',
    country: profile?.country || 'India',
    pincode: profile?.pincode || '',
    companyName: profile?.companyName || '',
    registrationType: profile?.registrationType || 'private_limited',
    officeEmail: profile?.officeEmail || '',
    isGstRegistered: profile?.isGstRegistered || false,
    establishedYear: profile?.establishedYear || new Date().getFullYear().toString(),
    businessType: profile?.businessType || '',
    dealingWith: profile?.dealingWith || 'RCN' as ProductType,
    description: profile?.description || '',
    profilePicture: profile?.profilePicture || user?.imageUrl || '',
    officeAddress: '',
    officePhone: ''
  });

  const [selectedRole, setSelectedRole] = useState<UserRole>(role);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Image crop functionality will be implemented when needed

  const validateField = (field: string, value: string | boolean | number) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'phone':
        if (value && !/^[0-9]{10}$/.test(String(value).replace(/[\s\-\(\)]/g, ''))) {
          newErrors.phone = 'Please enter a valid 10-digit phone number';
        } else if (value == "") {
          newErrors.phone = 'Phone Number Required'

        } else {
          delete newErrors.phone;
        }
        break;
      case 'pincode':
        if (value && !/^[0-9]{6}$/.test(String(value))) {
          newErrors.pincode = 'Please enter a valid 6-digit pincode';
        } else {
          delete newErrors.pincode;
        }
        break;
      case 'officeEmail':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
          newErrors.officeEmail = 'Please enter a valid email address';
        } else {
          delete newErrors.officeEmail;
        }
        break;
      case 'establishedYear': {
        const year = parseInt(String(value));
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 1900 || year > currentYear) {
          newErrors.establishedYear = `Please enter a valid year between 1900 and ${currentYear}`;
        } else {
          delete newErrors.establishedYear;
        }
        break;
      }
      case 'address':
        if (value && String(value).length < 10) {
          newErrors.address = 'Address must be at least 10 characters';
        } else {
          delete newErrors.address;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (['phone', 'pincode', 'officeEmail', 'establishedYear', 'address'].includes(field)) {
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
      id: user?.id || crypto.randomUUID(),
      email: formData.email,
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      pincode: formData.pincode,
      role: selectedRole,
      profilePicture: formData.profilePicture,
      companyName: formData.companyName,
      registrationType: formData.registrationType as RegistrationType,
      officeEmail: formData.officeEmail,
      isGstRegistered: formData.isGstRegistered,
      establishedYear: formData.establishedYear,
      businessType: formData.businessType,
      dealingWith: formData.dealingWith,
      description: formData.description,
      isProfileComplete: true,
      userId: user?.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProfile(profileData);
    setRole(selectedRole);
    navigate('/');
  };

  const isFormValid =
    formData.name &&
    formData.email &&
    formData.companyName &&
    formData.officeEmail &&
    formData.registrationType &&
    formData.establishedYear &&
    formData.city &&
    formData.state &&
    formData.country &&
    formData.pincode &&
    formData.description &&
    formData.phone.length == 10

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
              <ToggleGroup
                type="single"
                value={selectedRole}
                onValueChange={(value: UserRole) => setSelectedRole(value)}
                className="grid grid-cols-3 gap-2"
              >
                <ToggleGroupItem value="buyer" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  Buyer
                </ToggleGroupItem>
                <ToggleGroupItem value="processor" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  Merchant/Processor
                </ToggleGroupItem>
                <ToggleGroupItem value="both" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  Both
                </ToggleGroupItem>
              </ToggleGroup>
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
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  maxLength={10}
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter city"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your complete address"
                rows={3}
                className={errors.address ? 'border-destructive' : ''}
                required
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
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationType">Registration Type *</Label>
                  <Select
                    value={formData.registrationType}
                    onValueChange={(value) => handleInputChange('registrationType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select registration type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private_limited">Private Limited</SelectItem>
                      <SelectItem value="public_limited">Public Limited</SelectItem>
                      <SelectItem value="llp">LLP (Limited Liability Partnership)</SelectItem>
                      <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="officeEmail">Office Email *</Label>
                  <Input
                    id="officeEmail"
                    type="email"
                    value={formData.officeEmail}
                    onChange={(e) => handleInputChange('officeEmail', e.target.value)}
                    placeholder="Enter office email"
                    className={errors.officeEmail ? 'border-destructive' : ''}
                    required
                  />
                  {errors.officeEmail && <p className="text-sm text-destructive">{errors.officeEmail}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="establishedYear">Established Year *</Label>
                  <Input
                    id="establishedYear"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={formData.establishedYear}
                    onChange={(e) => handleInputChange('establishedYear', e.target.value)}
                    className={errors.establishedYear ? 'border-destructive' : ''}
                    required
                  />
                  {errors.establishedYear && <p className="text-sm text-destructive">{errors.establishedYear}</p>}
                </div>

                <div className="flex items-end space-x-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isGstRegistered"
                      checked={formData.isGstRegistered}
                      onCheckedChange={(checked) => handleInputChange('isGstRegistered', checked as boolean)}
                    />
                    <Label htmlFor="isGstRegistered" className="text-sm font-medium leading-none">
                      GST Registered
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="Enter state"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => handleInputChange('country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="France">France</SelectItem>
                      <SelectItem value="Japan">Japan</SelectItem>
                      <SelectItem value="China">China</SelectItem>
                      <SelectItem value="Brazil">Brazil</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    type="number"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    placeholder="Enter pincode"
                    className={errors.pincode ? 'border-destructive' : ''}
                    required
                  />
                  {errors.pincode && <p className="text-sm text-destructive">{errors.pincode}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="officeAddress">Address</Label>
                  <Textarea
                    id="officeAddress"
                    value={formData.officeAddress}
                    onChange={(e) => handleInputChange('officeAddress', e.target.value)}
                    placeholder="Enter business address"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="officePhone">Phone Number</Label>
                  <Input
                    id="officePhone"
                    value={formData.officePhone}
                    onChange={(e) => handleInputChange('officePhone', e.target.value)}
                    placeholder="Enter business phone number"
                    maxLength={15}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dealing With *</Label>
                <ToggleGroup
                  type="single"
                  value={formData.dealingWith}
                  onValueChange={(value: ProductType) => handleInputChange('dealingWith', value)}
                  className="grid grid-cols-3 gap-2"
                >
                  <ToggleGroupItem value="RCN" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                    RCN
                  </ToggleGroupItem>
                  <ToggleGroupItem value="Kernel" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                    Kernel
                  </ToggleGroupItem>
                  <ToggleGroupItem value="Both" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                    Both
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Tell us about your business"
                  rows={4}
                  required
                />
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="businessType">Business Type *</Label>
                <Select
                  value={formData.businessType}
                  onValueChange={(value) => handleInputChange('businessType', value)}
                >
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
              </div> */}
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full"
              size="lg"
              disabled={!isFormValid}
            >
              Save
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Image cropping functionality will be added when needed */}
    </div>
  );
};

export default ProfileSetup;