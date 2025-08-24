import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import ProductDetail from "./pages/ProductDetail";
import MyRequests from "./pages/MyRequests";
import PostRequirement from "./pages/PostRequirement";
import MyRequirements from "./pages/MyRequirements";
import EditRequirement from "./pages/EditRequirement";
import Responses from "./pages/Responses";
import NotFound from "./pages/NotFound";
import MerchantDashboard from "./pages/merchant/MerchantDashboard";
import MerchantProducts from "./pages/merchant/MerchantProducts";
import MerchantAddProduct from "./pages/merchant/MerchantAddProduct";
import MerchantEnquiries from "./pages/merchant/MerchantEnquiries";
import MerchantOrders from "./pages/merchant/MerchantOrders";
import MerchantRequirements from "./pages/merchant/MerchantRequirements";
import { useRole } from "./hooks/useRole";

const queryClient = new QueryClient();

const AppContent = () => {
  const { role } = useRole();

  return (
    <Routes>
      {/* Login route without Layout */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected routes with Layout */}
      <Route path="/*" element={
        <Layout>
          <Routes>
            <Route path="/" element={role === 'processor' ? <MerchantDashboard /> : <Dashboard />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/my-requests" element={<MyRequests />} />
            <Route path="/post-requirement" element={<PostRequirement />} />
            <Route path="/my-requirements" element={<MyRequirements />} />
            <Route path="/edit-requirement/:id" element={<EditRequirement />} />
            <Route path="/responses" element={<Responses />} />
            
            {/* Merchant Routes */}
            <Route path="/merchant/products" element={<MerchantProducts />} />
            <Route path="/merchant/add-product" element={<MerchantAddProduct />} />
            <Route path="/merchant/enquiries" element={<MerchantEnquiries />} />
            <Route path="/merchant/orders" element={<MerchantOrders />} />
            <Route path="/merchant/requirements" element={<MerchantRequirements />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
