import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const AdminGuard = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  if (user.role !== "ADMIN") {
    return <Navigate to="/Home" replace />;
  }
  return <Outlet />;
};

export default AdminGuard;
