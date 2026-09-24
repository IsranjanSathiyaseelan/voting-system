import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/authService";

const AdminGuard = () => {
  const { user } = useAuth();
  const token = authService.getStoredToken();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }
  const hasAdminRole = [
    "SUPER_ADMIN",
    "ORGANIZATION_ADMIN",
    "ELECTION_MANAGER",
    "ADMIN",
  ].includes(user.role);

  if (!hasAdminRole) {
    return <Navigate to="/organizations" replace />;
  }
  return <Outlet />;
};

export default AdminGuard;
