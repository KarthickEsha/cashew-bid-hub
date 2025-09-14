import { useState } from "react";
import { useRole } from "@/hooks/useRole";
import { useProfile } from "@/hooks/useProfile";
import { ProductType } from "@/types/user";
import { useNavigate } from "react-router-dom";

const RoleSwitcher = () => {
  const { setRole } = useRole();
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();

  const [selectedProductType, setSelectedProductType] = useState<ProductType>(
    profile?.productType || "Both"
  );

  // 🔑 Handle product type change
  const handleProductTypeChange = (newProductType: ProductType) => {
    setSelectedProductType(newProductType);
    
    if (profile) {
      updateProfile({ productType: newProductType });
    }

    navigate("/");
  };
  const selectedProduct = profile?.dealingWith || "Both";
  // Determine which buttons to show
  const shouldShowRCN = selectedProduct === "Both" || selectedProduct === "RCN";
  const shouldShowKernel = selectedProduct === "Both" || selectedProduct === "Kernel";
  const buttonWidth = selectedProduct === "Both" ? "w-1/2" : "w-full";

  return (
    <div className="flex justify-center items-center">
      <div className="flex w-64 bg-gray-100 rounded-full shadow-md border border-gray-200 overflow-hidden">
        {/* RCN Button */}
        {shouldShowRCN && (
          <button
            onClick={() => handleProductTypeChange("RCN")}
            className={`${buttonWidth} py-2 flex items-center justify-center gap-2 font-semibold transition-colors duration-300 ${
              selectedProductType === "RCN"
                ? "bg-amber-500 text-white"
                : "bg-transparent text-gray-600 hover:bg-gray-200"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 512 512"
            >
              <path d="M256 32c-97 0-176 79-176 176s79 176 176 176 176-79 176-176S353 32 256 32z" />
            </svg>
            RCN
          </button>
        )}

        {/* Kernel Button */}
        {shouldShowKernel && (
          <button
            onClick={() => handleProductTypeChange("Kernel")}
            className={`${buttonWidth} py-2 flex items-center justify-center gap-2 font-semibold transition-colors duration-300 ${
              selectedProductType === "Kernel"
                ? "bg-orange-500 text-white"
                : "bg-transparent text-gray-600 hover:bg-gray-200"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2c-4 0-7 3-7 7 0 3 1.5 5.5 4 6.5V22h6v-6.5c2.5-1 4-3.5 4-6.5 0-4-3-7-7-7z" />
            </svg>
            Kernel
          </button>
        )}
      </div>
    </div>
  );
};

export default RoleSwitcher;
