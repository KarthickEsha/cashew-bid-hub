import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, MapPin, Building2, Edit, Settings, LogOut } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useProfile } from '@/hooks/useProfile';
import { useRole } from '@/hooks/useRole';

interface ProfilePanelProps {
  children: React.ReactNode;
}

const ProfilePanel = ({ children }: ProfilePanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const { profile } = useProfile();
  const { role } = useRole();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.profilePicture} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {profile?.name?.charAt(0) || user?.firstName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">
                {profile?.name || user?.fullName || 'User'}
              </h3>
              <Badge variant="secondary" className="mt-1">
                {role === 'buyer' ? 'Buyer' : 'Merchant'}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Profile Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{profile?.email || user?.primaryEmailAddress?.emailAddress}</span>
            </div>
            
            {profile?.address && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{profile.address}</span>
              </div>
            )}
            
            {profile?.location && (
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfilePanel;