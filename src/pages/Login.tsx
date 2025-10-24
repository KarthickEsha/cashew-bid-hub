import { SignIn } from "@clerk/clerk-react";
import EnableNotifications from "@/components/EnableNotifications";

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4 relative">
      {/* Enable Notifications banner at the top (fixed, component handles positioning) */}
      <EnableNotifications />
      <div className="w-full max-w-sm text-center">
        {/* Logo */}
        {/* <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">CM</span>
          </div>
        </div> */}

        {/* Title & Subtitle */}
        <h1 className="text-2xl font-bold text-primary">Cashew Marketplace</h1>
        <p className="text-muted-foreground mb-6">
          Connect with premium cashew suppliers worldwide
        </p>

        {/* SignIn Component */}
        <SignIn
          fallbackRedirectUrl="/"
          forceRedirectUrl="/"
        />
      </div>
    </div>
  );
};

export default Login;