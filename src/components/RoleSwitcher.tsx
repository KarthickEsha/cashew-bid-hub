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

const RoleSwitcher = () => {
  const { role, setRole } = useRole();
  const { profile, updateProfile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (profile) {
      updateProfile({ role: newRole });
    }
  };

  const handleProductTypeChange = (newProductType: ProductType) => {
    if (profile) {
      updateProfile({ productType: newProductType });
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 h-9 px-3"
        >
          <Settings className="w-4 h-4" />
          <span className="capitalize">{role}</span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-3">Mode</h4>
            <RadioGroup
              value={role}
              onValueChange={handleRoleChange}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="buyer" id="buyer-mode" />
                <Label htmlFor="buyer-mode" className="text-sm">Customer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="processor" id="processor-mode" />
                <Label htmlFor="processor-mode" className="text-sm">Merchant</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

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
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Both" id="both-type" />
                  <Label htmlFor="both-type" className="text-sm">Both</Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RoleSwitcher;