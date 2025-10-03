import { Navigate, Outlet } from "react-router-dom";

const ADMIN_TOKEN_KEY = "admin_token";

const AdminProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const token = typeof window !== "undefined" ? localStorage.getItem(ADMIN_TOKEN_KEY) : null;

  if (!token) {
    return <Navigate to="/admin" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export { ADMIN_TOKEN_KEY };
export default AdminProtectedRoute;
