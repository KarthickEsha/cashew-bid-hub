import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import ProductDetail from "./pages/ProductDetail";
import MyRequests from "./pages/MyRequests";
import PostRequirement from "./pages/PostRequirement";
import MyRequirements from "./pages/MyRequirements";
import MyBids from "./pages/MyBids";
import MyOrders from "./pages/MyOrders";
import EditRequirement from "./pages/EditRequirement";
import Responses from "./pages/Responses";
import RequestDetails from "./pages/RequestDetails";
import RequirementDetails from "./pages/RequirementDetails";
import ProductDetailsView from "./pages/ProductDetailsView";
import NotFound from "./pages/NotFound";
import MerchantProducts from "./pages/merchant/MerchantProducts";
import MerchantAddProduct from "./pages/merchant/MerchantAddProduct";
import MerchantEnquiries from "./pages/merchant/MerchantEnquiries";
import MerchantOrders from "./pages/merchant/MerchantOrders";
import MerchantRequirements from "./pages/merchant/MerchantRequirements";
import { useRole } from "./hooks/useRole";
import MerchantDashboard from "./pages/merchant/MerchantDashboard";
import ProfileSetup from "./pages/ProfileSetup";
import { useProfile } from "./hooks/useProfile";
import ViewAllProducts from "./pages/ViewAllProducts";
import Login from "./pages/Login";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}



const queryClient = new QueryClient();
// You need to provide your Clerk publishable key here
const PUBLISHABLE_KEY = "pk_test_ZmVhc2libGUtYnVmZmFsby02NS5jbGVyay5hY2NvdW50cy5kZXYk";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY to your environment variables.");
}

const AppContent = () => {
  const { isSignedIn } = useAuth();
  const { role } = useRole();
  const { profile } = useProfile();
  
  // Show login if not signed in
  if (!isSignedIn) {
    return <Login />;
  }
  
  // Show profile setup if profile is not complete
  if (!profile?.isProfileComplete) {
    return <ProfileSetup />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={role === 'processor' ? <MerchantDashboard /> : <Dashboard />} />
        <Route path="/merchant/:merchantId/products" element={<ViewAllProducts />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/my-requests" element={<MyRequests />} />
        <Route path="/my-bids" element={<MyBids />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/post-requirement" element={<PostRequirement />} />
        <Route path="/my-requirements" element={<MyRequirements />} />
        <Route path="/edit-requirement/:id" element={<EditRequirement />} />
        <Route path="/responses" element={<Responses />} />
        <Route path="/request/:id" element={<RequestDetails />} />
        <Route path="/requirement/:id" element={<RequirementDetails />} />
        <Route path="/merchant/:merchantName/products" element={<ProductDetailsView />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
      
        {/* Merchant Routes */}
        <Route path="/merchant/products" element={<MerchantProducts />} />
        <Route path="/merchant/add-product" element={<MerchantAddProduct />} />
        <Route path="/merchant/enquiries" element={<MerchantEnquiries />} />
        <Route path="/merchant/orders" element={<MerchantOrders />} />
        <Route path="/merchant/requirements" element={<MerchantRequirements />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

const App = () => {

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );

}  

export default App;