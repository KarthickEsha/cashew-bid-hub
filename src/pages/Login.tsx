import { SignIn } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">CM</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-primary">
              Cashew Marketplace
            </CardTitle>
            <p className="text-muted-foreground">
              Connect with premium cashew suppliers worldwide
            </p>
          </CardHeader>
          <CardContent>
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-0 p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "bg-primary hover:bg-primary/90 text-white",
                  formButtonPrimary: "bg-primary hover:bg-primary/90",
                  footerActionLink: "text-primary hover:text-primary/80"
                }
              }}
              fallbackRedirectUrl="/"
              forceRedirectUrl="/"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;