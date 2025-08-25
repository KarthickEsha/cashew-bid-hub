import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useProfile } from '@/hooks/useProfile';
import { ProductType } from '@/types/user';

interface ProductTypeToggleProps {
  currentType: ProductType;
  onTypeChange: (type: ProductType) => void;
  disabled?: boolean;
}

const ProductTypeToggle = ({ currentType, onTypeChange, disabled }: ProductTypeToggleProps) => {
  const { profile } = useProfile();

  // Only show toggle if user selected "Both" in profile
  if (profile?.productType !== 'Both') {
    return null;
  }

  const handleToggle = (checked: boolean) => {
    onTypeChange(checked ? 'Kernel' : 'RCN');
  };

  return (
    <div className="flex items-center space-x-2 p-3 bg-accent/50 rounded-lg">
      <Label htmlFor="product-type-toggle" className="text-sm font-medium">
        Product Type:
      </Label>
      <div className="flex items-center space-x-2">
        <span className={`text-sm ${currentType === 'RCN' ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
          RCN
        </span>
        <Switch
          id="product-type-toggle"
          checked={currentType === 'Kernel'}
          onCheckedChange={handleToggle}
          disabled={disabled}
        />
        <span className={`text-sm ${currentType === 'Kernel' ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
          Kernel
        </span>
      </div>
    </div>
  );
};

export default ProductTypeToggle;