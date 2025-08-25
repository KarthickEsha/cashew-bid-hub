import { useState } from 'react';
import { Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useRole } from '@/hooks/useRole';
import { useProfile } from '@/hooks/useProfile';
import { UserRole, ProductType } from '@/types/user';
import { useNavigate } from 'react-router-dom';

const RoleSwitcher = () => {
  const { role, setRole } = useRole();
  const { profile, updateProfile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // 🔑 Handle role change and redirect
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);

    if (profile) {
      updateProfile({ role: newRole });
    }

    // Map role to correct dashboard path
    const dashboardPath =
      newRole === 'buyer' ? '' : '';

    navigate(dashboardPath);
    setIsOpen(false);
  };

  // 🔑 Handle product type change (optional redirect with query param)
  const handleProductTypeChange = (newProductType: ProductType) => {
    if (profile) {
      updateProfile({ productType: newProductType });
    }

    // Redirect to dashboard with selected product type
    const dashboardPath =
      role === 'buyer'
        ? `/dashboard/buyer?productType=${newProductType}`
        : `/dashboard/merchant?productType=${newProductType}`;

    navigate(dashboardPath);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 h-9 px-3"
        >
          <Settings className="w-4 h-4" />
          <span className="capitalize">Product Type</span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">

          {/* Product Type Selection */}
          {profile && (
            <div>
              <h4 className="font-medium text-sm mb-3">Product Type</h4>
              <RadioGroup
                value={profile.productType}
                onValueChange={handleProductTypeChange}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="RCN" id="rcn-type" />
                  <Label htmlFor="rcn-type" className="text-sm">RCN</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Kernel" id="kernel-type" />
                  <Label htmlFor="kernel-type" className="text-sm">Kernel</Label>
                </div>
                {/* <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Both" id="both-type" />
                  <Label htmlFor="both-type" className="text-sm">Both</Label>
                </div> */}
              </RadioGroup>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RoleSwitcher;
